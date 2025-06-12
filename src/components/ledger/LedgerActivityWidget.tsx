import React, { useState, useEffect } from 'react';
import { immutableLedgerService, LedgerRecord } from '../../services/immutableLedgerService';
import { formatDistanceToNow } from 'date-fns';

interface LedgerActivityWidgetProps {
  customerId?: string;
  transactionId?: string;
  limit?: number;
  compact?: boolean;
}

const LedgerActivityWidget: React.FC<LedgerActivityWidgetProps> = ({
  customerId,
  transactionId,
  limit = 5,
  compact = false
}) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadRecentActivity, 30000);
    return () => clearInterval(interval);
  }, [customerId, transactionId]);

  const loadRecentActivity = async () => {
    try {
      const filter = {
        customerId,
        transactionId
      };
      
      const allRecords = await immutableLedgerService.getRecords(filter);
      setRecords(allRecords.slice(0, limit));
    } catch (error) {
      console.error('Failed to load ledger activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      document_upload: '📄',
      transaction_created: '💼',
      transaction_updated: '✏️',
      customer_action: '👤',
      loan_application: '📋',
      approval_decision: '✅',
      signature_added: '✍️',
      payment_processed: '💳',
      user_login: '🔐',
      permission_change: '🔑',
      data_export: '📊',
      system_event: '⚙️'
    };
    return icons[eventType] || '📝';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No activity recorded yet
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {records.map((record) => (
          <div key={record.id} className="flex items-start space-x-2 text-sm">
            <span className="text-lg">{getEventIcon(record.eventType)}</span>
            <div className="flex-1">
              <p className="text-gray-900">{record.action}</p>
              <p className="text-xs text-gray-500">
                {record.actor.userName} • {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {records.map((record) => (
          <div key={record.id} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getEventIcon(record.eventType)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {record.action}
                </p>
                <p className="text-sm text-gray-500">
                  {record.actor.userName} ({record.actor.userRole})
                </p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}</span>
                  {record.verified && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">✓ Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200">
        <a
          href="/filelock"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View full ledger →
        </a>
      </div>
    </div>
  );
};

export default LedgerActivityWidget;