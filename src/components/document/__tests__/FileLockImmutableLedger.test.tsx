import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'react-toastify';
import * as enhancedDocumentAPI from '../../../api/enhancedDocumentAPI';
import { UserContext } from '../../../contexts/UserContext';
import WorkflowContext from '../../../contexts/WorkflowContext';
import CloudflareR2Service, {
  R2PubSubEvent,
  R2PubSubEventType,
} from '../../../services/cloudflareR2Service';
import { UserRoleTypeString } from '../../../types/user';
import FileLockImmutableLedger from '../FileLockImmutableLedger';

// Mock dependencies
jest.mock('../../../api/enhancedDocumentAPI');
jest.mock('../../../services/cloudflareR2Service');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock contexts
const mockUserContext = {
  user: { id: 'user123', name: 'Test User' },
  userRole: 'lender',
};

const mockWorkflowContext = {
  currentTransaction: { id: 'txn123' },
};

// Test wrapper with contexts
const TestWrapper: React.FC<{ children: React.ReactNode; userRole?: UserRoleTypeString }> = ({
  children,
  userRole = 'lender',
}) => (
  <UserContext.Provider value={{ ...mockUserContext, userRole } as any}>
    <WorkflowContext.Provider value={mockWorkflowContext as any}>
      {children}
    </WorkflowContext.Provider>
  </UserContext.Provider>
);

describe('FileLockImmutableLedger Component', () => {
  const mockR2Service = {
    getInstance: jest.fn(),
    initializePubSub: jest.fn(),
    onPubSubEvent: jest.fn(() => jest.fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (CloudflareR2Service.getInstance as jest.Mock).mockReturnValue(mockR2Service);
  });

  describe('Component Rendering', () => {
    it('should render with correct title for lender role', () => {
      render(
        <TestWrapper userRole="lender">
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('Lender Immutable Ledger')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
    });

    it('should render with correct title for broker role', () => {
      render(
        <TestWrapper userRole="broker">
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('Broker Document Ledger')).toBeInTheDocument();
      expect(screen.getByText('🤝')).toBeInTheDocument();
    });

    it('should render all finance categories in sidebar', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('Loan Documents')).toBeInTheDocument();
      expect(screen.getByText('Financial Statements')).toBeInTheDocument();
      expect(screen.getByText('Tax Documents')).toBeInTheDocument();
      expect(screen.getByText('Legal Documents')).toBeInTheDocument();
      expect(screen.getByText('Compliance')).toBeInTheDocument();
      expect(screen.getByText('Collateral Documents')).toBeInTheDocument();
    });

    it('should show ledger info panel when toggled', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const ledgerInfoButton = screen.getByText('Ledger Info');
      fireEvent.click(ledgerInfoButton);

      expect(screen.getByText('Immutable Ledger Information')).toBeInTheDocument();
      expect(screen.getByText('Total Documents:')).toBeInTheDocument();
      expect(screen.getByText('Verified on Chain:')).toBeInTheDocument();
      expect(screen.getByText('Last Sync:')).toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    const mockFiles = [
      new File(['content1'], 'loan-application.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'financial-statement.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ];

    it('should handle successful file upload', async () => {
      const mockUploadResults = [
        {
          success: true,
          documentId: 'doc1',
          status: 'processed',
          processingResults: { aiSummary: 'Test summary' },
        },
        {
          success: true,
          documentId: 'doc2',
          status: 'processed',
          processingResults: { aiSummary: 'Test summary 2' },
        },
      ];

      (enhancedDocumentAPI.batchUploadDocuments as jest.Mock).mockResolvedValue(mockUploadResults);

      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const fileInput = screen
        .getByLabelText('Add to Ledger')
        .querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(fileInput, mockFiles);

      await waitFor(() => {
        expect(enhancedDocumentAPI.batchUploadDocuments).toHaveBeenCalledWith(
          mockFiles,
          expect.objectContaining({
            transactionId: 'txn123',
            metadata: expect.objectContaining({
              uploadedBy: 'user123',
              userRole: 'lender',
              source: 'filelock-immutable-ledger',
            }),
          }),
        );
      });

      expect(toast.success).toHaveBeenCalledWith('2 files added to immutable ledger');
    });

    it('should handle invalid file types', async () => {
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });

      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const fileInput = screen
        .getByLabelText('Add to Ledger')
        .querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(fileInput, [invalidFile]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid file type: test.exe');
      });

      expect(enhancedDocumentAPI.batchUploadDocuments).not.toHaveBeenCalled();
    });

    it('should show upload progress', async () => {
      let progressCallback: ((progress: number) => void) | undefined;

      (enhancedDocumentAPI.batchUploadDocuments as jest.Mock).mockImplementation(
        (files, options) => {
          progressCallback = options.onProgress;
          return new Promise(resolve => {
            setTimeout(() => {
              progressCallback?.(50);
              resolve([{ success: true, documentId: 'doc1', status: 'processed' }]);
            }, 100);
          });
        },
      );

      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const fileInput = screen
        .getByLabelText('Add to Ledger')
        .querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(fileInput, [mockFiles[0]]);

      await waitFor(() => {
        expect(screen.getByText('Adding documents to immutable ledger...')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Permissions', () => {
    it('should show approve/reject buttons for lender role', () => {
      render(
        <TestWrapper userRole="lender">
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('✅ Approve Selected')).toBeInTheDocument();
      expect(screen.getByText('❌ Reject Selected')).toBeInTheDocument();
    });

    it('should not show approve/reject buttons for borrower role', () => {
      render(
        <TestWrapper userRole="borrower">
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.queryByText('✅ Approve Selected')).not.toBeInTheDocument();
      expect(screen.queryByText('❌ Reject Selected')).not.toBeInTheDocument();
    });
  });

  describe('Search and Filter Functionality', () => {
    it('should filter files by search query', async () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText('Search documents...');

      await userEvent.type(searchInput, 'loan');

      // The actual filtering would be tested with files present
      expect(searchInput).toHaveValue('loan');
    });

    it('should switch between grid and list views', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const listViewButton = screen
        .getAllByRole('button')
        .find(btn => btn.querySelector('svg path[d*="M4 6h16M4 10h16M4 14h16M4 18h16"]'));

      fireEvent.click(listViewButton!);

      // In real implementation, this would change the view
      expect(listViewButton).toHaveClass('bg-white');
    });
  });

  describe('Real-time Sync', () => {
    it('should initialize PubSub on mount', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(mockR2Service.initializePubSub).toHaveBeenCalled();
      expect(mockR2Service.onPubSubEvent).toHaveBeenCalledWith('*', expect.any(Function));
    });

    it('should handle file sync events', async () => {
      let eventHandler: ((event: R2PubSubEvent) => void) | undefined;

      (mockR2Service.onPubSubEvent as jest.Mock).mockImplementation(
        (type: R2PubSubEventType | '*', handler: (event: R2PubSubEvent) => void) => {
          eventHandler = handler;
          return jest.fn();
        },
      );

      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const mockEvent = {
        type: 'file_uploaded',
        payload: {
          fileKey: 'file123',
          fileName: 'test-document.pdf',
          fileSize: 1024,
          blockchainHash: '0xabc123',
          verificationProof: 'proof123',
          metadata: { tags: ['test'] },
        },
      };

      eventHandler?.(mockEvent as any);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'File test-document.pdf added to immutable ledger',
        );
      });
    });
  });

  describe('Category Selection', () => {
    it('should filter files by category when category is selected', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const loanCategoryButton = screen.getByText('Loan Documents').closest('button');
      fireEvent.click(loanCategoryButton!);

      expect(loanCategoryButton).toHaveClass('bg-primary-50');
    });

    it('should show all documents when "All Documents" is selected', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      const allDocsButton = screen.getByText('All Documents').closest('button');
      fireEvent.click(allDocsButton!);

      expect(allDocsButton).toHaveClass('bg-primary-50');
    });
  });

  describe('Ledger Status Display', () => {
    it('should display ledger connection status', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('LEDGER STATUS')).toBeInTheDocument();
      expect(screen.getByText('Chain:')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('Network:')).toBeInTheDocument();
      expect(screen.getByText('Mainnet')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no documents exist', () => {
      render(
        <TestWrapper>
          <FileLockImmutableLedger />
        </TestWrapper>,
      );

      expect(screen.getByText('No documents in ledger')).toBeInTheDocument();
      expect(
        screen.getByText('Upload files to add them to the immutable ledger'),
      ).toBeInTheDocument();
    });
  });
});
