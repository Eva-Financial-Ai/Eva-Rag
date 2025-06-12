import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DealProgressCardProps {
  id: string;
  name: string;
  amount: number;
  status: string;
  progress: number;
  assignee: {
    name: string;
    avatar: string;
  };
  onClick?: () => void;
}

export const DealProgressCard: React.FC<DealProgressCardProps> = ({ 
  id, 
  name, 
  amount, 
  status, 
  progress, 
  assignee, 
  onClick 
}) => {
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Document Collection': 'bg-blue-100 text-blue-800',
      'Risk Assessment': 'bg-yellow-100 text-yellow-800',
      'Transaction Structuring': 'bg-purple-100 text-purple-800',
      'Document Execution': 'bg-green-100 text-green-800',
      'Funding': 'bg-indigo-100 text-indigo-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Active': 'bg-emerald-100 text-emerald-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/transactions/${id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold text-gray-900">
          {formatCurrency(amount)}
        </div>
        <div className="text-sm text-gray-600">
          {progress}% Complete
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {assignee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="ml-2 text-xs text-gray-600">{assignee.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/transactions/${id}/edit`);
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
