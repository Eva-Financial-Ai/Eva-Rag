// Jest Setup for EVA AI Frontend Testing
// Global test configuration and utilities

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from '../mocks/server';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Global test setup
beforeAll(() => {
  // Start MSW server for API mocking
  server.listen({
    onUnhandledRequest: 'warn',
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window.ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock window.IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock window.location
  delete window.location;
  window.location = {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
    protocol: 'http:',
    port: '3000',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock;

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  global.sessionStorage = sessionStorageMock;

  // Mock fetch for tests that don't use MSW
  global.fetch = jest.fn();

  // Mock console methods for cleaner test output
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  // Mock crypto for UUID generation
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: jest.fn(() => 'test-uuid-1234'),
      getRandomValues: jest.fn(arr => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    },
  });

  // Mock timers for animations
  jest.useFakeTimers();
});

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers();

  // Clear all mocks
  jest.clearAllMocks();

  // Reset localStorage
  localStorage.clear();
  sessionStorage.clear();

  // Clean up any remaining timers
  jest.runOnlyPendingTimers();
});

afterAll(() => {
  // Clean up MSW server
  server.close();

  // Restore real timers
  jest.useRealTimers();
});

// Global test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (callback, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 100;

      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime >= timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, checkInterval);
          }
        } catch (error) {
          if (Date.now() - startTime >= timeout) {
            reject(error);
          } else {
            setTimeout(check, checkInterval);
          }
        }
      };

      check();
    });
  },

  // Mock component props
  createMockProps: (overrides = {}) => ({
    'data-testid': 'test-component',
    ...overrides,
  }),

  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  }),

  // Mock user interactions
  mockUserEvent: {
    click: element => {
      element.click();
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
    type: (element, text) => {
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    submit: form => {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    },
  },

  // Mock file operations
  createMockFile: (name = 'test.txt', content = 'test content', type = 'text/plain') => {
    const file = new File([content], name, { type });
    return file;
  },

  // Mock image loading
  mockImageLoad: (src, success = true) => {
    const img = new Image();
    img.src = src;
    setTimeout(() => {
      if (success) {
        img.dispatchEvent(new Event('load'));
      } else {
        img.dispatchEvent(new Event('error'));
      }
    }, 0);
    return img;
  },
};

// Custom Jest matchers
expect.extend({
  toBeInTheViewport(received) {
    const rect = received.getBoundingClientRect();
    const isInViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    return {
      message: () => `expected element ${isInViewport ? 'not ' : ''}to be in viewport`,
      pass: isInViewport,
    };
  },

  toHaveAccessibleName(received, expected) {
    const accessibleName =
      received.getAttribute('aria-label') ||
      received.getAttribute('aria-labelledby') ||
      received.textContent ||
      received.getAttribute('title');

    const pass = accessibleName === expected;

    return {
      message: () =>
        `expected element to have accessible name "${expected}", but got "${accessibleName}"`,
      pass,
    };
  },

  toBeAccessible(received) {
    const hasAriaLabel = received.hasAttribute('aria-label');
    const hasAriaLabelledBy = received.hasAttribute('aria-labelledby');
    const hasTextContent = received.textContent && received.textContent.trim().length > 0;
    const hasTitle = received.hasAttribute('title');
    const hasAltText = received.hasAttribute('alt');

    const isAccessible =
      hasAriaLabel || hasAriaLabelledBy || hasTextContent || hasTitle || hasAltText;

    return {
      message: () =>
        `expected element ${isAccessible ? 'not ' : ''}to be accessible (have aria-label, aria-labelledby, text content, title, or alt text)`,
      pass: isAccessible,
    };
  },
});
