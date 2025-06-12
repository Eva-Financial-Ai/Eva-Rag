describe('Team Management', () => {
  beforeEach(() => {
    // Mock Auth0 authentication
    cy.window().then(win => {
      win.localStorage.setItem('authToken', 'mock-token');
      win.localStorage.setItem('userRole', 'system_admin');
      win.localStorage.setItem('userId', 'auth0|admin123');
    });

    cy.visit('/team-management');
  });

  it('should display team management page', () => {
    cy.contains('h1', 'Team Management').should('be.visible');
    cy.contains('Manage your team members, roles, and permissions').should('be.visible');
  });

  it('should show team statistics', () => {
    cy.contains('Total Members').should('be.visible');
    cy.contains('Active').should('be.visible');
    cy.contains('Pending').should('be.visible');
    cy.contains('Roles').should('be.visible');
  });

  describe('Data Source Toggle', () => {
    it('should toggle between mock and Auth0 data', () => {
      // Default should be mock data
      cy.contains('Mock Data').should('be.visible');

      // Toggle to Auth0 data
      cy.get('[data-testid="data-source-toggle"]').click();

      // Should show loading state
      cy.get('.animate-spin').should('be.visible');

      // Should show Auth0 data or error message
      cy.contains(/Loaded real Auth0 data|Failed to load Auth0 data/).should('be.visible');
    });
  });

  describe('Team Member Management', () => {
    it('should search team members', () => {
      cy.get('[placeholder="Search by name or email..."]').type('john');

      // Verify filtered results
      cy.get('tbody tr').should('have.length.lessThan', 5);
      cy.get('tbody').should('contain', 'John');
    });

    it('should filter by role', () => {
      cy.get('select').first().select('Loan Officer');

      // Verify filtered results show only Loan Officers
      cy.get('tbody tr').each($row => {
        cy.wrap($row).should('contain', 'Loan Officer');
      });
    });

    it('should filter by status', () => {
      cy.get('select').eq(1).select('active');

      // Verify only active members shown
      cy.get('tbody tr').each($row => {
        cy.wrap($row).find('.bg-green-100').should('contain', 'active');
      });
    });

    it('should sort by columns', () => {
      // Click on Member column to sort
      cy.contains('th', 'Member').click();

      // Verify sort indicator appears
      cy.get('th').first().find('svg').should('be.visible');

      // Click again to reverse sort
      cy.contains('th', 'Member').click();

      // Verify sort direction changed
      cy.get('th').first().find('svg').should('have.class', 'rotate-180');
    });
  });

  describe('Invite Team Member', () => {
    it('should open invite modal', () => {
      cy.contains('button', 'Invite Member').click();

      // Verify modal appears
      cy.contains('h2', 'Invite Team Member').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('select').should('contain', 'Select a role');
    });

    it('should invite new team member', () => {
      cy.contains('button', 'Invite Member').click();

      // Fill form
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('select').select('Loan Officer');

      // Submit
      cy.contains('button', 'Send Invitation').click();

      // Verify success
      cy.contains('Invitation sent successfully').should('be.visible');
      cy.get('tbody').should('contain', 'newuser@example.com');
    });

    it('should validate email format', () => {
      cy.contains('button', 'Invite Member').click();

      // Enter invalid email
      cy.get('input[type="email"]').type('invalid-email');
      cy.contains('button', 'Send Invitation').click();

      // Should show validation error
      cy.contains('Please enter a valid email').should('be.visible');
    });
  });

  describe('Edit Team Member', () => {
    it('should open edit modal', () => {
      cy.get('tbody tr').first().find('[title="Edit"]').click();

      // Verify modal appears with member data
      cy.contains('h2', 'Edit Team Member').should('be.visible');
      cy.get('input[name="name"]').should('have.value', 'John Smith');
    });

    it('should update team member role', () => {
      cy.get('tbody tr').first().find('[title="Edit"]').click();

      // Change role
      cy.get('[data-testid="role-select"]').click();
      cy.contains('Underwriter').click();

      // Save
      cy.contains('button', 'Update').click();

      // Verify update
      cy.contains('Team member updated successfully').should('be.visible');
      cy.get('tbody tr').first().should('contain', 'Underwriter');
    });

    it('should toggle member status', () => {
      cy.get('tbody tr').first().find('[title="Edit"]').click();

      // Toggle status
      cy.get('[data-testid="status-toggle"]').click();

      // Save
      cy.contains('button', 'Update').click();

      // Verify status changed
      cy.get('tbody tr').first().find('.bg-gray-100').should('contain', 'inactive');
    });
  });

  describe('Remove Team Member', () => {
    it('should show confirmation dialog', () => {
      cy.get('tbody tr').first().find('[title="Remove"]').click();

      // Verify confirmation dialog
      cy.on('window:confirm', text => {
        expect(text).to.contains('Are you sure you want to remove this team member?');
        return false; // Cancel
      });
    });

    it('should remove team member on confirmation', () => {
      // Get initial count
      cy.get('tbody tr').then($rows => {
        const initialCount = $rows.length;

        // Remove first member
        cy.get('tbody tr').first().find('[title="Remove"]').click();

        // Confirm
        cy.on('window:confirm', () => true);

        // Verify member removed
        cy.get('tbody tr').should('have.length', initialCount - 1);
      });
    });
  });

  describe('Auth0 Integration', () => {
    it('should load real Auth0 users when toggled', () => {
      // Mock successful Auth0 response
      cy.intercept('POST', '/api/auth0/management-token', {
        statusCode: 200,
        body: { access_token: 'mock-management-token' },
      });

      cy.intercept('GET', '**/api/v2/users*', {
        statusCode: 200,
        body: {
          users: [
            {
              user_id: 'auth0|123',
              email: 'real@auth0.com',
              name: 'Real User',
              created_at: '2024-01-01T00:00:00.000Z',
            },
          ],
          total: 1,
        },
      });

      // Toggle to Auth0 data
      cy.get('[data-testid="data-source-toggle"]').click();

      // Verify real data loaded
      cy.contains('Loaded real Auth0 data').should('be.visible');
      cy.get('tbody').should('contain', 'real@auth0.com');
    });

    it('should handle Auth0 API errors gracefully', () => {
      // Mock failed Auth0 response
      cy.intercept('POST', '/api/auth0/management-token', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      });

      // Toggle to Auth0 data
      cy.get('[data-testid="data-source-toggle"]').click();

      // Should show error and fall back to mock data
      cy.contains('Failed to load Auth0 data').should('be.visible');
      cy.get('tbody').should('contain', 'john.smith@company.com'); // Mock data
    });
  });

  describe('Permissions', () => {
    it('should hide invite button for users without create permission', () => {
      // Set user role to viewer
      cy.window().then(win => {
        win.localStorage.setItem('userRole', 'viewer');
      });
      cy.reload();

      // Invite button should not exist
      cy.contains('button', 'Invite Member').should('not.exist');
    });

    it('should disable edit/remove for users without permissions', () => {
      // Set user role to viewer
      cy.window().then(win => {
        win.localStorage.setItem('userRole', 'viewer');
      });
      cy.reload();

      // Edit and remove buttons should not exist
      cy.get('[title="Edit"]').should('not.exist');
      cy.get('[title="Remove"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');

      // Table should be scrollable
      cy.get('.overflow-hidden').scrollTo('right');

      // Actions should be visible
      cy.get('[title="Edit"]').first().should('be.visible');
    });

    it('should stack filters on mobile', () => {
      cy.viewport('iphone-x');

      // Filters should stack vertically
      cy.get('.md\\:flex-row').should('have.css', 'flex-direction', 'column');
    });
  });
});
