import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartMatchingDecision from '../SmartMatchingDecision';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the workflow context
const mockAdvanceStage = jest.fn();
jest.mock('../../../contexts/WorkflowContext', () => ({
  useWorkflow: () => ({
    currentTransaction: {
      id: 'test-123',
      applicantData: { name: 'Test User' },
      amount: 50000,
      type: 'business_loan',
      stage: 'smart_matching_decision',
      status: 'in_progress'
    },
    advanceStage: mockAdvanceStage
  })
}));

// Mock the user type context
jest.mock('../../../contexts/UserTypeContext', () => ({
  useUserType: () => ({
    userType: 'LENDER'
  })
}));

// Simple test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('SmartMatchingDecision - Demo Tests', () => {
  const defaultProps = {
    transactionId: 'test-transaction-123',
    onDecisionMade: jest.fn(),
    autoAdvance: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('🎯 Core Functionality Tests', () => {
    it('✅ Component renders with decision options', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Check for main heading - using getByRole for better accessibility testing
      expect(screen.getByRole('heading', { name: /lending decision/i })).toBeInTheDocument();
      
      // Check for all four decision options - using getByRole for better accessibility testing
      expect(screen.getByRole('button', { name: /hard approved/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /soft approved/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hard decline/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /soft decline/i })).toBeInTheDocument();
      expect(screen.getByText('Hard Decline')).toBeInTheDocument();
      expect(screen.getByText('Soft Decline')).toBeInTheDocument();
    });

    it('✅ Can select a decision option', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      const hardApprovedButton = screen.getByRole('button', { name: /hard approved/i });
      fireEvent.click(hardApprovedButton);

      // Should show confirmation
      expect(screen.getByText(/confirm your decision/i)).toBeInTheDocument();
    });

    it('✅ Shows transaction information', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Should display transaction details from mocked context
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('business_loan')).toBeInTheDocument();
    });

    it('✅ Allows adding notes', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      const notesTextarea = screen.getByPlaceholderText(/add any additional notes/i);
      fireEvent.change(notesTextarea, { target: { value: 'Test decision notes' } });

      expect(notesTextarea).toHaveValue('Test decision notes');
    });

    it('✅ Confirm button calls onDecisionMade callback', () => {
      const onDecisionMade = jest.fn();
      
      render(
        <TestWrapper>
          <SmartMatchingDecision 
            {...defaultProps} 
            onDecisionMade={onDecisionMade}
          />
        </TestWrapper>
      );

      // Select decision
      fireEvent.click(screen.getByRole('button', { name: /hard approved/i }));
      
      // Confirm decision
      fireEvent.click(screen.getByRole('button', { name: /confirm decision/i }));

      // Should call the callback (note: might need to wait for async)
      expect(onDecisionMade).toHaveBeenCalled();
    });
  });

  describe('🔧 Interactive Features', () => {
    it('✅ Reset button clears selection', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Make a selection
      fireEvent.click(screen.getByRole('button', { name: /hard approved/i }));
      expect(screen.getByText(/confirm your decision/i)).toBeInTheDocument();

      // Reset selection
      fireEvent.click(screen.getByRole('button', { name: /reset selection/i }));
      expect(screen.queryByText(/confirm your decision/i)).not.toBeInTheDocument();
    });

    it('✅ Different decision options show different content', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Test hard approval
      // Test hard approval
      fireEvent.click(screen.getByRole('button', { name: /hard approved/i }));
      expect(screen.getByText(/confirm your decision/i)).toBeInTheDocument();
      expect(screen.getByText(/hard approved/i, { selector: 'h3' })).toBeInTheDocument();

      // Test soft decline
      fireEvent.click(screen.getByRole('button', { name: /soft decline/i }));
      expect(screen.getByText(/confirm your decision/i)).toBeInTheDocument();
      expect(screen.getByText(/soft decline/i, { selector: 'h3' })).toBeInTheDocument();
    });
  });

  describe('🎨 UI/UX Tests', () => {
    it('✅ Shows decision option details', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Each option should have requirements and next steps
      expect(screen.getByText(/all criteria met/i)).toBeInTheDocument();
      expect(screen.getAllByText(/proceed to deal structuring/i)).toHaveLength(2);
      expect(screen.getByText(/significant deficiencies/i)).toBeInTheDocument();
    });

    it('✅ Has proper button states', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm decision/i });
      
      // Should be disabled initially
      expect(confirmButton).toBeDisabled();

      // Should be enabled after selection
      fireEvent.click(screen.getByRole('button', { name: /hard approved/i }));
      expect(confirmButton).toBeEnabled();
    });
  });

  describe('📱 Accessibility Tests', () => {
    it('✅ Has proper heading structure', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      // Should have main heading
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    });

    it('✅ Buttons are accessible', () => {
      render(
        <TestWrapper>
          <SmartMatchingDecision {...defaultProps} />
        </TestWrapper>
      );

      const decisionButtons = screen.getAllByRole('button');
      
      // All buttons should have accessible names
      decisionButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
}); 