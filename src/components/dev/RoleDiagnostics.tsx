import React, { useState, useEffect } from 'react';
import { useUserPermissions, UserRole } from '../../hooks/useUserPermissions';

export const RoleDiagnostics: React.FC = () => {
  const { currentRole, getRoleDisplayName, getBaseUserType } = useUserPermissions();
  const [storageRole, setStorageRole] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const checkStorage = () => {
      const role = localStorage.getItem('userRole');
      setStorageRole(role);
    };

    checkStorage();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkStorage();
      setRefreshCount(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userRoleChange', handleStorageChange);
    window.addEventListener('roleChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRoleChange', handleStorageChange);
      window.removeEventListener('roleChanged', handleStorageChange);
    };
  }, []);

  const forceRoleUpdate = (role: UserRole) => {
    localStorage.setItem('userRole', role);
    window.dispatchEvent(new CustomEvent('userRoleChange', { detail: { role } }));
    // Don't reload - let the components update naturally
    setRefreshCount(prev => prev + 1);
  };

  const clearRole = () => {
    localStorage.removeItem('userRole');
    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">🔍 Role Diagnostics</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Current Role (Hook):</span>
          <span className="text-blue-600">{currentRole || 'undefined'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Storage Role:</span>
          <span className="text-green-600">{storageRole || 'null'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Display Name:</span>
          <span className="text-purple-600">{getRoleDisplayName(currentRole)}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Base Type:</span>
          <span className="text-orange-600">{getBaseUserType(currentRole)}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Refresh Count:</span>
          <span className="text-gray-600">{refreshCount}</span>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => forceRoleUpdate(UserRole.BORROWER_OWNER)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Set Borrower Owner
          </button>
          <button
            onClick={() => forceRoleUpdate(UserRole.BORROWER_CFO)}
            className="text-xs bg-blue-400 text-white px-2 py-1 rounded hover:bg-blue-500"
          >
            Set Borrower CFO
          </button>
          <button
            onClick={() => forceRoleUpdate(UserRole.LENDER_CCO)}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Set Lender CCO
          </button>
          <button
            onClick={() => forceRoleUpdate(UserRole.LENDER_UNDERWRITER)}
            className="text-xs bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500"
          >
            Set Lender UW
          </button>
          <button
            onClick={() => forceRoleUpdate(UserRole.BROKER_PRINCIPAL)}
            className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
          >
            Set Broker Principal
          </button>
          <button
            onClick={() => forceRoleUpdate(UserRole.VENDOR_OWNER)}
            className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
          >
            Set Vendor Owner
          </button>
          <button
            onClick={clearRole}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Clear Role
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
          >
            Force Reload
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-gray-500 mb-1">Console Commands:</p>
        <code className="text-xs bg-gray-100 p-2 rounded block">
          localStorage.getItem('userRole')
          <br />
          localStorage.setItem('userRole', 'borrower-owner')
          <br />
          window.location.reload()
        </code>
      </div>
    </div>
  );
};

export default RoleDiagnostics;
