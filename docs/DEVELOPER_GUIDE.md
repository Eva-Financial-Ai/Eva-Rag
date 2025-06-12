# 👨‍💻 Developer Guide

## 📋 Overview

This guide provides comprehensive instructions for developers working on the EVA Platform frontend. It covers setup, development workflow, testing, deployment, and best practices.

## 🛠️ Development Setup

### Prerequisites

```bash
# Required software
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0

# Optional but recommended
Docker >= 20.10.0
VSCode with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
```

### Environment Setup

```bash
# Clone repository
git clone https://github.com/eva-platform/frontend.git
cd eva-platform-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your API keys and configuration
```

### Environment Variables

```env
# Application
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_VERSION=2.1.0

# Cloudflare Configuration
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your-account-id
REACT_APP_CLOUDFLARE_R2_BUCKET=eva-documents-dev
REACT_APP_CLOUDFLARE_API_TOKEN=your-api-token
REACT_APP_CLOUDFLARE_ZONE_ID=your-zone-id

# AI Model Configuration
REACT_APP_OPENAI_API_KEY=[SET_VIA_ENVIRONMENT]
REACT_APP_ANTHROPIC_API_KEY=[SET_VIA_ENVIRONMENT]
REACT_APP_GOOGLE_API_KEY=[SET_VIA_ENVIRONMENT]

# Authentication
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://your-api-audience

# Feature Flags
REACT_APP_ENABLE_RAG_UPLOAD=true
REACT_APP_ENABLE_PERSONALIZATION=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEBUG_MODE=true
```

### Local Development

```bash
# Start development server
npm start

# Server will start on http://localhost:3000
# Hot reload is enabled by default
```

## 🏗️ Project Structure

### Directory Organization

```
src/
├── components/                 # React components
│   ├── common/                # Reusable components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── RAGUploadModal.tsx
│   │   └── PersonalizationModal.tsx
│   ├── layout/                # Layout components
│   ├── forms/                 # Form components
│   └── pages/                 # Page-specific components
├── hooks/                     # Custom React hooks
│   ├── useRAGUpload.ts
│   ├── usePersonalization.ts
│   └── useCloudflareR2.ts
├── services/                  # API and external services
│   ├── api/
│   ├── ragStorageService.ts
│   ├── cloudflareR2Service.ts
│   └── aiModelService.ts
├── types/                     # TypeScript type definitions
│   ├── ragTypes.ts
│   ├── cloudflareR2Types.ts
│   └── common.ts
├── utils/                     # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
├── contexts/                  # React contexts
├── styles/                    # CSS and styling
├── test/                      # Test utilities
└── config/                    # Configuration files
```

### Component Structure

```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState<StateType>(initialState);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);

  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependency]);

  // Render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

## 🎨 UI/UX Guidelines

### Design System

```typescript
// Color palette
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

// Typography scale
const typography = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

// Spacing scale
const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  4: '1rem',
  8: '2rem',
  16: '4rem',
};
```

### Component Standards

```typescript
// Button component example
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};
```

### Accessibility Standards

```typescript
// Accessibility checklist
const a11yGuidelines = {
  semantic: {
    useSemanticHTML: true,
    properHeadingHierarchy: true,
    meaningfulLinkText: true
  },
  keyboard: {
    tabNavigation: true,
    focusManagement: true,
    keyboardShortcuts: true
  },
  screenReader: {
    altText: true,
    ariaLabels: true,
    ariaDescriptions: true,
    roleAttributes: true
  },
  colorContrast: {
    minimumRatio: 4.5, // WCAG AA
    largeTextRatio: 3.0
  }
};

// Example accessible form
const AccessibleForm: React.FC = () => {
  return (
    <form>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          aria-describedby="email-help"
          className="form-input"
        />
        <div id="email-help" className="form-help">
          We'll never share your email with anyone else.
        </div>
      </div>
    </form>
  );
};
```

## 🧪 Testing Strategy

### Test Structure

```
src/
├── __tests__/                 # Global tests
├── components/
│   ├── __tests__/            # Component tests
│   │   ├── Button.test.tsx
│   │   └── Modal.test.tsx
│   └── Button/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── hooks/
│   └── __tests__/            # Hook tests
├── services/
│   └── __tests__/            # Service tests
└── utils/
    └── __tests__/            # Utility tests
```

### Unit Testing

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});

// Hook test example
import { renderHook, act } from '@testing-library/react';
import { useRAGUpload } from '../useRAGUpload';

describe('useRAGUpload Hook', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useRAGUpload());

    expect(result.current.files).toEqual([]);
    expect(result.current.isUploading).toBe(false);
  });

  it('adds files correctly', () => {
    const { result } = renderHook(() => useRAGUpload());
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    act(() => {
      result.current.addFile(file);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]).toBe(file);
  });
});
```

### Integration Testing

```typescript
// Integration test example
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCustomAIAgent } from '../CreateCustomAIAgent';
import { mockRAGService } from '../../test/mocks';

// Mock external services
jest.mock('../../services/ragStorageService');

describe('CreateCustomAIAgent Integration', () => {
  it('completes full agent creation flow', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <CreateCustomAIAgent
        isOpen={true}
        onCancel={() => {}}
        onSave={onSave}
      />
    );

    // Fill agent name
    await user.type(screen.getByLabelText(/agent name/i), 'Test Agent');

    // Select model
    await user.click(screen.getByLabelText(/eva financial risk model/i));

    // Upload document
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const uploadButton = screen.getByText(/upload files/i);
    await user.click(uploadButton);

    // Mock successful upload
    mockRAGService.uploadRAGFile.mockResolvedValue({
      id: 'file-1',
      status: 'ready'
    });

    // Complete creation
    await user.click(screen.getByText(/create agent/i));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Agent',
          customModel: 'eva-financial-risk-70b'
        })
      );
    });
  });
});
```

### E2E Testing

```typescript
// Cypress E2E test
describe('Agent Creation Flow', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.login('test@eva-platform.com', 'password');
  });

  it('creates a new AI agent with document upload', () => {
    // Start agent creation
    cy.get('[data-testid="create-agent-button"]').click();

    // Fill basic information
    cy.get('input[name="agentName"]').type('Risk Assessment Agent');
    cy.get('select[name="userRole"]').select('lender');

    // Select model
    cy.get('input[value="eva-financial-risk-70b"]').check();

    // Upload document
    cy.get('[data-testid="upload-files-button"]').click();
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-document.pdf');

    // Wait for upload to complete
    cy.get('[data-testid="upload-progress"]').should('contain', '100%');

    // Complete personalization
    cy.get('[data-testid="personalization-modal"]').should('be.visible');
    cy.get('textarea').first().type('Primary use case is risk assessment');
    cy.get('button').contains('Set Organizational Goals').click();

    // Configure goals
    cy.get('[data-testid="goal-1"]').within(() => {
      cy.get('input[type="checkbox"]').check();
    });

    // Complete creation
    cy.get('button').contains('Complete Personalization').click();
    cy.get('button').contains('Create Agent').click();

    // Verify success
    cy.get('[data-testid="success-message"]').should('contain', 'Agent created successfully');
    cy.url().should('include', '/dashboard');
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Button

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

## 🚀 Build & Deployment

### Build Configuration

```typescript
// Build optimization
const buildConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          name: 'common',
        },
      },
    },
    minimize: true,
    usedExports: true,
    sideEffects: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
};
```

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Analyze bundle size
npm run build:analyze

# Build with source maps
npm run build:debug

# Build for specific environment
REACT_APP_ENV=staging npm run build
```

### Deployment Process

```yaml
# GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: build/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build-files
          path: build/
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: eva-platform-frontend
          directory: build
```

## 🔧 Development Tools

### Code Quality Tools

```json
// .eslintrc.js
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-key": "error"
  }
}

// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false
};

// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Debugging Configuration

```typescript
// Debug configuration
const debugConfig = {
  development: {
    logLevel: 'debug',
    enableReduxDevTools: true,
    enableReactDevTools: true,
    showPerformanceMetrics: true
  },
  production: {
    logLevel: 'error',
    enableErrorReporting: true,
    enableAnalytics: true
  }
};

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      errorReportingService.captureException(error, {
        extra: errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We've been notified and are working on a fix.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📚 Best Practices

### Performance Optimization

```typescript
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Memoization
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  return <div>{processedData}</div>;
});

// Debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### Security Best Practices

```typescript
// Input sanitization
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
};

// API request with CSRF protection
const apiRequest = async (url: string, options: RequestInit) => {
  const csrfToken = getCsrfToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
  });
};

// Sensitive data handling
const handleSensitiveData = (data: SensitiveData) => {
  // Never log sensitive data
  console.log('Processing data for user:', data.userId); // OK
  // console.log('User SSN:', data.ssn); // NEVER DO THIS

  // Encrypt before storage
  const encryptedData = encrypt(data);
  return encryptedData;
};
```

### Code Organization

```typescript
// Feature-based organization
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── rag-upload/
│   │   ├── components/
│   │   │   ├── RAGUploadModal/
│   │   │   └── PersonalizationModal/
│   │   ├── hooks/
│   │   │   ├── useRAGUpload.ts
│   │   │   └── usePersonalization.ts
│   │   ├── services/
│   │   │   ├── ragStorageService.ts
│   │   │   └── cloudflareR2Service.ts
│   │   └── types/
│   │       └── ragTypes.ts
│   └── agent-creation/
└── shared/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

## 🆘 Troubleshooting

### Common Issues

```typescript
// TypeScript errors
interface CommonIssues {
  // Missing types
  'Property does not exist on type': {
    solution: 'Add proper TypeScript interfaces';
    example: 'interface Props { property: string; }';
  };

  // Module resolution
  'Cannot find module': {
    solution: 'Check import paths and module installation';
    example: 'npm install missing-package';
  };

  // React hooks
  'Hooks can only be called inside function components': {
    solution: 'Move hooks to top level of component function';
    example: 'const [state, setState] = useState(); // at top';
  };
}
```

### Debug Commands

```bash
# Clear all caches
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit --audit-level moderate

# Fix linting issues
npm run lint:fix

# Type check only
npm run type-check

# Bundle analysis
npm run build:analyze
```

### Performance Monitoring

```typescript
// Performance monitoring
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          console.log('Page load time:', entry.loadEventEnd - entry.fetchStart);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    return () => observer.disconnect();
  }, []);
};
```

## 📞 Support & Resources

### Development Resources

- **Documentation**: [Internal Wiki](https://wiki.eva-platform.com)
- **API Reference**: [API Docs](https://api.eva-platform.com/docs)
- **Design System**: [Figma Library](https://figma.com/eva-design-system)
- **Code Standards**: [Style Guide](STYLE_GUIDE.md)

### Getting Help

- **Slack**: #eva-frontend-dev
- **Issues**: [GitHub Issues](https://github.com/eva-platform/frontend/issues)
- **Code Review**: Create PR and request review
- **Office Hours**: Tuesdays 2-3 PM PST

---

For additional information, see:

- [Cloudflare Infrastructure Guide](CLOUDFLARE_INFRASTRUCTURE.md)
- [RAG Implementation](RAG_IMPLEMENTATION.md)
- [API Reference](API_REFERENCE.md)
- [Security Guide](SECURITY_GUIDE.md)
