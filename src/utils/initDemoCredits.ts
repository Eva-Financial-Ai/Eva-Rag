/**
 * Utility script to initialize demo credits for the risk report feature
 * 
 * This is used for development/demo purposes only and would not be needed
 * in a production environment where credits would be purchased through
 * a real payment system.
 */

import CreditsService from '../services/CreditsService';

import { debugLog } from './auditLogger';

export const initDemoCredits = (forceReset = false) => {
  // Check if credits have been initialized already
  const existingCredits = localStorage.getItem('availableCredits');
  
  // Initialize with 10 demo credits if not already set or if force reset
  // Increased from 3 to 10 to ensure enough credits for all report types
  if (!existingCredits || forceReset) {
    debugLog('general', 'log_statement', 'Initializing demo credits for risk report feature')
    localStorage.setItem('availableCredits', '10');
  }
  
  // Clear purchased reports if force reset
  if (forceReset) {
    localStorage.removeItem('purchasedReports');
  }
  
  return {
    credits: localStorage.getItem('availableCredits') || '0',
    purchasedReports: localStorage.getItem('purchasedReports') || '[]'
  };
};

/**
 * Add demo credits for testing purposes
 * @param amount - Number of credits to add
 * @returns The updated credits balance
 */
export const addDemoCredits = (amount: number = 50): number => {
  const result = CreditsService.addCredits(amount, 'Demo credits added');
  return result.balance;
};

// Function to reset all reports and credits (for testing)
export const resetDemoCreditsAndReports = () => {
  localStorage.setItem('availableCredits', '10');
  localStorage.removeItem('purchasedReports');
  
  debugLog('general', 'log_statement', 'Reset demo credits to 10 and cleared all purchased reports')
  return {
    credits: '10',
    purchasedReports: '[]'
  };
};

/**
 * Initialize the demo environment with a minimum number of credits
 * @param minCredits - Minimum credits to ensure
 */
export const ensureMinimumDemoCredits = (minCredits: number = 100): void => {
  const currentCredits = CreditsService.getUserCredits();
  
  if (currentCredits.balance < minCredits) {
    const amountToAdd = minCredits - currentCredits.balance;
    if (amountToAdd > 0) {
      CreditsService.addCredits(amountToAdd, 'Demo environment initialization');
    }
  }
};

// Force reset credits for demo (will be triggered on import)
// This ensures the user always has enough credits
(function ensureCreditsForDemo() {
  const currentCredits = parseInt(localStorage.getItem('availableCredits') || '0', 10);
  if (currentCredits < 5) {
    debugLog('general', 'log_statement', `Current credits (${currentCredits}) below minimum threshold, resetting to 10`);
    resetDemoCreditsAndReports();
  }
})();

export default initDemoCredits; 