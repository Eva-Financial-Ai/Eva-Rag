describe('Transaction Summary', () => {
  beforeEach(() => {
    // Mock Auth0 authentication
    cy.window().then(win => {
      win.localStorage.setItem('authToken', 'mock-token');
      win.localStorage.setItem('userRole', 'lender_admin');
      win.localStorage.setItem('userId', 'John Smith');
    });

    cy.visit('/transaction-summary');
  });

  it('should display transaction summary page', () => {
    cy.contains('h1', 'Transaction Summary').should('be.visible');
    cy.contains('Overview of all active credit transactions').should('be.visible');
  });

  it('should show summary statistics', () => {
    cy.get('[data-testid="stats-total"]').should('exist');
    cy.get('[data-testid="stats-pipeline"]').should('exist');
    cy.get('[data-testid="stats-avg-days"]').should('exist');
    cy.get('[data-testid="stats-high-priority"]').should('exist');
  });

  describe('Customer Filtering', () => {
    it('should filter transactions by customer', () => {
      // Click on customer selector
      cy.get('[placeholder="All Customers"]').click();

      // Select Johns Trucking
      cy.contains('Johns Trucking').click();

      // Verify header shows filtered customer
      cy.contains('Showing transactions for Johns Trucking').should('be.visible');

      // Verify only Johns Trucking transactions are shown
      cy.get('[data-testid="transaction-card"]').each($card => {
        cy.wrap($card).should('contain', 'Johns Trucking');
      });
    });

    it('should show all transactions when no customer selected', () => {
      // Verify default state shows all transactions
      cy.contains('Overview of all active credit transactions').should('be.visible');

      // Count total transactions
      cy.get('[data-testid="transaction-card"]').should('have.length.greaterThan', 3);
    });
  });

  describe('View Modes', () => {
    it('should switch between kanban, grid, and list views', () => {
      // Default should be kanban
      cy.get('[data-testid="kanban-view"]').should('be.visible');

      // Switch to grid view
      cy.get('[title="Grid View"]').click();
      cy.get('[data-testid="grid-view"]').should('be.visible');

      // Switch to list view
      cy.get('[title="List View"]').click();
      cy.get('table').should('be.visible');
      cy.get('thead').should('contain', 'Transaction');
    });
  });

  describe('Drag and Drop', () => {
    it('should move transaction between stages', () => {
      // Find a transaction in Application stage
      cy.get('[data-testid="stage-application"]')
        .find('[data-testid="transaction-card"]')
        .first()
        .as('draggedCard');

      // Drag to Underwriting stage
      cy.get('@draggedCard').drag('[data-testid="stage-underwriting"]');

      // Verify transaction moved
      cy.get('[data-testid="stage-underwriting"]').should('contain', 'TX-001');
    });
  });

  describe('Search and Filter', () => {
    it('should search transactions by name', () => {
      cy.get('[placeholder="Search transactions..."]').type('Acme');

      // Verify filtered results
      cy.get('[data-testid="transaction-card"]').should('have.length', 1);
      cy.get('[data-testid="transaction-card"]').should('contain', 'Acme Industries');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="filter-button"]').click();
      cy.get('select').first().select('underwriting');

      // Verify only underwriting transactions shown
      cy.get('[data-testid="transaction-card"]').each($card => {
        cy.wrap($card).parent().should('have.class', 'stage-underwriting');
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export transactions as CSV', () => {
      cy.get('[data-testid="export-button"]').click();
      cy.contains('Export as CSV').click();

      // Verify download started (would need custom command to verify file)
      cy.readFile('cypress/downloads/transactions_*.csv').should('exist');
    });

    it('should export filtered transactions', () => {
      // Filter by customer first
      cy.get('[placeholder="All Customers"]').click();
      cy.contains('Johns Trucking').click();

      // Export
      cy.get('[data-testid="export-button"]').click();
      cy.contains('Export as PDF').click();

      // Verify PDF contains customer name
      cy.readFile('cypress/downloads/Johns_Trucking_Transactions_*.pdf').should('exist');
    });
  });

  describe('Real-time Updates', () => {
    it('should show WebSocket connection status', () => {
      cy.contains('Live Updates').should('be.visible');
      cy.get('[data-testid="ws-indicator"]').should('have.class', 'bg-green-500');
    });

    it('should receive real-time transaction updates', () => {
      // Mock WebSocket message
      cy.window().then(win => {
        const event = new CustomEvent('ws-message', {
          detail: {
            type: 'transaction_new',
            data: {
              id: 'TX-999',
              borrowerName: 'Test Company',
              amount: 100000,
              status: 'application',
            },
          },
        });
        win.dispatchEvent(event);
      });

      // Verify new transaction appears
      cy.contains('New transaction: Test Company').should('be.visible');
      cy.get('[data-testid="transaction-card"]').should('contain', 'Test Company');
    });
  });

  describe('Transaction Details', () => {
    it('should open transaction detail modal', () => {
      cy.get('[data-testid="transaction-card"]').first().click();

      // Verify modal content
      cy.get('[data-testid="transaction-modal"]').should('be.visible');
      cy.contains('Loan Amount').should('be.visible');
      cy.contains('Team Members').should('be.visible');
      cy.contains('Timeline').should('be.visible');
    });

    it('should edit transaction from detail modal', () => {
      cy.get('[data-testid="transaction-card"]').first().click();
      cy.contains('button', 'Edit Transaction').click();

      // Should navigate to credit application page
      cy.url().should('include', '/credit-application?edit=TX-001');
    });
  });

  describe('Permissions', () => {
    it('should disable drag and drop for users without update permission', () => {
      // Set user role to viewer
      cy.window().then(win => {
        win.localStorage.setItem('userRole', 'viewer');
      });
      cy.reload();

      // Try to drag
      cy.get('[data-testid="transaction-card"]').first().trigger('dragstart');
      cy.get('[data-testid="stage-underwriting"]').trigger('drop');

      // Verify alert message
      cy.on('window:alert', text => {
        expect(text).to.contains('You do not have permission to move transactions');
      });
    });
  });
});
