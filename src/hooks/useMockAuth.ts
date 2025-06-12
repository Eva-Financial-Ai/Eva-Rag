/**
 * Mock Auth Hook for Demo/Development Mode
 * Provides a simplified auth interface when Auth0 is not configured
 */

import { useState, useCallback, useEffect } from 'react';

interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  phoneNumber?: string;
  picture?: string;
  roles: string[];
  permissions: string[];
}

const DEFAULT_DEMO_USER: MockUser = {
  id: 'demo-user-001',
  email: 'demo@evafi.ai',
  firstName: 'Demo',
  lastName: 'User',
  name: 'Demo User',
  role: 'lender',
  picture: 'https://ui-avatars.com/api/?name=Demo+User&background=0077be&color=fff',
  roles: ['lender', 'user'],
  permissions: ['read:all', 'write:all'],
};

export const useMockAuth = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with demo user
  useEffect(() => {
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        // Use default demo user
        setUser(DEFAULT_DEMO_USER);
        setIsAuthenticated(true);
        localStorage.setItem('demo_user', JSON.stringify(DEFAULT_DEMO_USER));
      }
    } else {
      // Auto-login with demo user
      setUser(DEFAULT_DEMO_USER);
      setIsAuthenticated(true);
      localStorage.setItem('demo_user', JSON.stringify(DEFAULT_DEMO_USER));
    }
    setIsLoading(false);
  }, []);

  const loginWithRedirect = useCallback(async () => {
    // Mock login - just set the demo user
    setUser(DEFAULT_DEMO_USER);
    setIsAuthenticated(true);
    localStorage.setItem('demo_user', JSON.stringify(DEFAULT_DEMO_USER));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('demo_user');
    window.location.href = '/';
  }, []);

  const getAccessTokenSilently = useCallback(async () => {
    return 'demo-access-token';
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes('write:all');
  }, [user]);

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    return user.roles.includes(role) || user.role === role;
  }, [user]);

  const isAdmin = user?.roles.includes('admin') || user?.role === 'admin';
  const hasStreamAccess = isAdmin;

  return {
    user,
    token: 'demo-token',
    isLoading,
    isAuthenticated,
    isAdmin,
    hasStreamAccess,
    hasPermission,
    hasRole,
    login: loginWithRedirect,
    loginWithRedirect,
    register: loginWithRedirect,
    logout,
    refreshToken: async () => 'demo-token',
    getAccessTokenSilently,
    loginError: null,
    registerError: null,
    isLoginLoading: false,
    isRegisterLoading: false,
    error: null,
  };
};

export default useMockAuth;