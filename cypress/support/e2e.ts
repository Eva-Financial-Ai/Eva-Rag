// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global before hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.window().then(win => {
    win.localStorage.clear();
  });

  // Set default viewport
  cy.viewport(1280, 720);

  // Stub console errors to prevent test failures
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
  });
});
