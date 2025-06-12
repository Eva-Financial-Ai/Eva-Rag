// Unit Tests for Credit Application Component
// Testing all features, form validation, file upload, and integration

import CreditApplication from '@/components/CreditApplication';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('@/hooks/useAnalytics');
jest.mock('@/services/api');
jest.mock('@/services/fileUpload');
jest.mock('@/hooks/useFormValidation');

// Test wrapper
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, cacheTime: 0 } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Mock data
const mockCreditApplicationData = {
  id: 'app-123',
  status: 'draft',
  loanAmount: 50000,
  loanPurpose: 'business_expansion',
  businessInfo: {
    name: 'Test Business LLC',
    industry: 'technology',
    yearsInBusiness: 5,
    annualRevenue: 500000,
  },
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@testbusiness.com',
    phone: '555-0123',
    ssn: '***-**-1234',
  },
  financialInfo: {
    monthlyRevenue: 41667,
    monthlyExpenses: 35000,
    existingDebt: 25000,
    creditScore: 750,
  },
  documents: [
    {
      id: 'doc-1',
      type: 'tax_return',
      fileName: 'tax_return_2023.pdf',
      uploadDate: '2024-01-15T10:00:00Z',
      status: 'verified',
    },
    {
      id: 'doc-2',
      type: 'bank_statement',
      fileName: 'bank_statement_dec_2023.pdf',
      uploadDate: '2024-01-15T10:05:00Z',
      status: 'pending',
    },
  ],
};

describe('CreditApplication Component', () => {
  let mockAnalytics;
  let mockApi;
  let mockFileUpload;
  let mockFormValidation;

  beforeEach(() => {
    mockAnalytics = {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
    };

    mockApi = {
      submitCreditApplication: jest.fn(),
      saveDraftApplication: jest.fn(),
      getCreditApplicationById: jest.fn(),
      uploadDocument: jest.fn(),
    };

    mockFileUpload = {
      uploadFile: jest.fn(),
      validateFile: jest.fn(),
      compressImage: jest.fn(),
    };

    mockFormValidation = {
      validate: jest.fn(),
      validateField: jest.fn(),
      errors: {},
      isValid: true,
    };

    require('@/hooks/useAnalytics').useAnalytics.mockReturnValue(mockAnalytics);
    require('@/services/api').submitCreditApplication = mockApi.submitCreditApplication;
    require('@/services/api').saveDraftApplication = mockApi.saveDraftApplication;
    require('@/services/api').getCreditApplicationById = mockApi.getCreditApplicationById;
    require('@/services/fileUpload').uploadFile = mockFileUpload.uploadFile;
    require('@/hooks/useFormValidation').useFormValidation.mockReturnValue(mockFormValidation);
  });

  describe('Initial Rendering', () => {
    it('renders application form sections', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByTestId('credit-application-form')).toBeInTheDocument();
      expect(screen.getByTestId('loan-details-section')).toBeInTheDocument();
      expect(screen.getByTestId('business-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('personal-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('financial-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('documents-section')).toBeInTheDocument();
    });

    it('displays progress indicator', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByTestId('application-progress')).toBeInTheDocument();
      expect(screen.getByLabelText('Application progress: 0% complete')).toBeInTheDocument();
    });

    it('shows loan amount input with currency formatting', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const loanAmountInput = screen.getByTestId('loan-amount-input');
      expect(loanAmountInput).toBeInTheDocument();
      expect(loanAmountInput).toHaveAttribute('type', 'text');
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('renders all required document upload areas', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByTestId('tax-return-upload')).toBeInTheDocument();
      expect(screen.getByTestId('bank-statement-upload')).toBeInTheDocument();
      expect(screen.getByTestId('business-license-upload')).toBeInTheDocument();
      expect(screen.getByTestId('financial-statement-upload')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates loan amount input', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const loanAmountInput = screen.getByTestId('loan-amount-input');

      // Test invalid amount (too low)
      await user.clear(loanAmountInput);
      await user.type(loanAmountInput, '1000');
      fireEvent.blur(loanAmountInput);

      expect(screen.getByText('Minimum loan amount is $5,000')).toBeInTheDocument();

      // Test invalid amount (too high)
      await user.clear(loanAmountInput);
      await user.type(loanAmountInput, '10000000');
      fireEvent.blur(loanAmountInput);

      expect(screen.getByText('Maximum loan amount is $5,000,000')).toBeInTheDocument();

      // Test valid amount
      await user.clear(loanAmountInput);
      await user.type(loanAmountInput, '50000');
      fireEvent.blur(loanAmountInput);

      expect(screen.queryByText(/loan amount/)).not.toBeInTheDocument();
    });

    it('validates business information fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Test business name validation
      const businessNameInput = screen.getByTestId('business-name-input');
      await user.clear(businessNameInput);
      fireEvent.blur(businessNameInput);

      expect(screen.getByText('Business name is required')).toBeInTheDocument();

      // Test years in business validation
      const yearsInput = screen.getByTestId('years-in-business-input');
      await user.clear(yearsInput);
      await user.type(yearsInput, '0.5');
      fireEvent.blur(yearsInput);

      expect(screen.getByText('Minimum 1 year in business required')).toBeInTheDocument();

      // Test annual revenue validation
      const revenueInput = screen.getByTestId('annual-revenue-input');
      await user.clear(revenueInput);
      await user.type(revenueInput, '10000');
      fireEvent.blur(revenueInput);

      expect(screen.getByText('Minimum annual revenue is $25,000')).toBeInTheDocument();
    });

    it('validates personal information fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Test email validation
      const emailInput = screen.getByTestId('email-input');
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

      // Test phone validation
      const phoneInput = screen.getByTestId('phone-input');
      await user.clear(phoneInput);
      await user.type(phoneInput, '123');
      fireEvent.blur(phoneInput);

      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();

      // Test SSN validation
      const ssnInput = screen.getByTestId('ssn-input');
      await user.clear(ssnInput);
      await user.type(ssnInput, '123-45-678');
      fireEvent.blur(ssnInput);

      expect(screen.getByText('SSN must be in format XXX-XX-XXXX')).toBeInTheDocument();
    });

    it('validates financial information', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Test debt-to-income ratio validation
      const monthlyRevenueInput = screen.getByTestId('monthly-revenue-input');
      const monthlyExpensesInput = screen.getByTestId('monthly-expenses-input');

      await user.clear(monthlyRevenueInput);
      await user.type(monthlyRevenueInput, '5000');

      await user.clear(monthlyExpensesInput);
      await user.type(monthlyExpensesInput, '4800');

      fireEvent.blur(monthlyExpensesInput);

      expect(
        screen.getByText('Monthly expenses cannot exceed 95% of monthly revenue')
      ).toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    it('handles successful file upload', async () => {
      mockFileUpload.uploadFile.mockResolvedValue({
        success: true,
        fileId: 'file-123',
        fileName: 'tax_return.pdf',
        fileSize: 1024000,
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('tax-return-file-input');
      const file = testUtils.createMockFile('tax_return.pdf', 'PDF content', 'application/pdf');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockFileUpload.uploadFile).toHaveBeenCalledWith(file, 'tax_return');
      });

      expect(screen.getByText('tax_return.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('file-upload-success')).toBeInTheDocument();
    });

    it('handles file upload errors', async () => {
      mockFileUpload.uploadFile.mockRejectedValue(new Error('Upload failed'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('tax-return-file-input');
      const file = testUtils.createMockFile('tax_return.pdf', 'PDF content', 'application/pdf');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument();
      });

      expect(screen.getByTestId('file-upload-error')).toBeInTheDocument();
    });

    it('validates file types and sizes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('tax-return-file-input');

      // Test invalid file type
      const invalidFile = testUtils.createMockFile('document.txt', 'Text content', 'text/plain');
      await user.upload(fileInput, invalidFile);

      expect(screen.getByText('Only PDF, JPG, PNG files are allowed')).toBeInTheDocument();

      // Test file size too large
      const largeFile = testUtils.createMockFile(
        'large.pdf',
        'x'.repeat(11 * 1024 * 1024),
        'application/pdf'
      );
      await user.upload(fileInput, largeFile);

      expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument();
    });

    it('allows file removal', async () => {
      mockFileUpload.uploadFile.mockResolvedValue({
        success: true,
        fileId: 'file-123',
        fileName: 'tax_return.pdf',
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('tax-return-file-input');
      const file = testUtils.createMockFile('tax_return.pdf', 'PDF content', 'application/pdf');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('tax_return.pdf')).toBeInTheDocument();
      });

      const removeButton = screen.getByTestId('remove-file-btn');
      await user.click(removeButton);

      expect(screen.queryByText('tax_return.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits complete application successfully', async () => {
      mockApi.submitCreditApplication.mockResolvedValue({
        success: true,
        applicationId: 'app-123',
        status: 'submitted',
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Fill out form
      await user.type(screen.getByTestId('loan-amount-input'), '50000');
      await user.selectOptions(screen.getByTestId('loan-purpose-select'), 'business_expansion');
      await user.type(screen.getByTestId('business-name-input'), 'Test Business LLC');
      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');
      await user.type(screen.getByTestId('email-input'), 'john@testbusiness.com');
      await user.type(screen.getByTestId('phone-input'), '555-0123');
      await user.type(screen.getByTestId('annual-revenue-input'), '500000');

      // Submit form
      const submitButton = screen.getByTestId('submit-application-btn');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.submitCreditApplication).toHaveBeenCalled();
      });

      expect(screen.getByText('Application submitted successfully!')).toBeInTheDocument();
      expect(mockAnalytics.track).toHaveBeenCalledWith('credit_application_submitted', {
        applicationId: 'app-123',
        loanAmount: 50000,
        loanPurpose: 'business_expansion',
      });
    });

    it('saves draft automatically', async () => {
      mockApi.saveDraftApplication.mockResolvedValue({
        success: true,
        draftId: 'draft-123',
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Fill partial form
      await user.type(screen.getByTestId('loan-amount-input'), '50000');
      await user.type(screen.getByTestId('business-name-input'), 'Test Business LLC');

      // Wait for auto-save (debounced)
      await waitFor(
        () => {
          expect(mockApi.saveDraftApplication).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      expect(screen.getByText('Draft saved')).toBeInTheDocument();
    });

    it('handles submission errors gracefully', async () => {
      mockApi.submitCreditApplication.mockRejectedValue(new Error('Submission failed'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Fill out minimal required fields
      await user.type(screen.getByTestId('loan-amount-input'), '50000');
      await user.type(screen.getByTestId('business-name-input'), 'Test Business LLC');

      const submitButton = screen.getByTestId('submit-application-btn');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Submission failed. Please try again.')).toBeInTheDocument();
      });

      expect(screen.getByTestId('submission-error')).toBeInTheDocument();
    });

    it('prevents submission with validation errors', async () => {
      mockFormValidation.isValid = false;
      mockFormValidation.errors = {
        loanAmount: 'Loan amount is required',
        businessName: 'Business name is required',
      };

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-application-btn');
      await user.click(submitButton);

      expect(mockApi.submitCreditApplication).not.toHaveBeenCalled();
      expect(screen.getByText('Please fix the errors before submitting')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('updates progress as form is completed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Initially 0%
      expect(screen.getByLabelText('Application progress: 0% complete')).toBeInTheDocument();

      // Fill loan details (20% of form)
      await user.type(screen.getByTestId('loan-amount-input'), '50000');
      await user.selectOptions(screen.getByTestId('loan-purpose-select'), 'business_expansion');

      expect(screen.getByLabelText('Application progress: 20% complete')).toBeInTheDocument();

      // Fill business info (40% of form)
      await user.type(screen.getByTestId('business-name-input'), 'Test Business LLC');
      await user.type(screen.getByTestId('annual-revenue-input'), '500000');

      expect(screen.getByLabelText('Application progress: 40% complete')).toBeInTheDocument();
    });

    it('shows completion status for each section', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Complete loan details section
      await user.type(screen.getByTestId('loan-amount-input'), '50000');
      await user.selectOptions(screen.getByTestId('loan-purpose-select'), 'business_expansion');

      expect(screen.getByTestId('loan-details-complete')).toBeInTheDocument();
      expect(screen.getByTestId('business-info-incomplete')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Loan amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Loan purpose')).toBeInTheDocument();
      expect(screen.getByLabelText('Business name')).toBeInTheDocument();
      expect(screen.getByLabelText('First name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();

      // Check ARIA attributes
      const form = screen.getByTestId('credit-application-form');
      expect(form).toHaveAttribute('role', 'form');
      expect(form).toHaveAttribute('aria-label', 'Credit application form');
    });

    it('announces form validation errors to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const loanAmountInput = screen.getByTestId('loan-amount-input');
      await user.clear(loanAmountInput);
      await user.type(loanAmountInput, '1000');
      fireEvent.blur(loanAmountInput);

      const errorMessage = screen.getByText('Minimum loan amount is $5,000');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('supports keyboard navigation through form sections', async () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const loanAmountInput = screen.getByTestId('loan-amount-input');
      loanAmountInput.focus();

      // Tab through form fields
      fireEvent.keyDown(loanAmountInput, { key: 'Tab' });
      expect(screen.getByTestId('loan-purpose-select')).toHaveFocus();

      fireEvent.keyDown(screen.getByTestId('loan-purpose-select'), { key: 'Tab' });
      expect(screen.getByTestId('business-name-input')).toHaveFocus();
    });

    it('provides clear instructions for file uploads', () => {
      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByText('Upload tax returns (PDF, JPG, PNG - Max 10MB)')).toBeInTheDocument();
      expect(
        screen.getByText('Upload bank statements (PDF, JPG, PNG - Max 10MB)')
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByTestId('mobile-form-layout')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-progress-bar')).toBeInTheDocument();
    });

    it('shows desktop multi-column layout on larger screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(min-width: 1024px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      expect(screen.getByTestId('desktop-form-layout')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks form interactions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      await user.type(screen.getByTestId('loan-amount-input'), '50000');

      expect(mockAnalytics.track).toHaveBeenCalledWith('credit_application_field_updated', {
        field: 'loanAmount',
        value: 50000,
      });
    });

    it('tracks file upload events', async () => {
      mockFileUpload.uploadFile.mockResolvedValue({
        success: true,
        fileId: 'file-123',
        fileName: 'tax_return.pdf',
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('tax-return-file-input');
      const file = testUtils.createMockFile('tax_return.pdf', 'PDF content', 'application/pdf');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockAnalytics.track).toHaveBeenCalledWith('document_uploaded', {
          documentType: 'tax_return',
          fileName: 'tax_return.pdf',
          fileSize: expect.any(Number),
        });
      });
    });

    it('tracks form abandonment', () => {
      const { unmount } = render(
        <TestWrapper>
          <CreditApplication />
        </TestWrapper>
      );

      // Simulate partial form completion
      fireEvent.change(screen.getByTestId('loan-amount-input'), { target: { value: '50000' } });

      unmount();

      expect(mockAnalytics.track).toHaveBeenCalledWith('credit_application_abandoned', {
        completionPercentage: expect.any(Number),
        timeSpent: expect.any(Number),
      });
    });
  });
});
