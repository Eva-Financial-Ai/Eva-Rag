describe('FileLock Immutable Ledger E2E Tests', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'mock-token');
      win.localStorage.setItem('user_role', 'lender');
      win.localStorage.setItem('user_id', 'test-user-123');
    });

    // Intercept API calls
    cy.intercept('POST', '/api/documents/upload', {
      statusCode: 200,
      body: {
        success: true,
        documentId: 'doc-123',
        workflowId: 'workflow-123',
        status: 'processing',
      },
    }).as('uploadDocument');

    cy.intercept('GET', '/api/documents/status*', {
      statusCode: 200,
      body: {
        documentId: 'doc-123',
        status: 'processed',
        metadata: {},
        processingResults: {
          ocrText: 'Sample OCR text',
          blockchainTxId: '0xabc123',
        },
      },
    }).as('getDocumentStatus');

    cy.intercept('POST', '/api/r2/presigned-url', {
      statusCode: 200,
      body: {
        uploadUrl: 'https://mock-r2.cloudflare.com/upload',
      },
    }).as('getPresignedUrl');

    // Visit the FileLock page
    cy.visit('/filelock-test');
  });

  describe('Upload Workflow', () => {
    it('should upload a single document successfully', () => {
      // Check page loaded
      cy.contains('Lender Immutable Ledger').should('be.visible');
      cy.contains('All documents secured on ledger').should('be.visible');

      // Upload a file
      const fileName = 'loan-application.pdf';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName,
          mimeType: 'application/pdf',
          encoding: 'base64',
        });
      });

      // Check upload progress
      cy.contains('Adding documents to immutable ledger...').should('be.visible');
      cy.get('.bg-blue-600').should('be.visible'); // Progress bar

      // Wait for upload completion
      cy.wait('@uploadDocument');
      cy.contains('1 file added to immutable ledger').should('be.visible');

      // Verify file appears in the grid
      cy.contains(fileName).should('be.visible');
      cy.contains('Hash: 0x').should('be.visible'); // Immutable hash
    });

    it('should upload multiple documents in batch', () => {
      const files = ['document1.pdf', 'document2.xlsx', 'document3.jpg'];

      // Select multiple files
      cy.get('input[type="file"]').selectFile(
        files.map(f => `cypress/fixtures/${f}`),
        { force: true }
      );

      // Check batch upload progress
      cy.contains('Adding documents to immutable ledger...').should('be.visible');

      // Wait for all uploads
      cy.wait('@uploadDocument');
      cy.wait('@uploadDocument');
      cy.wait('@uploadDocument');

      cy.contains('3 files added to immutable ledger').should('be.visible');

      // Verify all files appear
      files.forEach(fileName => {
        cy.contains(fileName).should('be.visible');
      });
    });

    it('should reject invalid file types', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/invalid.exe', {
        force: true,
      });

      cy.contains('Invalid file type: invalid.exe').should('be.visible');
      cy.get('@uploadDocument').should('not.exist');
    });
  });

  describe('Role-Based Access', () => {
    it('should show approve/reject buttons for lender role', () => {
      cy.contains('✅ Approve Selected').should('be.visible');
      cy.contains('❌ Reject Selected').should('be.visible');
    });

    it('should hide approve/reject buttons for borrower role', () => {
      // Change role to borrower
      cy.window().then((win) => {
        win.localStorage.setItem('user_role', 'borrower');
      });
      cy.reload();

      cy.contains('My Immutable Documents').should('be.visible');
      cy.contains('✅ Approve Selected').should('not.exist');
      cy.contains('❌ Reject Selected').should('not.exist');
    });

    it('should restrict file size based on role', () => {
      // Change to vendor role (10MB limit)
      cy.window().then((win) => {
        win.localStorage.setItem('user_role', 'vendor');
      });
      cy.reload();

      // Try to upload large file
      cy.fixture('large-file.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'large-file.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64',
        });
      });

      cy.contains('File too large: large-file.pdf').should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    beforeEach(() => {
      // Upload test files
      const testFiles = [
        { name: 'loan-application.pdf', category: 'loan' },
        { name: 'balance-sheet.xlsx', category: 'financial' },
        { name: 'tax-return-2023.pdf', category: 'tax' },
      ];

      testFiles.forEach(file => {
        cy.get('input[type="file"]').selectFile(`cypress/fixtures/${file.name}`, {
          force: true,
        });
        cy.wait('@uploadDocument');
      });
    });

    it('should filter documents by search query', () => {
      cy.get('input[placeholder="Search documents..."]').type('loan');
      
      cy.contains('loan-application.pdf').should('be.visible');
      cy.contains('balance-sheet.xlsx').should('not.be.visible');
      cy.contains('tax-return-2023.pdf').should('not.be.visible');
    });

    it('should filter documents by category', () => {
      // Click on Financial Statements category
      cy.contains('Financial Statements').click();

      cy.contains('balance-sheet.xlsx').should('be.visible');
      cy.contains('loan-application.pdf').should('not.be.visible');
      cy.contains('tax-return-2023.pdf').should('not.be.visible');

      // Click on All Documents
      cy.contains('All Documents').click();
      
      cy.contains('loan-application.pdf').should('be.visible');
      cy.contains('balance-sheet.xlsx').should('be.visible');
      cy.contains('tax-return-2023.pdf').should('be.visible');
    });
  });

  describe('Document Actions', () => {
    beforeEach(() => {
      // Upload a test file
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-document.pdf', {
        force: true,
      });
      cy.wait('@uploadDocument');
    });

    it('should select and perform bulk actions', () => {
      // Click on document to select it
      cy.contains('test-document.pdf').parent().parent().click();

      // Check selection UI appears
      cy.contains('1 document selected').should('be.visible');
      cy.contains('Verify on Chain').should('be.visible');

      // Select another document if available
      cy.get('input[type="file"]').selectFile('cypress/fixtures/another-document.pdf', {
        force: true,
      });
      cy.wait('@uploadDocument');
      
      cy.contains('another-document.pdf').parent().parent().click();
      cy.contains('2 documents selected').should('be.visible');
    });

    it('should switch between grid and list views', () => {
      // Default is grid view
      cy.get('.grid').should('be.visible');

      // Switch to list view
      cy.get('button[title*="list"]').click();
      cy.get('table').should('be.visible');
      cy.contains('Ledger Hash').should('be.visible');

      // Switch back to grid
      cy.get('button[title*="grid"]').click();
      cy.get('.grid').should('be.visible');
    });

    it('should show document verification status', () => {
      cy.contains('test-document.pdf').parent().parent().within(() => {
        // Check for hash display
        cy.contains('Hash:').should('be.visible');
        cy.contains('0x').should('be.visible');

        // Check for sync status indicator
        cy.get('.bg-green-500').should('be.visible'); // Synced status
      });
    });
  });

  describe('Ledger Information', () => {
    it('should display ledger connection status', () => {
      cy.contains('LEDGER STATUS').should('be.visible');
      cy.contains('Chain:').next().should('contain', 'Ethereum');
      cy.contains('Network:').next().should('contain', 'Mainnet');
      cy.contains('Status:').next().should('contain', 'Connected');
    });

    it('should toggle ledger info panel', () => {
      // Click ledger info button
      cy.contains('Ledger Info').click();

      // Check panel content
      cy.contains('Immutable Ledger Information').should('be.visible');
      cy.contains('Total Documents:').should('be.visible');
      cy.contains('Verified on Chain:').should('be.visible');
      cy.contains('Last Sync:').should('be.visible');

      // Close panel
      cy.contains('Ledger Info').click();
      cy.contains('Immutable Ledger Information').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle upload failures gracefully', () => {
      // Mock upload failure
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('uploadFailed');

      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-document.pdf', {
        force: true,
      });

      cy.wait('@uploadFailed');
      cy.contains('Failed to upload files. Please try again.').should('be.visible');
    });

    it('should show offline mode when sync fails', () => {
      // Mock WebSocket connection failure
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      cy.contains('Sync error - working offline').should('be.visible');
    });
  });

  describe('Real-time Updates', () => {
    it('should update UI when receiving PubSub events', () => {
      // Simulate incoming WebSocket message
      cy.window().then((win) => {
        const event = new CustomEvent('filelock-pubsub', {
          detail: {
            type: 'file_uploaded',
            payload: {
              fileKey: 'new-file-123',
              fileName: 'realtime-document.pdf',
              fileSize: 1024000,
              blockchainHash: '0xdef456',
            },
          },
        });
        win.dispatchEvent(event);
      });

      cy.contains('File realtime-document.pdf added to immutable ledger').should('be.visible');
      cy.contains('realtime-document.pdf').should('be.visible');
    });
  });
});