import React, { useState } from 'react';
import CustomerSelector, { Customer } from './CustomerSelector';
import TransactionSelector from './TransactionSelector';

import { debugLog } from '../../utils/auditLogger';

interface CustomerTransactionSelectorProps {
  className?: string;
  showCustomerSelector?: boolean;
  showTransactionSelector?: boolean;
  transactionSelectorPosition?: 'fixed' | 'relative';
}

const CustomerTransactionSelector: React.FC<CustomerTransactionSelectorProps> = ({
  className = '',
  showCustomerSelector = true,
  showTransactionSelector = true,
  transactionSelectorPosition = 'fixed',
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    debugLog('general', 'log_statement', 'Customer selected:', customer)
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {showCustomerSelector && (
        <div className="w-64">
          <CustomerSelector onCustomerSelect={handleCustomerSelect} placeholder="Select Customer" />
        </div>
      )}

      {showTransactionSelector && (
        <TransactionSelector
          selectedCustomerId={selectedCustomer?.id || null}
          fixedPosition={transactionSelectorPosition === 'fixed'}
          className={transactionSelectorPosition === 'relative' ? 'w-80' : ''}
        />
      )}
    </div>
  );
};

export default CustomerTransactionSelector;
