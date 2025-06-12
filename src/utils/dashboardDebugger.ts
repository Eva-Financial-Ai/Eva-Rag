import { UserRole } from '../hooks/useUserPermissions';

import { debugLog } from './auditLogger';

export interface DashboardDebugInfo {
  currentRole: string;
  effectiveRole: string;
  baseUserType: string;
  localStorage: {
    userRole: string | null;
  };
  expectedMetrics: string[];
  timestamp: string;
}

export class DashboardDebugger {
  private static instance: DashboardDebugger;
  private debugLog: DashboardDebugInfo[] = [];

  private constructor() {}

  static getInstance(): DashboardDebugger {
    if (!DashboardDebugger.instance) {
      DashboardDebugger.instance = new DashboardDebugger();
    }
    return DashboardDebugger.instance;
  }

  logDashboardState(info: Omit<DashboardDebugInfo, 'timestamp'>): void {
    const debugInfo: DashboardDebugInfo = {
      ...info,
      timestamp: new Date().toISOString(),
    };

    this.debugLog.push(debugInfo);

    // Log to console with formatting
    console.group('🔍 Dashboard Debug Info');
    debugLog('general', 'log_statement', 'Timestamp:', debugInfo.timestamp)
    debugLog('general', 'log_statement', 'Current Role:', debugInfo.currentRole)
    debugLog('general', 'log_statement', 'Effective Role:', debugInfo.effectiveRole)
    debugLog('general', 'log_statement', 'Base User Type:', debugInfo.baseUserType)
    debugLog('general', 'log_statement', 'LocalStorage userRole:', debugInfo.localStorage.userRole)
    debugLog('general', 'log_statement', 'Expected Metrics:', debugInfo.expectedMetrics)
    console.groupEnd();

    // Store in sessionStorage for debugging
    sessionStorage.setItem('dashboardDebugLog', JSON.stringify(this.debugLog));
  }

  getDebugLog(): DashboardDebugInfo[] {
    return this.debugLog;
  }

  clearDebugLog(): void {
    this.debugLog = [];
    sessionStorage.removeItem('dashboardDebugLog');
  }

  // Helper to determine expected metrics based on role
  static getExpectedMetrics(effectiveRole: UserRole): string[] {
    switch (effectiveRole) {
      case UserRole.BORROWER_OWNER:
      case UserRole.BORROWER_CFO:
        return ['Total Loan Amount', 'Active Applications', 'Approval Rate', 'Avg Processing Time'];

      case UserRole.BORROWER_CONTROLLER:
      case UserRole.BORROWER_ACCOUNTING:
        return ['Pending Documents', 'Active Applications'];

      case UserRole.LENDER_CCO:
      case UserRole.LENDER_SENIOR_UNDERWRITER:
        return ['Portfolio Value', 'Applications in Review', 'Default Rate', 'Avg Loan Size'];

      case UserRole.LENDER_UNDERWRITER:
        return ['My Reviews', 'Pending Analysis', 'Completed Today'];

      case UserRole.BROKER_PRINCIPAL:
      case UserRole.BROKER_MANAGING:
        return ['Commission YTD', 'Active Deals', 'Success Rate', 'Lender Network'];

      case UserRole.VENDOR_OWNER:
      case UserRole.VENDOR_SALES_DIRECTOR:
        return ['Sales Volume', 'Active Listings', 'Conversion Rate', 'Avg Deal Size'];

      case UserRole.SYSTEM_ADMIN:
      case UserRole.EVA_ADMIN:
      case UserRole.COMPLIANCE_OFFICER:
      case UserRole.SUPPORT_REP:
        return ['Total Users', 'System Health', 'Active Sessions', 'Pending Issues'];

      default:
        return ['My Tasks'];
    }
  }

  // Debug helper to check if role is properly set
  static validateRoleSetup(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const storedRole = localStorage.getItem('userRole');

    if (!storedRole) {
      issues.push('No userRole found in localStorage');
    }

    // Check if the stored role is a valid UserRole
    const validRoles = Object.values(UserRole);
    if (storedRole && !validRoles.includes(storedRole as UserRole)) {
      issues.push(`Invalid role in localStorage: ${storedRole}`);
    }

    // Check for role change event listener
    const hasEventListener = window.hasOwnProperty('userRoleChange');
    if (!hasEventListener) {
      console.warn('userRoleChange event listener may not be properly set up');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
