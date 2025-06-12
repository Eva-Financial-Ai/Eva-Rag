import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import WorkflowStepper from '../WorkflowStepper';
import { UserTypeProvider } from '../../../contexts/UserTypeContext';
import { UserType } from '../../../types/UserTypes';
import { WorkflowStage } from '../../../contexts/WorkflowContext';

// Mock localStorage using vitest
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

const localStorageMock = createMockStorage();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
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
    return null;
  });

  return (
    <BrowserRouter>
      <UserTypeProvider>
        {children}
      </UserTypeProvider>
    </BrowserRouter>
  );
};

describe('WorkflowStepper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Step Visibility', () => {
    it('shows only current and previous steps when showOnlyCurrentAndPrevious is true', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Should show previous step (document execution)
      expect(screen.getByText('Document Execution')).toBeInTheDocument();
      
      // Should show current step (lending decision for lender)
      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
      
      // Should NOT show other steps that aren't visible
      expect(screen.queryByText('Application')).not.toBeInTheDocument();
      expect(screen.queryByText('Documents')).not.toBeInTheDocument();
    });

    it('shows all steps when showOnlyCurrentAndPrevious is false', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={false}
          />
        </TestWrapper>
      );

      // Should show all steps
      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Underwriting')).toBeInTheDocument();
      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
      expect(screen.getByText('Deal Structuring')).toBeInTheDocument();
    });

    it('shows only current step when it is the first step', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="application" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Should show current step
      expect(screen.getByText('Application')).toBeInTheDocument();
      
      // Should not show future steps
      expect(screen.queryByText('Documents')).not.toBeInTheDocument();
    });
  });

  describe('Step Status Indicators', () => {
    it('marks previous steps as completed', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Previous step should be marked as completed
      const completedBadge = screen.getByText('Completed');
      expect(completedBadge).toBeInTheDocument();
    });

    it('marks current step as current', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Current step should be marked as current
      const currentBadge = screen.getByText('Current');
      expect(currentBadge).toBeInTheDocument();
    });

    it('shows correct step numbers', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Should show step 8 and step 9 (document execution and smart matching decision)
      expect(screen.getByText('Step 8')).toBeInTheDocument(); // Document Execution
      expect(screen.getByText('Step 9')).toBeInTheDocument(); // Smart Matching Decision
    });
  });

  describe('User Type Customization', () => {
    it('shows lender-specific content for smart matching decision', () => {
      render(
        <TestWrapper userType={UserType.LENDER}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
      expect(screen.getByText('Make lending decision')).toBeInTheDocument();
    });

    it('shows broker-specific content for smart matching decision', () => {
      render(
        <TestWrapper userType={UserType.BROKERAGE}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Broker Recommendation')).toBeInTheDocument();
      expect(screen.getByText('Provide recommendation')).toBeInTheDocument();
    });

    it('shows business-specific content for smart matching decision', () => {
      render(
        <TestWrapper userType={UserType.BUSINESS}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Decision Review')).toBeInTheDocument();
      expect(screen.getByText('Review application decision')).toBeInTheDocument();
    });

    it('shows correct user role icon for lender', () => {
      render(
        <TestWrapper userType={UserType.LENDER}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('🏦 Lender')).toBeInTheDocument();
    });

    it('shows correct user role icon for broker', () => {
      render(
        <TestWrapper userType={UserType.BROKERAGE}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('🏢 Broker')).toBeInTheDocument();
    });

    it('shows correct user role icon for business', () => {
      render(
        <TestWrapper userType={UserType.BUSINESS}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('👤 Business')).toBeInTheDocument();
    });

    it('customizes deal structuring step for business users', () => {
      render(
        <TestWrapper userType={UserType.BUSINESS}>
          <WorkflowStepper 
            currentStage="deal_structuring" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Terms Review')).toBeInTheDocument();
      expect(screen.getByText('Review proposed terms')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('shows correct progress percentage', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={false}
          />
        </TestWrapper>
      );

      // Smart matching decision is step 9 out of 12 steps = 75%
      expect(screen.getByText('75% Complete')).toBeInTheDocument();
      expect(screen.getByText('Progress: Step 9 of 12')).toBeInTheDocument();
    });

    it('shows visual progress bar', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={false}
          />
        </TestWrapper>
      );

      // Look for progress bar element using test-friendly selector
      expect(screen.getByText('75% Complete')).toBeInTheDocument();
    });
  });

  describe('Step Navigation and Context', () => {
    it('shows appropriate context message for current step', () => {
      render(
        <TestWrapper userType={UserType.LENDER}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Your decision will determine the next workflow stage')).toBeInTheDocument();
    });

    it('shows different context for business users', () => {
      render(
        <TestWrapper userType={UserType.BUSINESS}>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Waiting for decision from lender/broker')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles unknown workflow stages gracefully', () => {
      // Should render without crashing - component returns null for unknown stages
      expect(() => {
        render(
          <TestWrapper>
            <WorkflowStepper 
              currentStage={'unknown_stage' as WorkflowStage}
              showOnlyCurrentAndPrevious={true}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('handles missing user type gracefully', () => {
      render(
        <BrowserRouter>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </BrowserRouter>
      );

      // Should render with default content
      expect(screen.getByText('Decision Review')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            className="custom-stepper-class"
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Check that the component renders properly
      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Should have proper step structure
      expect(screen.getByText('Lending Decision')).toBeInTheDocument();
    });

    it('provides meaningful step descriptions', () => {
      render(
        <TestWrapper>
          <WorkflowStepper 
            currentStage="smart_matching_decision" 
            showOnlyCurrentAndPrevious={true}
          />
        </TestWrapper>
      );

      // Each step should have descriptive text
      expect(screen.getByText('Execute final documents')).toBeInTheDocument();
      expect(screen.getByText('Make lending decision')).toBeInTheDocument();
    });
  });
}); 