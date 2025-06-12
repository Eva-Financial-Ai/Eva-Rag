import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserRole } from '../../types/user';
import { MatchResult } from './SmartMatchEngine';

// === TYPES AND INTERFACES ===

interface Contact {
  id: string;
  name: string;
  role: 'borrower' | 'originator' | 'facilitator';
  email: string;
  phone: string;
  company: string;
  assignedTasks: string[];
  performance: {
    avgResponseTime: number; // hours
    completionRate: number; // percentage
    qualityScore: number; // 1-10
  };
  isActive: boolean;
}

interface TransactionTerms {
  principal: number;
  rate: number;
  term: number; // months
  downPayment: number;
  monthlyPayment: number;
  collateralValue: number;
  paymentStructure: 'standard' | 'graduated' | 'balloon' | 'interest_only';
  securityType: string;
  guarantees: string[];
  covenants: string[];
}

interface ROIMetrics {
  expectedROI: number;
  timeToClose: number; // days
  riskAdjustedReturn: number;
  fees: {
    origination: number;
    processing: number;
    underwriting: number;
    broker: number;
  };
  netProfit: number;
  marginCompression: number;
}

interface TaskAssignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Contact ID
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[]; // Other task IDs
  estimatedHours: number;
  actualHours?: number;
  notes: string;
}

interface DealStructureEditorProps {
  userRole: UserRole;
  matchData?: MatchResult;
  onStructureComplete?: (terms: TransactionTerms) => void;
  className?: string;
}

// === MOCK DATA ===

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact_001',
    name: 'Sarah Johnson',
    role: 'facilitator',
    email: 'sarah.johnson@evafi.com',
    phone: '(555) 123-4567',
    company: 'EVA Financial',
    assignedTasks: ['underwriting', 'documentation', 'closing'],
    performance: {
      avgResponseTime: 2.5,
      completionRate: 94,
      qualityScore: 8.7,
    },
    isActive: true,
  },
  {
    id: 'contact_002',
    name: 'Mike Rodriguez',
    role: 'originator',
    email: 'mike.rodriguez@broker.com',
    phone: '(555) 234-5678',
    company: 'Prime Commercial Brokers',
    assignedTasks: ['client_communication', 'document_collection', 'initial_review'],
    performance: {
      avgResponseTime: 1.8,
      completionRate: 88,
      qualityScore: 8.2,
    },
    isActive: true,
  },
  {
    id: 'contact_003',
    name: 'John Smith',
    role: 'borrower',
    email: 'john.smith@sagetechnologies.com',
    phone: '(555) 345-6789',
    company: 'Sage Technologies LLC',
    assignedTasks: ['provide_documentation', 'review_terms', 'sign_agreements'],
    performance: {
      avgResponseTime: 4.2,
      completionRate: 92,
      qualityScore: 7.8,
    },
    isActive: true,
  },
];

const DEFAULT_TASKS: TaskAssignment[] = [
  {
    id: 'task_001',
    title: 'Initial Documentation Review',
    description: 'Review and validate all submitted financial documents',
    assignedTo: 'contact_002',
    dueDate: '2024-01-25T17:00:00Z',
    priority: 'high',
    status: 'in_progress',
    dependencies: [],
    estimatedHours: 8,
    actualHours: 6,
    notes: 'Missing 2023 tax returns - requested from borrower',
  },
  {
    id: 'task_002',
    title: 'Credit Bureau Analysis',
    description: 'Pull and analyze personal and business credit reports',
    assignedTo: 'contact_001',
    dueDate: '2024-01-26T12:00:00Z',
    priority: 'high',
    status: 'completed',
    dependencies: ['task_001'],
    estimatedHours: 4,
    actualHours: 3.5,
    notes: 'Credit scores confirmed - personal 780, business 85',
  },
  {
    id: 'task_003',
    title: 'Equipment Valuation',
    description: 'Coordinate third-party equipment appraisal',
    assignedTo: 'contact_001',
    dueDate: '2024-01-27T15:00:00Z',
    priority: 'medium',
    status: 'pending',
    dependencies: ['task_001'],
    estimatedHours: 12,
    notes: 'Appraisal scheduled for 1/26 - Jones Appraisal Services',
  },
  {
    id: 'task_004',
    title: 'Term Sheet Preparation',
    description: 'Draft and review final term sheet for borrower approval',
    assignedTo: 'contact_001',
    dueDate: '2024-01-28T10:00:00Z',
    priority: 'high',
    status: 'pending',
    dependencies: ['task_002', 'task_003'],
    estimatedHours: 6,
    notes: 'Pending equipment valuation completion',
  },
  {
    id: 'task_005',
    title: 'Legal Documentation',
    description: 'Prepare loan agreement and security documents',
    assignedTo: 'contact_001',
    dueDate: '2024-01-30T17:00:00Z',
    priority: 'medium',
    status: 'pending',
    dependencies: ['task_004'],
    estimatedHours: 16,
    notes: 'Will use standard equipment finance template',
  },
];

// === MAIN COMPONENT ===

const DealStructureEditor: React.FC<DealStructureEditorProps> = ({
  userRole,
  matchData,
  onStructureComplete,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [tasks, setTasks] = useState<TaskAssignment[]>(DEFAULT_TASKS);
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'contacts' | 'tasks' | 'roi'>(
    'overview',
  );
  const [isLoading, setIsLoading] = useState(false);

  // Extract match data from location state or props
  const dealData = location.state || matchData;

  // Transaction terms state
  const [terms, setTerms] = useState<TransactionTerms>({
    principal: dealData?.dealAmount || 1500000,
    rate: dealData?.approvedTerms?.rate || 5.75,
    term: dealData?.approvedTerms?.term || 60,
    downPayment: dealData?.approvedTerms?.downPayment || 150000,
    monthlyPayment: 0, // Will be calculated
    collateralValue: 1750000,
    paymentStructure: 'standard',
    securityType: 'Equipment Lien',
    guarantees: ['Personal Guarantee - John Smith'],
    covenants: ['Monthly Financial Reporting', 'Insurance Maintenance'],
  });

  // Calculate monthly payment
  useEffect(() => {
    const calculatePayment = () => {
      const principal = terms.principal - terms.downPayment;
      const monthlyRate = terms.rate / 100 / 12;
      const numPayments = terms.term;

      if (monthlyRate === 0) {
        return principal / numPayments;
      }

      const payment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

      return Math.round(payment);
    };

    setTerms(prev => ({
      ...prev,
      monthlyPayment: calculatePayment(),
    }));
  }, [terms.principal, terms.rate, terms.term, terms.downPayment]);

  // Calculate ROI metrics
  const roiMetrics: ROIMetrics = {
    expectedROI: 12.5,
    timeToClose: 14,
    riskAdjustedReturn: 11.2,
    fees: {
      origination: terms.principal * 0.015, // 1.5%
      processing: 2500,
      underwriting: 3500,
      broker: terms.principal * 0.005, // 0.5%
    },
    netProfit: terms.principal * 0.025, // 2.5%
    marginCompression: -0.3,
  };

  // Handle task status update
  const updateTaskStatus = useCallback((taskId: string, status: TaskAssignment['status']) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status,
              actualHours: status === 'completed' ? task.estimatedHours : task.actualHours,
            }
          : task,
      ),
    );

    toast.success('Task status updated');
  }, []);

  // Handle contact assignment
  const assignContact = useCallback(
    (taskId: string, contactId: string) => {
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? { ...task, assignedTo: contactId } : task)),
      );

      const contact = contacts.find(c => c.id === contactId);
      toast.success(`Task assigned to ${contact?.name}`);
    },
    [contacts],
  );

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Get priority color
  const getPriorityColor = (priority: TaskAssignment['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: TaskAssignment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Deal Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Deal Summary</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              ${terms.principal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Principal Amount</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{terms.rate}%</div>
            <div className="text-sm text-gray-600">Interest Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{terms.term}</div>
            <div className="text-sm text-gray-600">Term (Months)</div>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
          <span className="text-sm text-gray-600">{getCompletionPercentage()}% Complete</span>
        </div>

        <div className="mb-4 h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {['pending', 'in_progress', 'completed', 'blocked'].map(status => {
            const count = tasks.filter(task => task.status === status).length;
            return (
              <div key={status} className="text-center">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-sm capitalize text-gray-600">{status.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Contacts */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Key Contacts</h3>
        <div className="space-y-4">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
            >
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm capitalize text-gray-600">
                  {contact.role} • {contact.company}
                </div>
                <div className="text-sm text-gray-500">{contact.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Performance: {contact.performance.qualityScore}/10
                </div>
                <div className="text-sm text-gray-600">
                  {contact.performance.completionRate}% completion rate
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render terms tab
  const renderTerms = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Financial Terms</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Principal Amount</label>
            <input
              type="number"
              value={terms.principal}
              onChange={e => setTerms(prev => ({ ...prev, principal: parseInt(e.target.value) }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={terms.rate}
              onChange={e => setTerms(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Term (Months)</label>
            <input
              type="number"
              value={terms.term}
              onChange={e => setTerms(prev => ({ ...prev, term: parseInt(e.target.value) }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Down Payment</label>
            <input
              type="number"
              value={terms.downPayment}
              onChange={e => setTerms(prev => ({ ...prev, downPayment: parseInt(e.target.value) }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Monthly Payment (Calculated)
            </label>
            <input
              type="text"
              value={`$${terms.monthlyPayment.toLocaleString()}`}
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Structure
            </label>
            <select
              value={terms.paymentStructure}
              onChange={e =>
                setTerms(prev => ({
                  ...prev,
                  paymentStructure: e.target.value as TransactionTerms['paymentStructure'],
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="standard">Standard</option>
              <option value="graduated">Graduated</option>
              <option value="balloon">Balloon</option>
              <option value="interest_only">Interest Only</option>
            </select>
          </div>
        </div>

        {/* Security and Guarantees */}
        <div className="mt-6">
          <h4 className="text-md mb-3 font-medium text-gray-700">Security & Guarantees</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Security Type</label>
              <input
                type="text"
                value={terms.securityType}
                onChange={e => setTerms(prev => ({ ...prev, securityType: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Guarantees</label>
              <textarea
                value={terms.guarantees.join('\n')}
                onChange={e =>
                  setTerms(prev => ({
                    ...prev,
                    guarantees: e.target.value.split('\n').filter(g => g.trim()),
                  }))
                }
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="One guarantee per line"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Covenants</label>
              <textarea
                value={terms.covenants.join('\n')}
                onChange={e =>
                  setTerms(prev => ({
                    ...prev,
                    covenants: e.target.value.split('\n').filter(c => c.trim()),
                  }))
                }
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="One covenant per line"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tasks tab
  const renderTasks = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add Task
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <span className="text-gray-500">Assigned to: </span>
                  <span className="font-medium">
                    {contacts.find(c => c.id === task.assignedTo)?.name || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Due: </span>
                  <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Est. Hours: </span>
                  <span className="font-medium">{task.estimatedHours}h</span>
                  {task.actualHours && (
                    <span className="text-gray-500"> (Actual: {task.actualHours}h)</span>
                  )}
                </div>
              </div>

              {task.notes && (
                <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600">
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}

              <div className="mt-3 flex space-x-2">
                {task.status !== 'completed' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
                {task.status === 'pending' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    Start Task
                  </button>
                )}
                <select
                  value={task.assignedTo}
                  onChange={e => assignContact(task.id, e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render ROI tab
  const renderROI = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">ROI Analysis</h3>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{roiMetrics.expectedROI}%</div>
            <div className="text-sm text-gray-600">Expected ROI</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{roiMetrics.timeToClose}</div>
            <div className="text-sm text-gray-600">Days to Close</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${roiMetrics.netProfit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Net Profit</div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mb-6">
          <h4 className="text-md mb-3 font-medium text-gray-700">Fee Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(roiMetrics.fees).map(([feeType, amount]) => (
              <div key={feeType} className="flex justify-between border-b border-gray-100 py-2">
                <span className="capitalize text-gray-600">{feeType.replace('_', ' ')} Fee</span>
                <span className="font-medium">${amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 font-semibold">
              <span>Total Fees</span>
              <span>
                $
                {Object.values(roiMetrics.fees)
                  .reduce((sum, fee) => sum + fee, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div>
          <h4 className="text-md mb-3 font-medium text-gray-700">Risk Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded bg-gray-50 p-3">
              <div className="text-sm text-gray-600">Risk-Adjusted Return</div>
              <div className="text-lg font-semibold">{roiMetrics.riskAdjustedReturn}%</div>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <div className="text-sm text-gray-600">Margin Compression</div>
              <div className="text-lg font-semibold text-red-600">
                {roiMetrics.marginCompression}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Structure Editor</h2>
          <p className="text-sm text-gray-600">
            {dealData?.borrowerName || 'Sage Technologies LLC'} • $
            {terms.principal.toLocaleString()} Equipment Finance
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => onStructureComplete?.(terms)}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Finalize Structure
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'terms', label: 'Terms' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'roi', label: 'ROI Analysis' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'terms' && renderTerms()}
        {activeTab === 'contacts' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Management</h3>
            <p className="text-gray-600">Contact management features coming soon...</p>
          </div>
        )}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'roi' && renderROI()}
      </div>
    </div>
  );
};

export default DealStructureEditor;
