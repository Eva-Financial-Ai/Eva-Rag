import { debugLog } from '../utils/auditLogger';

// Role Switching Test Script
// Copy and paste this into your browser console

debugLog('general', 'log_statement', '🔄 Starting Role Switch Test...\n')

// Function to switch role
function switchRole(role) {
  debugLog('general', 'log_statement', `Switching to: ${role}`)
  localStorage.setItem('userRole', role);
  window.dispatchEvent(new CustomEvent('userRoleChange', { detail: { role } }));

  // Check if it worked
  setTimeout(() => {
    const currentRole = localStorage.getItem('userRole');
    const dashboardTitle = document.querySelector('h1')?.textContent;
    debugLog('general', 'log_statement', `✅ Current role: ${currentRole}`)
    debugLog('general', 'log_statement', `📋 Dashboard title: ${dashboardTitle}\n`)
  }, 500);
}

// Test different roles
debugLog('general', 'log_statement', 'Testing role switches...\n')

// Test 1: Switch to Borrower CFO
switchRole('borrower-cfo');

// Test 2: Switch to Lender CCO after 3 seconds
setTimeout(() => {
  switchRole('lender-cco');
}, 3000);

// Test 3: Switch to Broker Principal after 6 seconds
setTimeout(() => {
  switchRole('broker-principal');
}, 6000);

// Test 4: Switch to Vendor Owner after 9 seconds
setTimeout(() => {
  switchRole('vendor-owner');
}, 9000);

// Test 5: Switch back to Borrower Owner after 12 seconds
setTimeout(() => {
  switchRole('borrower-owner');
  debugLog('general', 'log_statement', '✨ Test complete!')
}, 12000);

debugLog('general', 'log_statement', 'Watch the dashboard update every 3 seconds...')
