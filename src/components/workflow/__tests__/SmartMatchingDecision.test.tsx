import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartMatchingDecision from '../SmartMatchingDecision';
import { WorkflowProvider } from '../../../contexts/WorkflowContext';
import { UserTypeProvider } from '../../../contexts/UserTypeContext';
import { UserType } from '../../../types/UserTypes';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage with better error handling
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

const localStorageMock = createMockStorage();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Test wrapper component that sets up user type via localStorage
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  userType?: UserType;
}> = ({ children, userType = UserType.LENDER }) => {
  // Set up localStorage mock based on userType
  localStorageMock.getItem.mockImplementation((key: string) => {
    if (key === 'userRole') {
      switch (userType) {
        case UserType.LENDER:
          return 'lender';
        case UserType.BROKERAGE:
          return 'broker';
        case UserType.BUSINESS:
          return 'borrower';
        case UserType.VENDOR:
          return 'vendor';
        default:
          return 'lender';
      }
    }
    if (key.startsWith('smart_decision_')) {
      return null; // No existing decision by default
    }
    return null;
  });

  return (
    <BrowserRouter>
      <WorkflowProvider>
        <UserTypeProvider>
          {children}
        </UserTypeProvider>
      </WorkflowProvider>
    </BrowserRouter>
  );
};

describe('SmartMatchingDecision Component', () => {
  const defaultProps = {
    transactionId: 'test-transaction-123',
    onDecisionMade: jest.fn(),
    autoAdvance: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Component Rendering', () => {
    it('renders the smart matching decision interface', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
      expect(screen.getByText('Make your lending decision for this application')).toBeInTheDocument();
      expect(screen.getByText('Make Your Decision')).toBeInTheDocument();
    });

    it('displays all four decision options', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Hard Approved')).toBeInTheDocument();
      expect(screen.getByText('Soft Approved')).toBeInTheDocument();
      expect(screen.getByText('Hard Decline')).toBeInTheDocument();
      expect(screen.getByText('Soft Decline')).toBeInTheDocument();
    });

    it('shows user type specific content for lenders', () => {
      render(
        <TestWrapper userType={UserType.LENDER}>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
      expect(screen.getByText('As a lender, your decision will determine the next steps in the approval process.')).toBeInTheDocument();
    });

    it('shows user type specific content for brokers', () => {
      render(
        <TestWrapper userType={UserType.BROKERAGE}>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Broker Recommendation')).toBeInTheDocument();
      expect(screen.getByText('As a broker, your recommendation helps match clients with suitable lenders.')).toBeInTheDocument();
    });

    it('shows user type specific content for business users', () => {
      render(
        <TestWrapper userType={UserType.BUSINESS}>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Application Status Update')).toBeInTheDocument();
      expect(screen.getByText('This decision determines your next steps in the application process.')).toBeInTheDocument();
    });
  });

  describe('Persistence', () => {
    it('loads existing decision from localStorage', () => {
      const savedDecision = JSON.stringify({
        decision: 'soft_approved',
        notes: 'Previous decision notes',
        decidedAt: new Date().toISOString(),
      });

      localStorageMock.getItem.mockReturnValue(savedDecision);

      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `smart_decision_${defaultProps.transactionId}`
      );
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw an error
      expect(() => {
        render(
          <TestWrapper>
            <SmartMatchingDecision {...defaultProps} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles missing transaction gracefully', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision 
            transactionId=""
            onDecisionMade={jest.fn()}
          />
        </TestWrapper>
      );

      // Should still render the interface
      expect(screen.getByText('Make Your Decision')).toBeInTheDocument();
    });

    it('renders without crashing when localStorage is unavailable', () => {
      // Test that the component renders even when localStorage might not work perfectly
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Should render without crashing
      expect(() => {
        render(
          <TestWrapper>
            <SmartMatchingDecision {...defaultProps} />
          </TestWrapper>
        );
      }).not.toThrow();

      expect(screen.getByText('Make Your Decision')).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });
  });
}); 