import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Checkbox } from '../../components/common/Checkbox';
import { Input } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/common/Tabs';
import { useCustomer } from '../../contexts/CustomerContext';
import { useTransaction } from '../../contexts/TransactionContext';
import crmService, {
  CRMActivity,
  CRMDashboardData,
  CustomerCommunication,
  CustomerDocument,
  CustomerNote,
  TransactionDocument,
} from '../../services/CRMService';
import DocumentUploadModal from '../DocumentUploadModal';

export const CRMDashboard: React.FC = () => {
  const { selectedCustomer, customerHistory, activeTransactions } = useCustomer();
  const { selectedTransaction } = useTransaction();
  const [dashboardData, setDashboardData] = useState<CRMDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState<CustomerDocument[]>([]);
  const [transactionDocuments, setTransactionDocuments] = useState<TransactionDocument[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [newNote, setNewNote] = useState<{
    category: 'general' | 'credit' | 'collection' | 'service' | 'compliance';
    note: string;
    isPrivate: boolean;
  }>({
    category: 'general',
    note: '',
    isPrivate: false,
  });
  const [newCommunication, setNewCommunication] = useState<{
    type: 'email' | 'phone' | 'sms' | 'chat' | 'letter';
    direction: 'inbound' | 'outbound';
    subject: string;
    content: string;
  }>({
    type: 'email',
    direction: 'outbound',
    subject: '',
    content: '',
  });

  const loadDashboardData = React.useCallback(async () => {
    const data = await crmService.getDashboardData();
    setDashboardData(data);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadCustomerData = React.useCallback(async () => {
    if (!selectedCustomer) return;

    const [docs, acts, customerNotes, comms] = await Promise.all([
      crmService.getCustomerDocuments(selectedCustomer.id),
      crmService.getCustomerActivities(selectedCustomer.id),
      crmService.getCustomerNotes(selectedCustomer.id),
      crmService.getCustomerCommunications(selectedCustomer.id),
    ]);

    setCustomerDocuments(docs);
    setActivities(acts);
    setNotes(customerNotes);
    setCommunications(comms);
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerData();
    }
  }, [selectedCustomer, loadCustomerData]);

  const loadTransactionData = React.useCallback(async () => {
    if (!selectedTransaction) return;

    const docs = await crmService.getTransactionDocuments(selectedTransaction.id);
    setTransactionDocuments(docs);
  }, [selectedTransaction]);

  useEffect(() => {
    if (selectedTransaction) {
      loadTransactionData();
    }
  }, [selectedTransaction, loadTransactionData]);

  const handleFileUpload = async (files: File[]) => {
    if (!selectedCustomer) return;

    for (const file of files) {
      await crmService.uploadDocumentWithFileLock(
        file,
        selectedCustomer.id,
        selectedTransaction?.id,
        {
          documentType: 'general',
          purpose: 'application',
        },
      );
    }

    setShowUploadModal(false);
    loadCustomerData();
    if (selectedTransaction) {
      loadTransactionData();
    }
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.note) return;

    await crmService.addCustomerNote({
      customerId: selectedCustomer.id,
      transactionId: selectedTransaction?.id,
      ...newNote,
    });

    setNewNote({ category: 'general', note: '', isPrivate: false });
    setShowNoteModal(false);
    loadCustomerData();
  };

  const handleLogCommunication = async () => {
    if (!selectedCustomer || !newCommunication.content) return;

    await crmService.logCommunication({
      customerId: selectedCustomer.id,
      transactionId: selectedTransaction?.id,
      ...newCommunication,
      to: selectedCustomer.email,
    });

    setNewCommunication({ type: 'email', direction: 'outbound', subject: '', content: '' });
    setShowCommunicationModal(false);
    loadCustomerData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'in-review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!dashboardData) {
    return <div className="flex h-64 items-center justify-center">Loading CRM data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Dashboard</h1>
          {selectedCustomer && (
            <p className="mt-1 text-gray-600">
              Managing: {selectedCustomer.display_name} ({selectedCustomer.type})
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedCustomer}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNoteModal(true)}
            disabled={!selectedCustomer}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Note
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCommunicationModal(true)}
            disabled={!selectedCustomer}
          >
            <Mail className="mr-2 h-4 w-4" />
            Log Communication
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold">{dashboardData.totalCustomers}</p>
              <p className="text-xs text-green-600">
                +{dashboardData.newCustomersThisMonth} this month
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Transactions</p>
              <p className="text-2xl font-bold">{dashboardData.activeTransactions}</p>
              <p className="text-xs text-gray-500">
                {dashboardData.completedTransactions} completed
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold">{dashboardData.totalDocuments}</p>
              <p className="text-xs text-yellow-600">
                {dashboardData.pendingDocuments} pending review
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Tasks</p>
              <p className="text-2xl font-bold">{dashboardData.upcomingTasks.length}</p>
              <p className="text-xs text-gray-500">Due this week</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Recent Activities */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Recent Activities</h3>
              <div className="space-y-3">
                {dashboardData.recentActivities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-600">{activity.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant={activity.priority === 'high' ? 'danger' : 'secondary'}>
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Upcoming Tasks</h3>
              <div className="space-y-3">
                {dashboardData.upcomingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-start gap-3">
                    <Checkbox
                      checked={!!task.completedAt}
                      onCheckedChange={() => {
                        /* Handle task completion */
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.subject}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-400">
                      <Badge variant={task.priority === 'high' ? 'danger' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      <span>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </p>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Customer-specific info if selected */}
          {selectedCustomer && (
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Customer Overview</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Contact Information</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-sm">{selectedCustomer.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Profile</p>
                  <p className="font-medium">
                    Score: {selectedCustomer.metadata.credit_score || 'N/A'}
                  </p>
                  <Badge
                    variant={
                      selectedCustomer.metadata.risk_level === 'low'
                        ? 'success'
                        : selectedCustomer.metadata.risk_level === 'high'
                          ? 'danger'
                          : 'secondary'
                    }
                  >
                    {selectedCustomer.metadata.risk_level || 'Unknown'} Risk
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction Summary</p>
                  <p className="font-medium">{activeTransactions.length} Active</p>
                  <p className="text-sm">{customerHistory.length} Total History</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Document Management</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-64 pl-10"
                  />
                </div>
              </div>
            </div>

            {selectedCustomer ? (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Customer Documents</h4>
                  <div className="space-y-2">
                    {customerDocuments.map(doc => (
                      <div
                        key={doc.documentId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{doc.documentId}</p>
                            <p className="text-sm text-gray-600">
                              {doc.category} • Uploaded{' '}
                              {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.verificationStatus)}
                          <Badge>{doc.verificationStatus}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTransaction && transactionDocuments.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Transaction Documents
                    </h4>
                    <div className="space-y-2">
                      {transactionDocuments.map(doc => (
                        <div
                          key={doc.documentId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{doc.documentType}</p>
                              <p className="text-sm text-gray-600">
                                {doc.purpose} • {doc.required ? 'Required' : 'Optional'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <Badge>{doc.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                Select a customer to view their documents
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Activity Timeline</h3>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.subject}</p>
                          {activity.description && (
                            <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}{' '}
                            by {activity.createdBy}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant={activity.priority === 'high' ? 'danger' : 'secondary'}>
                            {activity.priority}
                          </Badge>
                        </div>
                      </div>
                      {activity.attachments && activity.attachments.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Paperclip className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {activity.attachments.length} attachment(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No activities recorded yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Communication History</h3>
            {communications.length > 0 ? (
              <div className="space-y-4">
                {communications.map(comm => (
                  <div key={comm.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(comm.type)}
                        <span className="font-medium">{comm.subject || 'No subject'}</span>
                        <div className="flex-shrink-0">
                          <Badge variant={comm.direction === 'inbound' ? 'info' : 'primary'}>
                            {comm.direction}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comm.content}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>From: {comm.from}</span>
                      <span>To: {comm.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No communications logged yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Customer Notes</h3>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <Badge variant="info">{note.category}</Badge>
                        {note.isPrivate && <Badge variant="warning">Private</Badge>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No notes added yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showUploadModal && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleFileUpload}
          documentType="general"
          multipleFiles={true}
          acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
        />
      )}

      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Customer Note"
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={newNote.category}
            onChange={value =>
              setNewNote({ ...newNote, category: value as typeof newNote.category })
            }
            options={[
              { value: 'general', label: 'General' },
              { value: 'credit', label: 'Credit' },
              { value: 'collection', label: 'Collection' },
              { value: 'service', label: 'Service' },
              { value: 'compliance', label: 'Compliance' },
            ]}
          />
          <textarea
            className="w-full rounded-lg border p-2"
            rows={4}
            placeholder="Enter your note..."
            value={newNote.note}
            onChange={e => setNewNote({ ...newNote, note: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newNote.isPrivate}
              onChange={e => setNewNote({ ...newNote, isPrivate: e.target.checked })}
            />
            <span className="text-sm">Mark as private</span>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Add Note</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        title="Log Communication"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={newCommunication.type}
              onChange={value =>
                setNewCommunication({
                  ...newCommunication,
                  type: value as typeof newCommunication.type,
                })
              }
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'sms', label: 'SMS' },
                { value: 'chat', label: 'Chat' },
                { value: 'letter', label: 'Letter' },
              ]}
            />
            <Select
              label="Direction"
              value={newCommunication.direction}
              onChange={value =>
                setNewCommunication({
                  ...newCommunication,
                  direction: value as typeof newCommunication.direction,
                })
              }
              options={[
                { value: 'inbound', label: 'Inbound' },
                { value: 'outbound', label: 'Outbound' },
              ]}
            />
          </div>
          <Input
            label="Subject"
            value={newCommunication.subject}
            onChange={e => setNewCommunication({ ...newCommunication, subject: e.target.value })}
            placeholder="Communication subject..."
          />
          <textarea
            className="w-full rounded-lg border p-2"
            rows={4}
            placeholder="Communication details..."
            value={newCommunication.content}
            onChange={e => setNewCommunication({ ...newCommunication, content: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCommunicationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCommunication}>Log Communication</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Re-export for backward compatibility
export default CRMDashboard;
