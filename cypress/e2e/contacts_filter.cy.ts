/// <reference types="cypress" />

describe('Contacts filter behaviour', () => {
  beforeEach(() => {
    cy.visit('/contacts');
  });

  it('filters Borrowers correctly', () => {
    cy.contains('button', 'Borrowers').click();
    cy.get('table tbody tr').should('have.length', 1);
    cy.get('table').contains('John Smith');
  });

  it('filters Vendors correctly', () => {
    cy.contains('button', 'Vendors').click();
    cy.get('table tbody tr').should('have.length.at.least', 1);
    cy.get('table').contains('Sarah Johnson');
  });
});
