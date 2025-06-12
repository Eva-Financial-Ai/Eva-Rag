import { UserRole } from '../hooks/useUserPermissions';

export class RoleDiagnostics {
  static runDiagnostics(): void {
    console.group('🔍 Role Change Diagnostics');

    // Check localStorage
    const storedRole = localStorage.getItem('userRole');
    console.log('1. LocalStorage userRole:', storedRole || 'NOT SET');

    // Check if role is valid
    const validRoles = Object.values(UserRole);
    if (storedRole) {
      const isValid = validRoles.includes(storedRole as UserRole);
      console.log('2. Is stored role valid?', isValid ? '✅ YES' : '❌ NO');
      if (!isValid) {
        console.log('   Valid roles:', validRoles);
      }
    }

    // Check event listeners
    const eventListeners = (window as any)._getEventListeners?.('userRoleChange') || [];
    console.log('3. Event listeners for userRoleChange:', eventListeners.length);

    // Check current page
    console.log('4. Current URL:', window.location.href);
    console.log('5. Current pathname:', window.location.pathname);

    // Check if page reloaded
    const lastReload = sessionStorage.getItem('lastReloadTime');
    const now = Date.now();
    if (lastReload) {
      const timeSinceReload = now - parseInt(lastReload);
      console.log('6. Time since last reload:', timeSinceReload + 'ms');
    }
    sessionStorage.setItem('lastReloadTime', now.toString());

    // Check role change history
    const roleHistory = JSON.parse(sessionStorage.getItem('roleChangeHistory') || '[]');
    console.log('7. Role change history:', roleHistory);

    console.groupEnd();
  }

  static logRoleChange(oldRole: string, newRole: string): void {
    const history = JSON.parse(sessionStorage.getItem('roleChangeHistory') || '[]');
    history.push({
      from: oldRole,
      to: newRole,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
    // Keep only last 10 changes
    if (history.length > 10) {
      history.shift();
    }
    sessionStorage.setItem('roleChangeHistory', JSON.stringify(history));
  }

  static simulateRoleChange(newRole: UserRole): void {
    console.group('🔄 Simulating Role Change');

    const oldRole = localStorage.getItem('userRole');
    console.log('Old role:', oldRole);
    console.log('New role:', newRole);

    // Set in localStorage
    localStorage.setItem('userRole', newRole);
    console.log('✅ Updated localStorage');

    // Dispatch event
    const event = new CustomEvent('userRoleChange', { detail: { role: newRole } });
    window.dispatchEvent(event);
    console.log('✅ Dispatched userRoleChange event');

    // Log the change
    this.logRoleChange(oldRole || 'none', newRole);

    console.log('⏳ Waiting 1 second before reload...');
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload();
    }, 1000);

    console.groupEnd();
  }

  static attachToWindow(): void {
    (window as any).roleDiagnostics = {
      run: this.runDiagnostics,
      simulateChange: this.simulateRoleChange,
      validRoles: Object.values(UserRole),
    };
    console.log('✅ Role diagnostics attached to window.roleDiagnostics');
    console.log('   - Run diagnostics: window.roleDiagnostics.run()');
    console.log('   - Simulate change: window.roleDiagnostics.simulateChange("lender-cco")');
    console.log('   - See valid roles: window.roleDiagnostics.validRoles');
  }
}
