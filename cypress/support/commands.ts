/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to drag and drop elements
       * @example cy.get('.source').drag('.target')
       */
      drag(targetSelector: string): Chainable<Element>;

      /**
       * Custom command to login with Auth0
       * @example cy.loginWithAuth0('user@example.com', 'password')
       */
      loginWithAuth0(email: string, password: string): Chainable<void>;

      /**
       * Custom command to mock WebSocket messages
       * @example cy.mockWebSocketMessage({ type: 'transaction_update', data: {...} })
       */
      mockWebSocketMessage(message: any): Chainable<void>;

      /**
       * Custom command to verify file download
       * @example cy.verifyDownload('transactions.csv')
       */
      verifyDownload(fileName: string): Chainable<void>;
    }
  }
}

// Drag and drop command
Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetSelector) => {
  cy.wrap(subject).trigger('dragstart');
  cy.get(targetSelector).trigger('drop');
  cy.get(targetSelector).trigger('dragend');
  return cy.wrap(subject);
});

// Auth0 login command
Cypress.Commands.add('loginWithAuth0', (email: string, password: string) => {
  // This would integrate with Auth0's authentication flow
  // For now, we'll mock it
  cy.window().then(win => {
    win.localStorage.setItem('authToken', 'mock-auth-token');
    win.localStorage.setItem('userEmail', email);
    win.localStorage.setItem('isAuthenticated', 'true');
  });
});

// Mock WebSocket message command
Cypress.Commands.add('mockWebSocketMessage', (message: any) => {
  cy.window().then(win => {
    // Dispatch custom event that the app listens to
    const event = new CustomEvent('ws-message', {
      detail: message,
    });
    win.dispatchEvent(event);
  });
});

// Verify download command
Cypress.Commands.add('verifyDownload', (fileName: string) => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.readFile(`${downloadsFolder}/${fileName}`, { timeout: 15000 }).should('exist');
});

export {};
