import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '../authService';
import { AuthResponse } from '../authService';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default to not using mock data for tests
    vi.mock('../authService', async () => {
      const actual = await vi.importActual('../authService');
      return {
        ...actual,
        USE_MOCK_DATA: false,
      };
    });
  });

  describe('login', () => {
    it('successfully logs in an authorized user', async () => {
      const mockCredentials = { email: 'justin@evafi.ai', password: 'password123' };
      const mockApiResponse: AuthResponse = {
        success: true,
        token: 'mock-jwt-token',
        user: { id: 'user-1', name: 'Justin', email: 'justin@evafi.ai', role: 'admin' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await authService.login(mockCredentials);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCredentials),
        }),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApiResponse);
      expect(localStorage.getItem('auth_token')).toBe(mockApiResponse.token);
    });

    it('denies login for unauthorized emails', async () => {
      const result = await authService.login({
        email: 'unauthorized@test.com',
        password: 'password',
      });
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not authorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles login failure from the API', async () => {
      const mockCredentials = { email: 'rao@evafi.ai', password: 'wrongpassword' };
      const mockApiResponse: AuthResponse = {
        success: false,
        error: 'Invalid credentials',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockApiResponse,
      });

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid credentials');
    });

    it('uses mock data when USE_MOCK_DATA is true', async () => {
      vi.mock('../authService', async () => {
        const actual = await vi.importActual('../authService');
        return {
          ...actual,
          USE_MOCK_DATA: true,
        };
      });

      const result = await authService.login({ email: 'demo@evafi.ai', password: 'password' });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.token).toContain('mock_token');
      expect(localStorage.getItem('auth_token')).toBe(result.data?.token);
    });
  });

  describe('logout', () => {
    it('clears authentication data and reloads the window', () => {
      localStorage.setItem('auth_token', 'some-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

      const reload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { href: '', reload },
        writable: true,
      });

      authService.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('successfully refreshes a token', async () => {
      localStorage.setItem('auth_token', 'expiring-token');
      const mockResponse = { token: 'new-refreshed-token', user: { id: 'user-1' } };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, ...mockResponse }),
      });

      const result = await authService.refreshToken();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/refresh'),
        expect.any(Object),
      );
      expect(result.token).toBe('new-refreshed-token');
      expect(localStorage.getItem('auth_token')).toBe('new-refreshed-token');
    });

    it('throws an error if no token is available', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('No token available');
    });
  });
});
