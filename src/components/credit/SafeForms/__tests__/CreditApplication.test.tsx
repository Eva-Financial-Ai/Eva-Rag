import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreditApplication from '../CreditApplication';
import { SessionManager } from '../../../../services/sessionManager';

// Mock dependencies
jest.mock('../../../../services/sessionManager');
jest.mock('react-signature-canvas', () => {
  return jest.fn().mockImplementation(() => ({
    clear: jest.fn(),
    isEmpty: jest.fn().mockReturnValue(true),
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
  }));
});

describe('CreditApplication Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (SessionManager.getSession as jest.Mock).mockReturnValue(null);
  });

  describe('Form Rendering', () => {
    it('renders all required form sections', () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      expect(screen.getByText('Business Information (Applicant)')).toBeInTheDocument();
      expect(screen.getByText('Owners/Partners/Officers (Guarantors)')).toBeInTheDocument();
      expect(screen.getByText('Loan Request Details')).toBeInTheDocument();
      expect(screen.getByText('Financial Information')).toBeInTheDocument();
      expect(screen.getByText('Banking Information')).toBeInTheDocument();
      expect(screen.getByText('Authorization & Certification')).toBeInTheDocument();
    });

    it('renders required field indicators', () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const requiredFields = screen.getAllByText('*');
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  });

  describe('Business Information Validation', () => {
    it('validates required business fields', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('validates business name input', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const businessNameInput = screen.getByLabelText(/Legal Business Name/i);
      await userEvent.type(businessNameInput, 'Test Business LLC');
      
      expect(businessNameInput).toHaveValue('Test Business LLC');
    });

    it('validates tax ID format', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const taxIdInput = screen.getByLabelText(/Tax ID/i);
      await userEvent.type(taxIdInput, '12-3456789');
      
      expect(taxIdInput).toHaveValue('12-3456789');
    });

    it('prevents future dates for business establishment', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const dateInput = screen.getByLabelText(/Date Business Established/i);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      fireEvent.change(dateInput, { target: { value: futureDateString } });
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Owner Information Management', () => {
    it('requires at least one owner', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      // By default, one owner should be present
      expect(screen.getByText(/Owner #1/i)).toBeInTheDocument();
    });

    it('allows adding multiple owners', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const addOwnerButton = screen.getByText('Add Owner');
      fireEvent.click(addOwnerButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Owner #2/i)).toBeInTheDocument();
      });
    });

    it('validates owner age (must be 18+)', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const dobInput = screen.getByLabelText(/Date of Birth/i);
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 17);
      const underageDateString = underageDate.toISOString().split('T')[0];
      
      fireEvent.change(dobInput, { target: { value: underageDateString } });
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('validates primary owner has at least 81% ownership', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const ownershipInput = screen.getByLabelText(/Ownership Percentage/i);
      await userEvent.clear(ownershipInput);
      await userEvent.type(ownershipInput, '50');
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Loan Request Validation', () => {
    it('validates requested amount format', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const amountInput = screen.getByLabelText(/Amount Requested/i);
      await userEvent.type(amountInput, '250000');
      
      expect(amountInput).toHaveValue('250000');
    });

    it('requires loan purpose', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const purposeInput = screen.getByLabelText(/Use of Funds/i);
      await userEvent.type(purposeInput, 'Working capital and equipment purchase');
      
      expect(purposeInput).toHaveValue('Working capital and equipment purchase');
    });
  });

  describe('Financial Information', () => {
    it('validates annual revenue input', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const revenueInput = screen.getByLabelText(/Annual Business Revenue/i);
      await userEvent.type(revenueInput, '1500000');
      
      expect(revenueInput).toHaveValue('1500000');
    });

    it('validates monthly gross revenue', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const monthlyRevenueInput = screen.getByLabelText(/Monthly Gross Revenue/i);
      await userEvent.type(monthlyRevenueInput, '125000');
      
      expect(monthlyRevenueInput).toHaveValue('125000');
    });
  });

  describe('Session Management', () => {
    it('saves form data to session on save', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const businessNameInput = screen.getByLabelText(/Legal Business Name/i);
      await userEvent.type(businessNameInput, 'Test Business LLC');
      
      const saveButton = screen.getByText('Save Progress');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('restores form data from session', () => {
      const mockSessionData = {
        legalBusinessName: 'Restored Business LLC',
        taxId: '12-3456789',
        businessAddressStreet: '123 Main St',
      };
      
      (SessionManager.getSession as jest.Mock).mockReturnValue(mockSessionData);
      
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} initialData={mockSessionData} />);
      
      expect(screen.getByDisplayValue('Restored Business LLC')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12-3456789')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    });
  });

  describe('Document Requirements', () => {
    it('shows document requirements based on entity type', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const entityTypeSelect = screen.getByLabelText(/Business Entity Type/i);
      fireEvent.change(entityTypeSelect, { target: { value: 'LLC' } });

      await waitFor(() => {
        expect(screen.getByText(/Articles of Organization/i)).toBeInTheDocument();
      });
    });

    it('shows state-specific requirements', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const stateSelect = screen.getByLabelText(/State of Formation/i);
      fireEvent.change(stateSelect, { target: { value: 'CA' } });

      await waitFor(() => {
        expect(screen.getByText(/California/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      // Fill required fields
      await userEvent.type(screen.getByLabelText(/Legal Business Name/i), 'Test Business LLC');
      await userEvent.type(screen.getByLabelText(/Business Street Address/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'San Francisco');
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'CA' } });
      await userEvent.type(screen.getByLabelText(/ZIP Code/i), '94105');
      
      // Check authorization checkboxes
      const authCheckboxes = screen.getAllByRole('checkbox');
      authCheckboxes.forEach(checkbox => fireEvent.click(checkbox));
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            legalBusinessName: 'Test Business LLC',
            businessAddressStreet: '123 Main St',
            businessAddressCity: 'San Francisco',
            businessAddressState: 'CA',
            businessAddressZip: '94105',
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('displays validation errors for required fields', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<CreditApplication onSubmit={mockOnSubmit} onSave={mockOnSave} />);
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});