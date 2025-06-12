import { NavigateFunction } from 'react-router-dom';

import { debugLog } from '../utils/auditLogger';

export interface RouterConfig {
  navigate: NavigateFunction;
  fallbackRedirect?: string;
  enableLogging?: boolean;
}

export class NavigationRouterService {
  private static instance: NavigationRouterService;
  private navigate: NavigateFunction | null = null;
  private fallbackRedirect: string = '/dashboard';
  private enableLogging: boolean = true;

  private constructor() {
    // Initialize window.EVARouter for global access
    if (typeof window !== 'undefined') {
      window.EVARouter = {
        navigate: this.safeNavigate.bind(this),
      };
    }
  }

  public static getInstance(): NavigationRouterService {
    if (!NavigationRouterService.instance) {
      NavigationRouterService.instance = new NavigationRouterService();
    }
    return NavigationRouterService.instance;
  }

  public configure(config: RouterConfig): void {
    this.navigate = config.navigate;
    this.fallbackRedirect = config.fallbackRedirect || '/dashboard';
    this.enableLogging = config.enableLogging !== false;

    if (this.enableLogging) {
      debugLog('general', 'log_statement', '[NavigationRouterService] Configured with navigate function')
    }
  }

  public safeNavigate = (path: string, options?: { replace?: boolean; state?: any }): void => {
    try {
      if (this.enableLogging) {
        debugLog('general', 'log_statement', '[NavigationRouterService] Navigating to:', path)
      }

      // Validate path
      if (!path || typeof path !== 'string') {
        throw new Error('Invalid navigation path');
      }

      // Handle external URLs
      if (path.startsWith('http://') || path.startsWith('https://')) {
        window.open(path, '_blank', 'noopener,noreferrer');
        return;
      }

      // Use React Router if available
      if (this.navigate) {
        this.navigate(path, options);
        return;
      }

      // Fallback to window.location
      this.log('React Router navigate not available, using window.location');
      if (options?.replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    } catch (error) {
      this.handleNavigationError(error, path);
    }
  };

  private handleNavigationError(error: any, originalPath: string): void {
    console.error('[NavigationRouterService] Navigation error:', error);

    try {
      // Try fallback redirect
      if (originalPath !== this.fallbackRedirect) {
        this.log(`Attempting fallback navigation to: ${this.fallbackRedirect}`);
        window.location.href = this.fallbackRedirect;
      } else {
        // Ultimate fallback - go to root
        this.log('Fallback failed, navigating to root');
        window.location.href = '/';
      }
    } catch (fallbackError) {
      console.error('[NavigationRouterService] Fallback navigation failed:', fallbackError);
      // Last resort - refresh the page
      window.location.reload();
    }
  }

  public goBack(): void {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.safeNavigate(this.fallbackRedirect);
      }
    } catch (error) {
      this.handleNavigationError(error, 'back');
    }
  }

  public goForward(): void {
    try {
      window.history.forward();
    } catch (error) {
      console.error('[NavigationRouterService] Forward navigation failed:', error);
    }
  }

  public refresh(): void {
    try {
      window.location.reload();
    } catch (error) {
      console.error('[NavigationRouterService] Page refresh failed:', error);
    }
  }

  public getCurrentPath(): string {
    try {
      return window.location.pathname + window.location.search + window.location.hash;
    } catch (error) {
      console.error('[NavigationRouterService] Failed to get current path:', error);
      return '/';
    }
  }

  public isExternalUrl(url: string): boolean {
    try {
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
    } catch (error) {
      return false;
    }
  }

  public validatePath(path: string): boolean {
    try {
      // Basic path validation
      if (!path || typeof path !== 'string') {
        return false;
      }

      // Check for dangerous patterns
      const dangerousPatterns = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        '<script',
        'onload=',
        'onerror=',
      ];

      const lowerPath = path.toLowerCase();
      return !dangerousPatterns.some(pattern => lowerPath.includes(pattern));
    } catch (error) {
      return false;
    }
  }

  public buildUrl(basePath: string, params?: Record<string, string>): string {
    try {
      let url = basePath;

      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.set(key, value);
          }
        });

        const queryString = searchParams.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }

      return url;
    } catch (error) {
      console.error('[NavigationRouterService] Failed to build URL:', error);
      return basePath;
    }
  }

  public parseUrlParams(url?: string): Record<string, string> {
    try {
      const targetUrl = url || window.location.search;
      const params = new URLSearchParams(targetUrl);
      const result: Record<string, string> = {};

      params.forEach((value, key) => {
        result[key] = value;
      });

      return result;
    } catch (error) {
      console.error('[NavigationRouterService] Failed to parse URL params:', error);
      return {};
    }
  }

  public addQueryParam(key: string, value: string): void {
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set(key, value);
      this.safeNavigate(currentUrl.pathname + currentUrl.search, { replace: true });
    } catch (error) {
      console.error('[NavigationRouterService] Failed to add query param:', error);
    }
  }

  public removeQueryParam(key: string): void {
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete(key);
      this.safeNavigate(currentUrl.pathname + currentUrl.search, { replace: true });
    } catch (error) {
      console.error('[NavigationRouterService] Failed to remove query param:', error);
    }
  }

  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      debugLog('general', 'log_statement', `[NavigationRouterService] ${message}`, data || '')
    }
  }

  public getNavigateFunction(): NavigateFunction | null {
    return this.navigate;
  }

  public isConfigured(): boolean {
    return this.navigate !== null;
  }

  public destroy(): void {
    this.navigate = null;
    if (typeof window !== 'undefined' && window.EVARouter) {
      delete window.EVARouter;
    }
    NavigationRouterService.instance = null as any;
  }
}

// Global type augmentation
declare global {
  interface Window {
    EVARouter?: {
      navigate: (path: string, options?: { replace?: boolean; state?: any }) => void;
    };
  }
}

export default NavigationRouterService;
