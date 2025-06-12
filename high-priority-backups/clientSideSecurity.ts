/**
 * Client-Side Security Utilities
 * =============================================================================
 * CRITICAL: Protects against dev tools inspection and customer data exposure
 * For financial applications handling sensitive customer information
 * =============================================================================
 */

// Type definitions for security
interface SecurityConfig {
  enableDevToolsDetection: boolean;
  enableDataObfuscation: boolean;
  enableAntiDebug: boolean;
  enableConsoleProtection: boolean;
}

interface SensitiveDataMask {
  ssn?: boolean;
  accountNumber?: boolean;
  creditCard?: boolean;
  phone?: boolean;
  email?: boolean;
}

// Security configuration based on environment
const getSecurityConfig = (): SecurityConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    enableDevToolsDetection: isProduction,
    enableDataObfuscation: true, // Always enabled for financial data
    enableAntiDebug: isProduction,
    enableConsoleProtection: isProduction || !isDevelopment,
  };
};

/**
 * =============================================================================
 * DEV TOOLS DETECTION & PROTECTION
 * =============================================================================
 */

class DevToolsDetector {
  private isDetectionActive = false;
  private warningShown = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startDetection();
  }

  private startDetection(): void {
    const config = getSecurityConfig();
    if (!config.enableDevToolsDetection) return;

    this.isDetectionActive = true;
    this.detectDevTools();

    // Continuous monitoring
    this.intervalId = setInterval(() => {
      this.detectDevTools();
    }, 500);
  }

  private detectDevTools(): void {
    if (!this.isDetectionActive) return;

    // Method 1: Console detection
    const threshold = 160;
    const isConsoleOpen =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold;

    // Method 2: DevTools object detection
    const devtools = {
      open: false,
      orientation: null as 'vertical' | 'horizontal' | null,
    };

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200) {
        devtools.open = true;
        devtools.orientation = 'horizontal';
      } else if (window.outerWidth - window.innerWidth > 200) {
        devtools.open = true;
        devtools.orientation = 'vertical';
      } else {
        devtools.open = false;
        devtools.orientation = null;
      }
    }, 500);

    // Method 3: Timing-based detection
    let devToolsOpen = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function () {
        devToolsOpen = true;
        return 'devtools-detected';
      },
    });

    if (isConsoleOpen || devtools.open || devToolsOpen) {
      this.handleDevToolsDetected();
    }
  }

  private handleDevToolsDetected(): void {
    if (this.warningShown) return;

    this.warningShown = true;

    // Hide sensitive content
    this.hideSensitiveContent();

    // Show warning (in production)
    if (process.env.NODE_ENV === 'production') {
      this.showSecurityWarning();
    }

    // Clear sensitive data from memory
    this.clearSensitiveData();
  }

  private hideSensitiveContent(): void {
    // Hide elements with sensitive data classes
    const sensitiveSelectors = [
      '.sensitive-data',
      '.customer-info',
      '.financial-data',
      '.ssn',
      '.account-number',
      '.credit-card',
      '[data-sensitive="true"]',
    ];

    sensitiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
      });
    });
  }

  private showSecurityWarning(): void {
    // Create modal warning
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <h2 style="color: #dc2626; margin-bottom: 16px;">Security Notice</h2>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          For your security and privacy, access to sensitive financial information
          has been restricted while developer tools are open.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
          Please close the developer tools to continue using the application.
        </p>
        <button onclick="location.reload()" style="
          background: #dc2626;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        ">Reload Page</button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  private clearSensitiveData(): void {
    // Clear localStorage sensitive keys
    const sensitiveKeys = [
      'customer-data',
      'financial-info',
      'auth-token',
      'user-profile',
      'loan-data',
    ];

    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any global variables that might contain sensitive data
    if (typeof window !== 'undefined') {
      (window as any).customerData = null;
      (window as any).financialData = null;
      (window as any).sensitiveInfo = null;
    }
  }

  public stop(): void {
    this.isDetectionActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

/**
 * =============================================================================
 * DATA OBFUSCATION & MASKING
 * =============================================================================
 */

export class DataProtector {
  /**
   * Mask SSN (Social Security Number)
   */
  static maskSSN(ssn: string): string {
    if (!ssn || ssn.length < 9) return '***-**-****';
    return `***-**-${ssn.slice(-4)}`;
  }

  /**
   * Mask account number
   */
  static maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) return '****';
    return `****${accountNumber.slice(-4)}`;
  }

  /**
   * Mask credit card number
   */
  static maskCreditCard(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '****-****-****-****';
    const cleaned = cardNumber.replace(/\D/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  /**
   * Mask email address
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***';
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 ? `${username.slice(0, 2)}***` : '***';
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhone(phone: string): string {
    if (!phone) return '***-***-****';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `***-***-${cleaned.slice(-4)}`;
    }
    return '***-***-****';
  }

  /**
   * Generic sensitive data masker
   */
  static maskSensitiveData(data: any, maskConfig: SensitiveDataMask = {}): any {
    if (typeof data !== 'object' || data === null) return data;

    const masked = { ...data };

    Object.keys(masked).forEach(key => {
      const value = masked[key];
      const lowerKey = key.toLowerCase();

      // SSN masking
      if (maskConfig.ssn !== false && (lowerKey.includes('ssn') || lowerKey.includes('social'))) {
        masked[key] = this.maskSSN(value);
      }

      // Account number masking
      else if (
        maskConfig.accountNumber !== false &&
        (lowerKey.includes('account') || lowerKey.includes('routing'))
      ) {
        masked[key] = this.maskAccountNumber(value);
      }

      // Credit card masking
      else if (
        maskConfig.creditCard !== false &&
        (lowerKey.includes('card') || lowerKey.includes('credit'))
      ) {
        masked[key] = this.maskCreditCard(value);
      }

      // Email masking
      else if (maskConfig.email !== false && lowerKey.includes('email')) {
        masked[key] = this.maskEmail(value);
      }

      // Phone masking
      else if (maskConfig.phone !== false && lowerKey.includes('phone')) {
        masked[key] = this.maskPhone(value);
      }

      // Recursive masking for nested objects
      else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitiveData(value, maskConfig);
      }
    });

    return masked;
  }
}

/**
 * =============================================================================
 * CONSOLE PROTECTION
 * =============================================================================
 */

class ConsoleProtector {
  private originalConsole: Console;

  constructor() {
    this.originalConsole = { ...console };
    this.protectConsole();
  }

  private protectConsole(): void {
    const config = getSecurityConfig();
    if (!config.enableConsoleProtection) return;

    // Override console methods in production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      console.debug = () => {};
      console.table = () => {};
      console.group = () => {};
      console.groupCollapsed = () => {};
      console.groupEnd = () => {};
    } else {
      // In development, filter sensitive data
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        const filteredArgs = args.map(arg => {
          if (typeof arg === 'string' && this.containsSensitiveData(arg)) {
            return '[SENSITIVE DATA FILTERED]';
          }
          if (typeof arg === 'object') {
            return DataProtector.maskSensitiveData(arg);
          }
          return arg;
        });
        originalLog.apply(console, filteredArgs);
      };
    }
  }

  private containsSensitiveData(str: string): boolean {
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
      /\b\d{10,17}\b/, // Account number pattern
      /(password|token|secret|key)/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(str));
  }

  public restore(): void {
    Object.assign(console, this.originalConsole);
  }
}

/**
 * =============================================================================
 * ANTI-DEBUGGING PROTECTION
 * =============================================================================
 */

class AntiDebugProtector {
  constructor() {
    this.enableAntiDebugProtection();
  }

  private enableAntiDebugProtection(): void {
    const config = getSecurityConfig();
    if (!config.enableAntiDebug) return;

    // Disable right-click context menu
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
    document.addEventListener('keydown', e => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
    });

    // Disable drag and drop
    document.addEventListener('dragstart', e => {
      e.preventDefault();
      return false;
    });

    // Disable text selection for sensitive content
    document.addEventListener('selectstart', e => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('sensitive-data')) {
        e.preventDefault();
        return false;
      }
    });
  }
}

/**
 * =============================================================================
 * MAIN SECURITY MANAGER
 * =============================================================================
 */

export class ClientSecurityManager {
  private devToolsDetector: DevToolsDetector | null = null;
  private consoleProtector: ConsoleProtector | null = null;
  private antiDebugProtector: AntiDebugProtector | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const config = getSecurityConfig();

    if (config.enableDevToolsDetection) {
      this.devToolsDetector = new DevToolsDetector();
    }

    if (config.enableConsoleProtection) {
      this.consoleProtector = new ConsoleProtector();
    }

    if (config.enableAntiDebug) {
      this.antiDebugProtector = new AntiDebugProtector();
    }
  }

  /**
   * Mask sensitive data for display
   */
  public maskDataForDisplay(data: any, config?: SensitiveDataMask): any {
    return DataProtector.maskSensitiveData(data, config);
  }

  /**
   * Check if current environment is secure
   */
  public isEnvironmentSecure(): boolean {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasDevTools = !!(window as any).chrome?.devtools;
    const hasConsole = typeof console !== 'undefined';

    return isProduction && !hasDevTools;
  }

  /**
   * Destroy all security protections (for development)
   */
  public destroy(): void {
    if (this.devToolsDetector) {
      this.devToolsDetector.stop();
      this.devToolsDetector = null;
    }

    if (this.consoleProtector) {
      this.consoleProtector.restore();
      this.consoleProtector = null;
    }
  }
}

// Export singleton instance
export const clientSecurity = new ClientSecurityManager();

// Utility functions for easy access
export const maskSSN = DataProtector.maskSSN;
export const maskAccountNumber = DataProtector.maskAccountNumber;
export const maskCreditCard = DataProtector.maskCreditCard;
export const maskEmail = DataProtector.maskEmail;
export const maskPhone = DataProtector.maskPhone;
export const maskSensitiveData = DataProtector.maskSensitiveData.bind(DataProtector);
