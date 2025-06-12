import React, { useEffect, useRef, useState } from 'react';

// Define the shape of a transaction for the dropdown
interface TransactionDisplay {
  id: string;
  name: string;
  amount?: number; // Optional: if you want to display amount
  applicantName?: string; // Optional: if you want to display applicant name
}

interface TransactionSelectorDropdownProps {
  transactions: TransactionDisplay[];
  selectedTransaction: TransactionDisplay | null;
  onTransactionSelect: (transaction: TransactionDisplay) => void;
  // Add any other props this component might need, e.g., current applicant display
  currentApplicantInfo?: string;
}

const TransactionSelectorDropdown: React.FC<TransactionSelectorDropdownProps> = ({
  transactions,
  selectedTransaction,
  onTransactionSelect,
  currentApplicantInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!selectedTransaction && transactions.length === 0) {
    return <div className="text-sm text-gray-500">No transactions available.</div>;
  }

  // Fallback if no transaction is selected but there are transactions available
  const displayTransaction = selectedTransaction || transactions[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <div className="flex flex-col text-left">
          <span className="text-xs text-gray-500">
            {currentApplicantInfo || 'Select Applicant'}
          </span>
          <span className="font-semibold">
            {displayTransaction ? displayTransaction.id : 'Select Transaction'}
          </span>
        </div>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && transactions.length > 0 && (
        <div className="absolute right-0 mt-2 z-[9999] w-72 bg-white shadow-lg rounded-md border border-gray-200 origin-top-right">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
              Select Transaction
            </div>
            <div className="max-h-60 overflow-y-auto">
              {transactions.map(transaction => (
                <button
                  key={transaction.id}
                  onClick={() => {
                    onTransactionSelect(transaction);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm ${
                    selectedTransaction?.id === transaction.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="font-semibold">{transaction.id}</div>
                  <div className="text-xs text-gray-600">{transaction.name}</div>
                  {transaction.applicantName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Applicant: {transaction.applicantName}
                    </div>
                  )}
                  {transaction.amount && (
                    <div className="text-xs text-gray-500">
                      Amount: ${transaction.amount.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Chat Icon - to be styled and positioned if needed */}
      {/* <button className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button> */}
    </div>
  );
};

export default TransactionSelectorDropdown;
