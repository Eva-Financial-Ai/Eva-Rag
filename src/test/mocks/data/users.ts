import { faker } from '@faker-js/faker';

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'lender' | 'borrower' | 'broker';
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
}

// Static mock users for consistent testing
export const mockUsers: Record<string, MockUser> = {
  admin: {
    id: 'admin-001',
    email: 'admin@eva.ai',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
  lender: {
    id: 'lender-001',
    email: 'lender@bank.com',
    firstName: 'John',
    lastName: 'Banker',
    role: 'lender',
    permissions: ['read', 'write', 'approve_loans'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lender',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isActive: true,
    organization: {
      id: 'org-001',
      name: 'First National Bank',
      type: 'bank',
    },
  },
  borrower: {
    id: 'borrower-001',
    email: 'borrower@company.com',
    firstName: 'Jane',
    lastName: 'Entrepreneur',
    role: 'borrower',
    permissions: ['read', 'apply_loan'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=borrower',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    isActive: true,
    organization: {
      id: 'org-002',
      name: 'Tech Startup Inc',
      type: 'company',
    },
  },
  broker: {
    id: 'broker-001',
    email: 'broker@finance.com',
    firstName: 'Mike',
    lastName: 'Middleman',
    role: 'broker',
    permissions: ['read', 'write', 'manage_deals'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=broker',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    isActive: true,
    organization: {
      id: 'org-003',
      name: 'Finance Brokers LLC',
      type: 'brokerage',
    },
  },
};

// User factory for generating random users
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const role = overrides.role || faker.helpers.arrayElement(['admin', 'lender', 'borrower', 'broker']);
  
  const permissionsByRole = {
    admin: ['read', 'write', 'delete', 'admin'],
    lender: ['read', 'write', 'approve_loans'],
    borrower: ['read', 'apply_loan'],
    broker: ['read', 'write', 'manage_deals'],
  };

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role,
    permissions: permissionsByRole[role],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.alphanumeric(10)}`,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    organization: role !== 'admin' ? {
      id: faker.string.uuid(),
      name: faker.company.name(),
      type: faker.helpers.arrayElement(['bank', 'company', 'brokerage']),
    } : undefined,
    ...overrides,
  };
};

// Bulk user creation
export const createMockUsers = (count: number, overrides: Partial<MockUser> = {}): MockUser[] => {
  return Array.from({ length: count }, () => createMockUser(overrides));
};

// User session mock
export const mockUserSession = {
  user: mockUsers.borrower,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
};

// Auth responses
export const mockAuthResponses = {
  loginSuccess: {
    user: mockUsers.borrower,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },
  loginError: {
    error: 'Invalid credentials',
    code: 'AUTH_FAILED',
  },
  tokenExpired: {
    error: 'Token expired',
    code: 'TOKEN_EXPIRED',
  },
};