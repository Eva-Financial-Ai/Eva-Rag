// src/types/auth.ts

// Interface for user object
export interface User {
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

// Interface for authentication response
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Interface for login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber?: string;
}
