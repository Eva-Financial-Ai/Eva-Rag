// Import mock data and services
import { ApiResponse } from './apiClient';
import { mockLoginResponse } from './mockData';

import { debugLog } from '../utils/auditLogger';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Flag to use mock data when API is unavailable
export const USE_MOCK_DATA = true; // Set to false when your API is ready

// Whitelist of allowed emails
const ALLOWED_EMAILS = [
  'test@evafin.ai',
  'admin@evafin.ai',
  'support@evafin.ai',
  'justin@evafin.ai',
  'eva@evafin.ai',
];

// Allowed phone number for development access
const ALLOWED_PHONE = '7027654321';

// Define types
export interface LoginCredentials {
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber?: string;
  };
  error?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface RefreshTokenResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Login user
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  // Check if email is in the whitelist
  if (!ALLOWED_EMAILS.includes(credentials.email.toLowerCase())) {
    return {
      data: {
        success: false,
        error: 'Access denied. Your email is not authorized for this development system.',
      },
      error: new Error('Access denied. Your email is not authorized for this development system.'),
      status: 403,
      success: false,
    };
  }

  // Check phone number if provided
  if (credentials.phoneNumber && credentials.phoneNumber !== ALLOWED_PHONE) {
    return {
      data: {
        success: false,
        error: 'Invalid phone number for authentication.',
      },
      error: new Error('Invalid phone number for authentication.'),
      status: 403,
      success: false,
    };
  }

  // Use mock data if flag is set
  if (USE_MOCK_DATA) {
    debugLog('general', 'log_statement', 'Using mock authentication data')

    // Check if credentials are provided (basic validation)
    if (!credentials.email || !credentials.password) {
      return {
        data: {
          success: false,
          error: 'Email and password are required.',
        },
        error: new Error('Email and password are required.'),
        status: 400,
        success: false,
      };
    }

    // Create a customized mock response based on the actual email
    const customResponse = {
      ...mockLoginResponse,
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user: {
        ...mockLoginResponse.user,
        email: credentials.email,
        name: credentials.email
          .split('@')[0]
          .replace('.', ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        phoneNumber: credentials.phoneNumber,
      },
    };

    // Store the mock token and user data
    localStorage.setItem('auth_token', customResponse.token);
    localStorage.setItem('user', JSON.stringify(customResponse.user));

    return {
      data: customResponse,
      status: 200,
      success: true,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (data.success && data.token) {
      // Store the token in localStorage
      localStorage.setItem('auth_token', data.token);

      // Store user data if needed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return {
      data,
      status: data.success ? 200 : 401,
      success: data.success,
      error: data.success ? undefined : new Error(data.error || 'Authentication failed'),
    };
  } catch (error) {
    console.error('Login failed:', error);

    if (USE_MOCK_DATA) {
      debugLog('general', 'log_statement', 'Falling back to mock authentication')

      // Create a customized mock response based on the actual email
      const customResponse = {
        ...mockLoginResponse,
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user: {
          ...mockLoginResponse.user,
          email: credentials.email,
          name: credentials.email
            .split('@')[0]
            .replace('.', ' ')
            .replace(/\b\w/g, l => l.toUpperCase()),
          phoneNumber: credentials.phoneNumber,
        },
      };

      localStorage.setItem('auth_token', customResponse.token);
      localStorage.setItem('user', JSON.stringify(customResponse.user));

      return {
        data: customResponse,
        status: 200,
        success: true,
      };
    }

    return {
      data: {
        success: false,
        error: 'Network error. Please try again.',
      },
      error: new Error('Network error. Please try again.'),
      status: 500,
      success: false,
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

// Get current user
export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');

  // You might want to redirect to login page here
  window.location.href = '/login';
};

// Refresh token - updated to match useAuth expectations
export const refreshToken = async (refreshTokenValue?: string): Promise<RefreshTokenResponse> => {
  const token = refreshTokenValue || localStorage.getItem('auth_token');
  if (!token) throw new Error('No token available');

  if (USE_MOCK_DATA) {
    debugLog('general', 'log_statement', 'Using mock token refresh')
    // Return a new mock token
    const newToken = 'mock_refreshed_token_' + Date.now();
    localStorage.setItem('auth_token', newToken);
    return {
      token: newToken,
      user: getCurrentUser(),
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: AuthResponse = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('auth_token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return {
        token: data.token,
        user: data.user,
      };
    }

    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('Token refresh failed:', error);
    if (USE_MOCK_DATA) {
      // Return a new mock token even on error
      const newToken = 'mock_refreshed_token_' + Date.now();
      localStorage.setItem('auth_token', newToken);
      return {
        token: newToken,
        user: getCurrentUser(),
      };
    }
    throw error;
  }
};

// Register user
export const register = async (
  credentials: RegisterCredentials,
): Promise<ApiResponse<AuthResponse>> => {
  // Check if email is in the whitelist
  if (!ALLOWED_EMAILS.includes(credentials.email.toLowerCase())) {
    return {
      data: {
        success: false,
        error: 'Access denied. Your email is not authorized for this development system.',
      },
      error: new Error('Access denied. Your email is not authorized for this development system.'),
      status: 403,
      success: false,
    };
  }

  if (USE_MOCK_DATA) {
    debugLog('general', 'log_statement', 'Using mock registration')

    // Create a mock response
    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock_token_' + Date.now(),
      user: {
        id: 'user_' + Date.now(),
        name: credentials.name,
        email: credentials.email,
        role: 'borrower',
        phoneNumber: credentials.phoneNumber,
      },
    };

    localStorage.setItem('auth_token', mockResponse.token!);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));

    return {
      data: mockResponse,
      status: 200,
      success: true,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('auth_token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return {
      data,
      status: data.success ? 201 : 400,
      success: data.success,
      error: data.success ? undefined : new Error(data.error || 'Registration failed'),
    };
  } catch (error) {
    console.error('Registration failed:', error);
    return {
      data: {
        success: false,
        error: 'Network error. Please try again.',
      },
      error: new Error('Network error. Please try again.'),
      status: 500,
      success: false,
    };
  }
};

// Validate token
export const validateToken = async (token: string): Promise<boolean> => {
  if (!token) return false;

  if (USE_MOCK_DATA) {
    debugLog('general', 'log_statement', 'Using mock token validation')
    // Mock tokens are always valid in development
    return token.startsWith('mock_');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};
