# EVA Finance AI Testing Standards

## Table of Contents
1. [Test Organization](#test-organization)
2. [Naming Conventions](#naming-conventions)
3. [Testing Patterns](#testing-patterns)
4. [Mock Data Management](#mock-data-management)
5. [Best Practices](#best-practices)
6. [Anti-Patterns](#anti-patterns)
7. [Code Coverage Guidelines](#code-coverage-guidelines)

## Test Organization

### Directory Structure
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── __tests__/
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.integration.test.tsx
│   └── common/
│       └── __tests__/
├── hooks/
│   └── __tests__/
├── utils/
│   └── __tests__/
├── services/
│   └── __tests__/
└── __tests__/
    └── integration/
```

### Test File Naming
- **Unit tests**: `ComponentName.test.tsx` or `functionName.test.ts`
- **Integration tests**: `Feature.integration.test.tsx`
- **E2E tests**: `user-flow.e2e.cy.ts`

## Naming Conventions

### Test Suites
```typescript
// ✅ Good
describe('Button', () => {
  describe('Rendering', () => {});
  describe('User Interactions', () => {});
  describe('Accessibility', () => {});
});

// ❌ Bad
describe('button tests', () => {});
```

### Test Cases
```typescript
// ✅ Good
it('renders with primary variant when variant prop is "primary"', () => {});
it('calls onClick handler when clicked', () => {});
it('displays loading spinner when isLoading is true', () => {});

// ❌ Bad
it('works', () => {});
it('test button click', () => {});
```

## Testing Patterns

### Component Testing Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  // Setup
  const defaultProps = {
    onClick: vi.fn(),
    children: 'Click me',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Button {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Button {...defaultProps} />);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies correct CSS classes for variants', () => {
      const { rerender } = render(<Button {...defaultProps} variant="primary" />);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');

      rerender(<Button {...defaultProps} variant="secondary" />);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });
  });

  // Interaction Tests
  describe('User Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      render(<Button {...defaultProps} />);
      
      await user.click(screen.getByRole('button'));
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<Button {...defaultProps} disabled />);
      
      await user.click(screen.getByRole('button'));
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Button {...defaultProps} ariaLabel="Submit form" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Submit form');
    });

    it('can be focused with keyboard', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button {...defaultProps} isLoading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button {...defaultProps} isLoading />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
```

### Hook Testing Template
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
```

### Service/API Testing Template
```typescript
import { vi } from 'vitest';
import axios from 'axios';
import { UserService } from './userService';

vi.mock('axios');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('fetches user successfully', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUser });

      const result = await UserService.getUser('1');

      expect(axios.get).toHaveBeenCalledWith('/api/users/1');
      expect(result).toEqual(mockUser);
    });

    it('handles API error gracefully', async () => {
      const error = new Error('Network error');
      vi.mocked(axios.get).mockRejectedValueOnce(error);

      await expect(UserService.getUser('1')).rejects.toThrow('Failed to fetch user');
      expect(axios.get).toHaveBeenCalledWith('/api/users/1');
    });
  });
});
```

## Mock Data Management

### Central Mock Data Store
```typescript
// src/test/mocks/data.ts
export const mockUsers = {
  admin: {
    id: '1',
    email: 'admin@eva.ai',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
  },
  lender: {
    id: '2',
    email: 'lender@bank.com',
    role: 'lender',
    permissions: ['read', 'write'],
  },
  borrower: {
    id: '3',
    email: 'borrower@company.com',
    role: 'borrower',
    permissions: ['read'],
  },
};

export const mockTransactions = {
  pending: {
    id: 'tx1',
    status: 'pending',
    amount: 100000,
    created: '2024-01-01T00:00:00Z',
  },
  approved: {
    id: 'tx2',
    status: 'approved',
    amount: 250000,
    created: '2024-01-02T00:00:00Z',
  },
};
```

### Test Data Factories
```typescript
// src/test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: 'borrower',
  createdAt: faker.date.past(),
  ...overrides,
});

export const createBulkUsers = (count: number, overrides = {}) => 
  Array.from({ length: count }, () => createUser(overrides));
```

## Best Practices

### 1. Use Testing Library Queries Correctly
```typescript
// ✅ Preferred queries (in order)
getByRole('button', { name: /submit/i });
getByLabelText('Email');
getByPlaceholderText('Enter your email');
getByText('Welcome');

// ❌ Avoid test IDs unless necessary
getByTestId('submit-button');
```

### 2. Wait for Async Operations
```typescript
// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ❌ Bad
setTimeout(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
}, 1000);
```

### 3. Test User Behavior, Not Implementation
```typescript
// ✅ Good - Tests what user sees/does
it('displays error message when form submission fails', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText('Email'), 'invalid-email');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
});

// ❌ Bad - Tests implementation details
it('sets isValid state to false', () => {
  // Don't test internal state
});
```

### 4. Keep Tests DRY with Helper Functions
```typescript
// test-utils.tsx
export const renderWithProviders = (component: ReactElement, options = {}) => {
  return render(
    <QueryClient>
      <Router>
        <AuthProvider>
          {component}
        </AuthProvider>
      </Router>
    </QueryClient>,
    options
  );
};
```

### 5. Use Descriptive Assertions
```typescript
// ✅ Good
expect(button).toHaveAttribute('aria-disabled', 'true');
expect(input).toHaveValue('test@example.com');
expect(element).toHaveClass('active');

// ❌ Bad
expect(button.getAttribute('aria-disabled')).toBe('true');
expect(input.value).toBe('test@example.com');
expect(element.className).toContain('active');
```

## Anti-Patterns

### 1. Don't Test Implementation Details
```typescript
// ❌ Bad
it('calls useState with initial value', () => {
  // Don't test React hooks directly
});

// ✅ Good
it('displays initial count of 0', () => {
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
```

### 2. Avoid Snapshot Tests for Dynamic Content
```typescript
// ❌ Bad
it('matches snapshot', () => {
  const { container } = render(<UserList users={dynamicUsers} />);
  expect(container).toMatchSnapshot();
});

// ✅ Good
it('displays all user names', () => {
  render(<UserList users={users} />);
  users.forEach(user => {
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });
});
```

### 3. Don't Use Fixed Timeouts
```typescript
// ❌ Bad
await new Promise(resolve => setTimeout(resolve, 2000));

// ✅ Good
await waitFor(() => {
  expect(mockApi).toHaveBeenCalled();
}, { timeout: 2000 });
```

## Code Coverage Guidelines

### Coverage Targets
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### What to Test
1. **Critical Business Logic**: 100% coverage
2. **User Interactions**: All interactive elements
3. **Error Handling**: All error states
4. **Edge Cases**: Boundary conditions
5. **Accessibility**: ARIA attributes and keyboard navigation

### What NOT to Test
1. Third-party libraries
2. Simple getter/setter methods
3. Console.log statements
4. Types and interfaces
5. Constants and configuration files

### Coverage Report Commands
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check coverage thresholds
npm run test:coverage -- --watchAll=false
```

## Troubleshooting Common Issues

### ResizeObserver Error
```typescript
// Already fixed in setupTests.ts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

### React Act Warnings
```typescript
// Always wrap state updates in act()
await act(async () => {
  await userEvent.click(button);
});
```

### Memory Leaks
```typescript
// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // From @testing-library/react
});
```

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest to Vitest Migration](https://vitest.dev/guide/migration.html)