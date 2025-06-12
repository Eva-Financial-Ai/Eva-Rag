import React, { useState } from 'react';
import CreditApplication from '../components/CreditApplication';
import DealStructuring from '../components/deal/DealStructuring';
import FilelockDriveIntegrated from '../components/document/FilelockDriveIntegrated';
import EVAMultiChatManager from '../components/EVAMultiChatManager';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { useEventSubscription } from '../hooks/useEventBus';
import { EventPayload } from '../services/EventBusService';

const IntegratedWorkflowDemo: React.FC = () => {
  const [activeView, setActiveView] = useState<'credit' | 'deal' | 'filelock'>('credit');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<string>('Not Started');
  const [eventLog, setEventLog] = useState<Array<{ time: string; event: string; details: any }>>([]);

  // Subscribe to all workflow events for monitoring
  useEventSubscription(
    [
      'credit-application:submitted',
      'credit-application:approved',
      'deal-structuring:initiated',
      'deal-structuring:term-sheet-generated',
      'filelock:document-uploaded',
      'workflow:stage-changed'
    ],
    (payload: EventPayload) => {
      // Log the event
      const logEntry = {
        time: new Date().toLocaleTimeString(),
        event: Object.keys(payload)[0],
        details: payload
      };
      setEventLog(prev => [...prev, logEntry]);

      // Handle navigation based on events
      if (payload.creditApplication?.status === 'submitted') {
        setApplicationId(payload.creditApplication.id);
        setWorkflowStatus('Credit Application Submitted');
        
        // Auto-navigate to deal structuring after delay
        setTimeout(() => {
          setActiveView('deal');
          setWorkflowStatus('Deal Structuring Started');
        }, 2000);
      }

      if (payload.dealStructuring?.status === 'generated') {
        setWorkflowStatus('Term Sheet Generated');
        
        // Auto-navigate to FileLock after delay
        setTimeout(() => {
          setActiveView('filelock');
          setWorkflowStatus('Document Management Active');
        }, 2000);
      }

      if (payload.workflow?.stage) {
        setWorkflowStatus(`Stage: ${payload.workflow.stage}`);
        if (payload.workflow.transactionId) {
          setTransactionId(payload.workflow.transactionId);
        }
      }
    }
  );

  return (
    <WorkflowProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Integrated Workflow Demo: Credit → Deal → Documents
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="text-sm font-medium text-blue-600">{workflowStatus}</span>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1 border-b">
              <button
                onClick={() => setActiveView('credit')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeView === 'credit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                1. Credit Application
              </button>
              <button
                onClick={() => setActiveView('deal')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeView === 'deal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                disabled={!applicationId}
              >
                2. Deal Structuring
              </button>
              <button
                onClick={() => setActiveView('filelock')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeView === 'filelock'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                3. Document Management
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main View */}
            <div className="lg:col-span-3">
              {activeView === 'credit' && (
                <CreditApplication 
                  onSubmit={() => {}}
                  onSave={() => {}}
                />
              )}
              {activeView === 'deal' && <DealStructuring />}
              {activeView === 'filelock' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Document Management</h2>
                  <FilelockDriveIntegrated
                    transactionId={transactionId || undefined}
                    applicationId={applicationId || undefined}
                  />
                </div>
              )}
            </div>

            {/* Event Log Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-3">Event Log</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {eventLog.length === 0 ? (
                    <p className="text-sm text-gray-500">No events yet. Start by submitting a credit application.</p>
                  ) : (
                    eventLog.map((entry, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                        <div className="text-xs text-gray-500">{entry.time}</div>
                        <div className="text-sm font-medium">{entry.event}</div>
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer">Details</summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Complete the Credit Application (75%+ progress)</li>
                  <li>Submit → Automatically navigates to Deal Structuring</li>
                  <li>Select deal options and generate term sheet</li>
                  <li>Documents are automatically synced to FileLock</li>
                  <li>All events are published via the event bus</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* EVA Chat Manager */}
        <EVAMultiChatManager
          currentTransaction={transactionId ? { id: transactionId } : undefined}
        />
      </div>
    </WorkflowProvider>
  );
};

export default IntegratedWorkflowDemo;