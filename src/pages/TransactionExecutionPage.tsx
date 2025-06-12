import React from 'react';
import TransactionExecution from '../components/TransactionExecution';
import { useParams } from 'react-router-dom';

const TransactionExecutionPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionExecution />
    </div>
  );
};

export default TransactionExecutionPage;
