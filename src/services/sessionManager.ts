import { debugLog } from '../utils/auditLogger';

/**
 * Session Management Service with Cloudflare KV Integration
 * Handles user session persistence, credit application state, and caching
 */

interface SessionData {
  userId: string;
  userRole: string;
  creditApplicationState?: any;
  lastActivity: number;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
}

interface CloudflareConfig {
  accountId: string;
  namespaceId: string;
  apiToken: string;
  environment: 'development' | 'staging' | 'production';
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: Map<string, SessionData> = new Map();
  private throttleMap: Map<string, number> = new Map();
  private cloudflareConfig: CloudflareConfig | null = null;
  private readonly THROTTLE_DELAY = 1000; // 1 second minimum between calls
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.initializeCloudflareConfig();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private initializeCloudflareConfig(): void {
    // Initialize Cloudflare configuration based on environment
    const environment = process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development';
    
    this.cloudflareConfig = {
      accountId: process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID || '',
      namespaceId: this.getNamespaceId(environment),
      apiToken: process.env.REACT_APP_CLOUDFLARE_API_TOKEN || '',
      environment
    };

    debugLog('general', 'log_statement', `[SessionManager] Initialized for ${environment} environment`)
  }

  private getNamespaceId(environment: string): string {
    switch (environment) {
      case 'production':
        return '3c32a3731dcf444fa788804d20587d43'; // USER_SESSIONS production
      case 'staging':
        return 'f346967a345844229ad76d33228b5131'; // USER_SESSIONS preview
      default:
        return 'f346967a345844229ad76d33228b5131'; // USER_SESSIONS preview for dev
    }
  }

  /**
   * Throttle function calls to prevent excessive API requests
   */
  private throttle<T extends (...args: any[]) => Promise<any>>(
    func: T, 
    key: string
  ): T {
    return ((...args: any[]) => {
      const now = Date.now();
      const lastCall = this.throttleMap.get(key) || 0;
      
      if (now - lastCall < this.THROTTLE_DELAY) {
        console.warn(`[SessionManager] Throttled call for key: ${key}`);
        return Promise.resolve(null);
      }
      
      this.throttleMap.set(key, now);
      return func(...args);
    }) as T;
  }

  /**
   * Save session to Cloudflare KV (throttled)
   */
  private saveToCloudflareKV = this.throttle(async (sessionId: string, data: SessionData): Promise<void> => {
    if (!this.cloudflareConfig?.apiToken) {
      console.warn('[SessionManager] Cloudflare not configured, using localStorage fallback');
      this.saveToLocalStorage(sessionId, data);
      return;
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareConfig.accountId}/storage/kv/namespaces/${this.cloudflareConfig.namespaceId}/values/${sessionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            lastActivity: Date.now(),
            environment: this.cloudflareConfig.environment
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudflare KV error: ${response.status}`);
      }

      debugLog('general', 'log_statement', `[SessionManager] Session saved to Cloudflare KV: ${sessionId}`)
    } catch (error) {
      console.error('[SessionManager] Failed to save to Cloudflare KV:', error);
      // Fallback to localStorage
      this.saveToLocalStorage(sessionId, data);
    }
  }, 'saveSession');

  /**
   * Load session from Cloudflare KV (throttled)
   */
  private loadFromCloudflareKV = this.throttle(async (sessionId: string): Promise<SessionData | null> => {
    if (!this.cloudflareConfig?.apiToken) {
      return this.loadFromLocalStorage(sessionId);
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareConfig.accountId}/storage/kv/namespaces/${this.cloudflareConfig.namespaceId}/values/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          }
        }
      );

      if (response.status === 404) {
        return null; // Session doesn't exist
      }

      if (!response.ok) {
        throw new Error(`Cloudflare KV error: ${response.status}`);
      }

      const data = await response.json();
      debugLog('general', 'log_statement', `[SessionManager] Session loaded from Cloudflare KV: ${sessionId}`)
      return data;
    } catch (error) {
      console.error('[SessionManager] Failed to load from Cloudflare KV:', error);
      return this.loadFromLocalStorage(sessionId);
    }
  }, 'loadSession');

  /**
   * Fallback: Save to localStorage
   */
  private saveToLocalStorage(sessionId: string, data: SessionData): void {
    try {
      localStorage.setItem(`eva_session_${sessionId}`, JSON.stringify(data));
      debugLog('general', 'log_statement', `[SessionManager] Session saved to localStorage: ${sessionId}`)
    } catch (error) {
      console.error('[SessionManager] Failed to save to localStorage:', error);
    }
  }

  /**
   * Fallback: Load from localStorage
   */
  private loadFromLocalStorage(sessionId: string): SessionData | null {
    try {
      const stored = localStorage.getItem(`eva_session_${sessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        debugLog('general', 'log_statement', `[SessionManager] Session loaded from localStorage: ${sessionId}`)
        return data;
      }
    } catch (error) {
      console.error('[SessionManager] Failed to load from localStorage:', error);
    }
    return null;
  }

  /**
   * Create or update a user session
   */
  public async createSession(userId: string, userRole: string, additionalData?: any): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const sessionData: SessionData = {
      userId,
      userRole,
      lastActivity: now,
      expiresAt: now + this.SESSION_TIMEOUT,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      ...additionalData
    };

    // Store in memory for quick access
    this.sessionData.set(sessionId, sessionData);
    
    // Save to Cloudflare KV (with throttling)
    await this.saveToCloudflareKV(sessionId, sessionData);
    
    return sessionId;
  }

  /**
   * Get session data
   */
  public async getSession(sessionId: string): Promise<SessionData | null> {
    // Check memory first
    let sessionData = this.sessionData.get(sessionId);
    
    if (!sessionData) {
      // Load from Cloudflare KV
      sessionData = await this.loadFromCloudflareKV(sessionId);
      if (sessionData) {
        this.sessionData.set(sessionId, sessionData);
      }
    }

    // Check if session is expired
    if (sessionData && Date.now() > sessionData.expiresAt) {
      await this.deleteSession(sessionId);
      return null;
    }

    return sessionData;
  }

  /**
   * Update session data (for credit application progress)
   */
  public async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
    const sessionData = await this.getSession(sessionId);
    if (!sessionData) {
      return false;
    }

    const updatedData = {
      ...sessionData,
      ...updates,
      lastActivity: Date.now()
    };

    this.sessionData.set(sessionId, updatedData);
    await this.saveToCloudflareKV(sessionId, updatedData);
    
    return true;
  }

  /**
   * Save credit application progress
   */
  public async saveCreditApplicationProgress(
    sessionId: string, 
    step: number, 
    formData: any
  ): Promise<boolean> {
    return this.updateSession(sessionId, {
      creditApplicationState: {
        currentStep: step,
        formData,
        lastSaved: Date.now()
      }
    });
  }

  /**
   * Get credit application progress
   */
  public async getCreditApplicationProgress(sessionId: string): Promise<any> {
    const session = await this.getSession(sessionId);
    return session?.creditApplicationState || null;
  }

  /**
   * Delete session
   */
  public async deleteSession(sessionId: string): Promise<void> {
    this.sessionData.delete(sessionId);
    
    if (this.cloudflareConfig?.apiToken) {
      try {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareConfig.accountId}/storage/kv/namespaces/${this.cloudflareConfig.namespaceId}/values/${sessionId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
            }
          }
        );
      } catch (error) {
        console.error('[SessionManager] Failed to delete from Cloudflare KV:', error);
      }
    }
    
    // Also remove from localStorage
    localStorage.removeItem(`eva_session_${sessionId}`);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `eva_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address (for analytics and security)
   */
  private async getClientIP(): Promise<string> {
    try {
      // Use Cloudflare's IP detection if available
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const text = await response.text();
      const ipMatch = text.match(/ip=(.+)/);
      return ipMatch ? ipMatch[1] : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Cleanup expired sessions (run periodically)
   */
  public async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, sessionData] of this.sessionData.entries()) {
      if (now > sessionData.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      await this.deleteSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      debugLog('general', 'log_statement', `[SessionManager] Cleaned up ${expiredSessions.length} expired sessions`)
    }
  }
}

export default SessionManager; 