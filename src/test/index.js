import runComponentTests from './ComponentTesterRunner';

import { debugLog } from '../utils/auditLogger';

// Run the tests when the page loads
window.onload = () => {
  debugLog('general', 'log_statement', 'Starting component test runner...')
  runComponentTests();
};
