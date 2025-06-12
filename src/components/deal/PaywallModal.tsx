import { debugLog } from '../../utils/auditLogger';

<button
  onClick={() => debugLog('general', 'log_statement', 'Contact Support clicked')}
  className="text-primary-600 hover:underline bg-transparent border-none p-0 font-medium cursor-pointer text-xs"
>
  Contact Support
</button>;
