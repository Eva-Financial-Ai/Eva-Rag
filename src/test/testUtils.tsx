import React from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Common test wrapper with Router
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Custom render function with default wrapper
export const _renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Helper to wait for multiple elements to appear
export const _waitForElements = async (selectors: string[], options?: { timeout?: number }) => {
  const { timeout = 3000 } = options || {};

  for (const selector of selectors) {
    await waitFor(
      () => {
        expect(screen.getByText(selector)).toBeInTheDocument();
      },
      { timeout }
    );
  }
};

// Helper to check if multiple elements exist
export const _expectElementsToExist = (selectors: string[]) => {
  selectors.forEach(selector => {
    expect(screen.getByText(selector)).toBeInTheDocument();
  });
};

// Helper for elements that appear multiple times
export const _expectMultipleElements = (selector: string, minCount: number = 1) => {
  const _elements = screen.getAllByText(selector);
  expect(_elements.length).toBeGreaterThanOrEqual(minCount);
  return _elements;
};

// Mock user permissions hook
export const _createMockUserPermissions = (overrides: any = {}) => ({
  currentRole: 'borrower-owner',
  hasPermission: () => true,
  getRoleDisplayName: () => 'Test Role',
  getBaseUserType: () => 'borrower',
  ...overrides,
});

// Mock navigation
export const _mockNavigate = jest.fn();

// Common mock setup for React Router
export const _setupRouterMocks = () => {
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => _mockNavigate,
  }));
};

// Helper to suppress console warnings in tests
export const _suppressConsoleWarnings = () => {
  const _originalError = console.error;
  const _originalWarn = console.warn;

  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = _originalError;
    console.warn = _originalWarn;
  });
};

// Helper to create mock financial data
export const _createMockFinancialData = () => ({
  totalApplications: 247,
  averageCreditGrade: 'B+',
  lookToBookRatio: 68.5,
  bookToCloseRatio: 84.2,
  transactionsFunded: 142,
  portfolioValue: '$250M',
  activeLoans: 542,
  defaultRate: '0.8%',
  roiYTD: '18.5%',
});

// Helper to create mock user data
export const _createMockUser = (overrides: any = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'borrower-owner',
  permissions: ['read', 'write'],
  ...overrides,
});

// Helper to create mock transaction data
export const _createMockTransactions = () => [
  {
    id: '1',
    type: 'Equipment Financing',
    amount: '$125,000',
    status: 'Approved',
    date: '2024-01-15',
    borrower: 'ABC Manufacturing',
  },
  {
    id: '2',
    type: 'Working Capital',
    amount: '$75,000',
    status: 'In Review',
    date: '2024-01-14',
    borrower: 'XYZ Corp',
  },
];

// Helper to create mock KPI data
export const _createMockKPIs = () => [
  {
    id: '1',
    label: 'Total Revenue',
    value: '$2.5M',
    change: 12.5,
    trend: 'up',
  },
  {
    id: '2',
    label: 'Active Users',
    value: '1,247',
    change: -2.1,
    trend: 'down',
  },
];

// Helper to wait for loading states to complete
export const _waitForLoadingToComplete = async (timeout: number = 3000) => {
  await waitFor(
    () => {
      // Check that loading spinners are gone
      const _spinners = screen.queryAllByTestId('loading-spinner');
      const _loadingTexts = screen.queryAllByText(/loading/i);
      expect(_spinners.length + _loadingTexts.length).toBe(0);
    },
    { timeout }
  );
};

// Helper to mock API responses
export const _mockApiResponse = (data: any, delay: number = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Helper to create mock form data
export const _createMockFormData = (overrides: any = {}) => ({
  businessName: 'Test Business',
  loanAmount: '100000',
  loanPurpose: 'Equipment',
  creditScore: '750',
  annualRevenue: '500000',
  ...overrides,
});

// Helper to simulate user interactions
export const _simulateFormInput = async (fieldName: string, value: string) => {
  const _field = screen.getByLabelText(new RegExp(fieldName, 'i'));
  await userEvent.clear(_field);
  await userEvent.type(_field, value);
};

// Helper to check form validation
export const _expectValidationError = (message: string) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

// Helper to check success messages
export const _expectSuccessMessage = (message: string) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

// Export all testing library utilities for convenience
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
