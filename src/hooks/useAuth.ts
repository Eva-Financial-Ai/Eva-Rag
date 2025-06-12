import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../api/authService';
import { LoginCredentials, RegisterCredentials } from '../api/authService';
import { config } from '../config/environment';
import { useApiMutation } from './useApiQuery';

// Interface for user object
interface User {
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

/**
 * Hook for authentication state management with Auth0 integration
 */
export const useAuth = () => {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Transform Auth0 user to our User interface
  const transformedUser: User | null = useMemo(() => {
    if (!auth0User) return null;

    return {
      id: auth0User.sub || '',
      email: auth0User.email || '',
      firstName: auth0User.given_name || '',
      lastName: auth0User.family_name || '',
      name: auth0User.name || '',
      role: auth0User['https://evafi.ai/role'] || 'user',
      phoneNumber: auth0User['https://evafi.ai/phone'],
      picture: auth0User.picture,
      roles: auth0User['https://evafi.ai/roles'] || [],
      permissions: auth0User['https://evafi.ai/permissions'] || [],
    };
  }, [auth0User]);

  // Admin role checking
  const isAdmin = useMemo(() => {
    if (!transformedUser) return false;
    return (
      transformedUser.roles.includes('system_admin') ||
      transformedUser.roles.includes('admin') ||
      transformedUser.role === 'admin' ||
      transformedUser.role === 'system_admin'
    );
  }, [transformedUser]);

  // Stream access checking (Admin only)
  const hasStreamAccess = useMemo(() => {
    if (!transformedUser) return false;
    return (
      isAdmin &&
      (transformedUser.permissions.includes('stream:read') ||
        transformedUser.permissions.includes('stream:write') ||
        transformedUser.permissions.includes('stream:admin') ||
        transformedUser.role === 'system_admin')
    );
  }, [transformedUser, isAdmin]);

  // Permission checking utility
  const hasPermission = useCallback(
    (permission: string) => {
      if (!transformedUser) return false;
      return transformedUser.permissions.includes(permission);
    },
    [transformedUser],
  );

  // Role checking utility
  const hasRole = useCallback(
    (role: string) => {
      if (!transformedUser) return false;
      return transformedUser.roles.includes(role) || transformedUser.role === role;
    },
    [transformedUser],
  );

  // Sync Auth0 state with local state
  useEffect(() => {
    if (auth0IsAuthenticated && transformedUser) {
      setUser(transformedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(auth0IsLoading);
  }, [auth0IsAuthenticated, auth0IsLoading, transformedUser]);

  // Login mutation for legacy auth
  const loginMutation = useApiMutation<authService.AuthResponse, authService.LoginCredentials>(
    authService.login,
    {
      onSuccess: data => {
        setToken(data.token);
        setUser(data.user as any); // Temporary fix for user type mismatch
        setIsAuthenticated(true);

        // Store token in localStorage
        localStorage.setItem(config.auth.tokenKey, data.token || '');
        localStorage.setItem(config.auth.refreshTokenKey, data.refreshToken || '');
      },
      onError: error => {
        console.error('Login failed:', error);
      },
    },
  );

  // Registration mutation
  const registerMutation = useApiMutation<
    authService.AuthResponse,
    authService.RegisterCredentials
  >(authService.register, {
    onSuccess: data => {
      setToken(data.token);
      setUser(data.user as any); // Temporary fix for user type mismatch
      setIsAuthenticated(true);

      // Store token in localStorage
      localStorage.setItem(config.auth.tokenKey, data.token || '');
      localStorage.setItem(config.auth.refreshTokenKey, data.refreshToken || '');
    },
    onError: error => {
      console.error('Registration failed:', error);
    },
  });

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutate(credentials);
    },
    [loginMutation],
  );

  // Register function
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      return registerMutation.mutate(credentials);
    },
    [registerMutation],
  );

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Clear Auth0 session
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });

      // Clear local storage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);

      // Reset state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auth0Logout]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(config.auth.refreshTokenKey);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);

      setToken(response.token);
      localStorage.setItem(config.auth.tokenKey, response.token);

      return response.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(config.auth.tokenKey);

        if (storedToken && !auth0IsAuthenticated) {
          // Legacy token validation
          const isValid = await authService.validateToken(storedToken);

          if (isValid) {
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token invalid, try to refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid tokens
        localStorage.removeItem(config.auth.tokenKey);
        localStorage.removeItem(config.auth.refreshTokenKey);
      } finally {
        setIsLoading(false);
      }
    };

    if (!auth0IsLoading) {
      initializeAuth();
    }
  }, [auth0IsLoading, auth0IsAuthenticated, refreshToken]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasStreamAccess,
    hasPermission,
    hasRole,
    login,
    loginWithRedirect,
    register,
    logout,
    refreshToken,
    getAccessTokenSilently,
    error: loginMutation.error || registerMutation.error || auth0Error || null,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};

export default useAuth;
