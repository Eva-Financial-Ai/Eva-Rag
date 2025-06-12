import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BorrowerDashboard from './BorrowerDashboard';
import VendorDashboard from './VendorDashboard';
import BrokerDashboard from './BrokerDashboard';
import LenderDashboard from './LenderDashboard';

// Simple mock for user authentication
// In a real app, this would come from your auth context or state management
interface User {
  id: string;
  role: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
  name: string;
  email: string;
}

// Store selected role in localStorage to persist between refreshes
const getStoredRole = (): User['role'] => {
  const storedRole = localStorage.getItem('userRole');
  if (storedRole && ['borrower', 'vendor', 'broker', 'lender', 'admin'].includes(storedRole)) {
    return storedRole as User['role'];
  }
  return 'broker'; // Default role
};

// Listen for storage events to detect changes in userRole from other components
const createStorageListener = (callback: (role: User['role']) => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'userRole' && event.newValue) {
      if (['borrower', 'vendor', 'broker', 'lender', 'admin'].includes(event.newValue)) {
        callback(event.newValue as User['role']);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
};

// Mock function to get the current user
const useCurrentUser = (): {
  user: User | null;
  loading: boolean;
  setUserRole: (role: User['role']) => void;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<User['role']>(getStoredRole());

  // Update user when role changes
  const updateUserRole = (role: User['role']) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    // Update user with new role
    setUser(prev => (prev ? { ...prev, role } : null));
  };

  useEffect(() => {
    // Simulate API request
    setLoading(true);
    setTimeout(() => {
      // Mock user - in a real app, you'd fetch this from an API
      setUser({
        id: 'user-123',
        role: userRole,
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
      setLoading(false);
    }, 300);
  }, [userRole]);

  // Set up storage listener to react to changes made by other components
  useEffect(() => {
    // Listen for the custom userRoleChange event from DashboardLayout
    const handleCustomEvent = (event: CustomEvent<{ role: User['role'] }>) => {
      updateUserRole(event.detail.role);
    };

    window.addEventListener('userRoleChange', handleCustomEvent as EventListener);

    // Also listen for storage events (works across tabs)
    const cleanupStorageListener = createStorageListener(newRole => {
      updateUserRole(newRole);
    });

    return () => {
      window.removeEventListener('userRoleChange', handleCustomEvent as EventListener);
      cleanupStorageListener();
    };
  }, []);

  return { user, loading, setUserRole: updateUserRole };
};

const RoleDashboard: React.FC = () => {
  const { user, loading, setUserRole } = useCurrentUser();
  const navigate = useNavigate();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If no user is found, redirect to login
  if (!user) {
    // In a real app, you might want to redirect to login
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No user found</h1>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role with the user type selector
  const renderDashboard = () => {
    // Include the UserTypeSelector with all dashboards
    const dashboard = (() => {
      switch (user.role) {
        case 'borrower':
          return <BorrowerDashboard user={user} />;
        case 'vendor':
          return <VendorDashboard user={user} />;
        case 'broker':
          return <BrokerDashboard user={user} />;
        case 'lender':
          return <LenderDashboard user={user} />;
        case 'admin':
          // Admin could see a different dashboard or have access to all dashboards
          return <LenderDashboard user={user} />;
        default:
          // Default to borrower dashboard if role is unknown
          return <BorrowerDashboard user={user} />;
      }
    })();

    return (
      <>
        {dashboard}
        {/* User type selection moved to TopNavbar */}
      </>
    );
  };

  return renderDashboard();
};

export default RoleDashboard;
