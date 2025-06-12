/// <reference types="cypress" />

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    // Set consistent viewport
    cy.viewport(1280, 720);
    
    // Stub dynamic content for consistent screenshots
    cy.clock();
    cy.intercept('GET', '/api/**', { fixture: 'api-responses.json' });
  });

  describe('Authentication Pages', () => {
    it('captures login page', () => {
      cy.visit('/login');
      cy.wait(500); // Wait for animations
      cy.percySnapshot('Login Page');
    });

    it('captures login page with errors', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('short');
      cy.get('[data-testid="login-button"]').click();
      cy.wait(500);
      cy.percySnapshot('Login Page - Validation Errors');
    });
  });

  describe('Dashboard Views', () => {
    beforeEach(() => {
      cy.login('admin@eva.ai', 'password');
    });

    it('captures admin dashboard', () => {
      cy.visit('/dashboard');
      cy.wait(1000); // Wait for data load
      cy.percySnapshot('Admin Dashboard');
    });

    it('captures lender dashboard', () => {
      cy.login('lender@bank.com', 'password');
      cy.visit('/dashboard');
      cy.wait(1000);
      cy.percySnapshot('Lender Dashboard');
    });

    it('captures borrower dashboard', () => {
      cy.login('borrower@company.com', 'password');
      cy.visit('/dashboard');
      cy.wait(1000);
      cy.percySnapshot('Borrower Dashboard');
    });
  });

  describe('Credit Application Flow', () => {
    beforeEach(() => {
      cy.login('borrower@company.com', 'password');
    });

    it('captures credit application form - step 1', () => {
      cy.visit('/credit-application');
      cy.wait(500);
      cy.percySnapshot('Credit Application - Business Info');
    });

    it('captures credit application form - step 2', () => {
      cy.visit('/credit-application');
      cy.get('[data-testid="next-step"]').click();
      cy.wait(500);
      cy.percySnapshot('Credit Application - Financial Info');
    });

    it('captures credit application form - step 3', () => {
      cy.visit('/credit-application');
      cy.get('[data-testid="next-step"]').click();
      cy.get('[data-testid="next-step"]').click();
      cy.wait(500);
      cy.percySnapshot('Credit Application - Documents');
    });
  });

  describe('Component States', () => {
    beforeEach(() => {
      cy.login('admin@eva.ai', 'password');
    });

    it('captures button variations', () => {
      cy.visit('/component-sandbox');
      cy.percySnapshot('Button Variations');
    });

    it('captures form controls', () => {
      cy.visit('/component-sandbox#forms');
      cy.percySnapshot('Form Controls');
    });

    it('captures loading states', () => {
      cy.visit('/dashboard');
      cy.intercept('GET', '/api/transactions', { delay: 2000 });
      cy.reload();
      cy.wait(500);
      cy.percySnapshot('Loading States');
    });

    it('captures error states', () => {
      cy.visit('/dashboard');
      cy.intercept('GET', '/api/transactions', { statusCode: 500 });
      cy.reload();
      cy.wait(500);
      cy.percySnapshot('Error States');
    });

    it('captures empty states', () => {
      cy.visit('/dashboard');
      cy.intercept('GET', '/api/transactions', { body: { transactions: [] } });
      cy.reload();
      cy.wait(500);
      cy.percySnapshot('Empty States');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`captures dashboard on ${name}`, () => {
        cy.viewport(width, height);
        cy.login('admin@eva.ai', 'password');
        cy.visit('/dashboard');
        cy.wait(1000);
        cy.percySnapshot(`Dashboard - ${name}`);
      });
    });
  });

  describe('Theme Variations', () => {
    beforeEach(() => {
      cy.login('admin@eva.ai', 'password');
    });

    it('captures light theme', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="theme-toggle"]').should('exist');
      // Ensure light theme is active
      cy.get('body').should('not.have.class', 'dark');
      cy.wait(500);
      cy.percySnapshot('Dashboard - Light Theme');
    });

    it('captures dark theme', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('body').should('have.class', 'dark');
      cy.wait(500);
      cy.percySnapshot('Dashboard - Dark Theme');
    });

    it('captures high contrast mode', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="settings-menu"]').click();
      cy.get('[data-testid="high-contrast-toggle"]').click();
      cy.wait(500);
      cy.percySnapshot('Dashboard - High Contrast');
    });
  });

  describe('Interactive Elements', () => {
    beforeEach(() => {
      cy.login('admin@eva.ai', 'password');
    });

    it('captures dropdown menus', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="user-menu"]').click();
      cy.wait(300);
      cy.percySnapshot('User Menu - Open');
    });

    it('captures modals', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="create-transaction"]').click();
      cy.wait(500);
      cy.percySnapshot('Create Transaction Modal');
    });

    it('captures tooltips', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="help-icon"]').trigger('mouseenter');
      cy.wait(300);
      cy.percySnapshot('Help Tooltip');
    });

    it('captures notifications', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="trigger-notification"]').click();
      cy.wait(300);
      cy.percySnapshot('Toast Notification');
    });
  });

  describe('Charts and Visualizations', () => {
    beforeEach(() => {
      cy.login('admin@eva.ai', 'password');
    });

    it('captures analytics dashboard', () => {
      cy.visit('/analytics');
      cy.wait(1500); // Wait for charts to render
      cy.percySnapshot('Analytics Dashboard');
    });

    it('captures transaction charts', () => {
      cy.visit('/transactions');
      cy.get('[data-testid="chart-view"]').click();
      cy.wait(1000);
      cy.percySnapshot('Transaction Charts');
    });
  });

  describe('Print Styles', () => {
    it('captures print preview of dashboard', () => {
      cy.login('admin@eva.ai', 'password');
      cy.visit('/dashboard');
      cy.wait(1000);
      
      // Trigger print media query
      cy.window().then((win) => {
        win.matchMedia('print').matches = true;
      });
      
      cy.wait(500);
      cy.percySnapshot('Dashboard - Print View');
    });
  });

  describe('Edge Cases', () => {
    it('captures very long content', () => {
      cy.login('admin@eva.ai', 'password');
      cy.visit('/transactions');
      
      // Inject many transactions
      cy.window().then((win) => {
        const longList = Array(100).fill(null).map((_, i) => ({
          id: i,
          name: `Very Long Transaction Name That Should Wrap Properly ${i}`,
          amount: 1000000 + i,
        }));
        win.localStorage.setItem('mock-transactions', JSON.stringify(longList));
      });
      
      cy.reload();
      cy.wait(1000);
      cy.percySnapshot('Long Content List');
    });

    it('captures RTL layout', () => {
      cy.login('admin@eva.ai', 'password');
      cy.visit('/dashboard');
      
      // Switch to RTL
      cy.get('[data-testid="language-selector"]').select('ar');
      cy.wait(500);
      cy.percySnapshot('Dashboard - RTL Layout');
    });
  });
});

// Helper commands for visual regression
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('waitForImages', () => {
  cy.get('img').each(($img) => {
    cy.wrap($img)
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });
});