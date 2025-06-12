import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreditApplicationFlow from '../../CreditApplicationFlow';
import { WorkflowProvider } from '../../../../contexts/WorkflowContext';
import { apiService } from '../../../../api/apiService';

// Mock API service
jest.mock('../../../../api/apiService');

// Mock Cloudflare Worker endpoints
const mockWorkerEndpoint = 'https://eva-credit-api.workers.dev';

describe('CreditApplication Integration Tests', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    (apiService.post as jest.Mock).mockResolvedValue({
      data: {
        applicationId: 'test-app-123',
        status: 'submitted',
        timestamp: new Date().toISOString(),
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <WorkflowProvider>
          {component}
        </WorkflowProvider>
      </BrowserRouter>
    );
  };

  describe('Multi-Step Flow Integration', () => {
    it('navigates through all steps of the application', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Step 1: Credit Application Form
      expect(screen.getByText(/Credit Application/i)).toBeInTheDocument();
      
      // Fill basic info and proceed
      await userEvent.type(screen.getByLabelText(/Legal Business Name/i), 'Integration Test LLC');
      
      // Click to next step
      const nextButton = screen.getByText(/Next/i);
      fireEvent.click(nextButton);
      
      // Step 2: Business Tax Returns
      await waitFor(() => {
        expect(screen.getByText(/Business Tax Returns/i)).toBeInTheDocument();
      });
    });

    it('maintains data consistency across steps', async () => {
      const testData = {
        legalBusinessName: 'Data Consistency LLC',
        taxId: '98-7654321',
        requestedAmount: '500000',
      };
      
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} initialData={testData} />);
      
      // Verify initial data is loaded
      expect(screen.getByDisplayValue('Data Consistency LLC')).toBeInTheDocument();
      expect(screen.getByDisplayValue('98-7654321')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('submits application to Cloudflare Worker', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Fill minimum required fields
      await userEvent.type(screen.getByLabelText(/Legal Business Name/i), 'API Test LLC');
      await userEvent.type(screen.getByLabelText(/Business Street Address/i), '456 API St');
      
      // Submit form
      const submitButton = screen.getByText(/Submit/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalledWith(
          expect.stringContaining('/applications'),
          expect.objectContaining({
            legalBusinessName: 'API Test LLC',
            businessAddressStreet: '456 API St',
          })
        );
      });
    });

    it('handles API errors gracefully', async () => {
      (apiService.post as jest.Mock).mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      });
      
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      const submitButton = screen.getByText(/Submit/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('handles network timeouts', async () => {
      (apiService.post as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));
      
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      const submitButton = screen.getByText(/Submit/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Document Upload Integration', () => {
    it('uploads documents to Cloudflare R2', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Navigate to document upload section
      const uploadButton = screen.getByText(/Upload Documents/i);
      fireEvent.click(uploadButton);
      
      // Simulate file upload
      const file = new File(['test content'], 'test-doc.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Choose file/i);
      
      await userEvent.upload(input, file);
      
      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalledWith(
          expect.stringContaining('/upload'),
          expect.any(FormData)
        );
      });
    });
  });

  describe('Session Persistence', () => {
    it('saves progress automatically', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Make changes
      await userEvent.type(screen.getByLabelText(/Legal Business Name/i), 'Auto Save LLC');
      
      // Wait for auto-save (usually debounced)
      await waitFor(() => {
        expect(window.sessionStorage.getItem('creditApplicationData')).toContain('Auto Save LLC');
      }, { timeout: 3000 });
    });

    it('recovers from browser refresh', () => {
      // Set session data
      const sessionData = {
        legalBusinessName: 'Recovered LLC',
        currentStep: 2,
      };
      window.sessionStorage.setItem('creditApplicationData', JSON.stringify(sessionData));
      
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Should restore to step 2
      expect(screen.getByText(/Business Tax Returns/i)).toBeInTheDocument();
    });
  });

  describe('Workflow Integration', () => {
    it('updates workflow context on completion', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Complete application
      const completeButton = screen.getByText(/Complete Application/i);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            applicationId: expect.any(String),
            status: 'submitted',
          })
        );
      });
    });

    it('advances to risk assessment after completion', async () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));
      
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Complete application
      const completeButton = screen.getByText(/Complete Application/i);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/risk-assessment');
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('handles rapid form submissions', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      const submitButton = screen.getByText(/Submit/i);
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(submitButton);
      }
      
      await waitFor(() => {
        // Should only submit once due to debouncing
        expect(apiService.post).toHaveBeenCalledTimes(1);
      });
    });

    it('validates form data before API call', async () => {
      renderWithProviders(<CreditApplicationFlow onComplete={mockOnComplete} />);
      
      // Try to submit without required fields
      const submitButton = screen.getByText(/Submit/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Should not call API without valid data
        expect(apiService.post).not.toHaveBeenCalled();
      });
    });
  });
});