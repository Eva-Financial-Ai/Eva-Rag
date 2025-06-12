import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Types for safe forms management
interface SafeForm {
  id: string;
  name: string;
  type:
    | 'loan_application'
    | 'credit_check_authorization'
    | 'collateral_agreement'
    | 'guarantee_form'
    | 'compliance_document'
    | 'kyc_form'
    | 'aml_document'
    | 'tax_form'
    | 'insurance_form'
    | 'other';
  category: 'legal' | 'financial' | 'compliance' | 'operational' | 'regulatory';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'active' | 'expired' | 'archived';
  version: number;
  templateId?: string;
  customerId?: string;
  dealId?: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  approvedBy?: string;
  approvedAt?: string;
  expiryDate?: string;
  description?: string;
  tags: string[];
  formData: Record<string, any>;
  validationRules: Array<{
    field: string;
    rule: 'required' | 'email' | 'phone' | 'numeric' | 'date' | 'custom';
    message: string;
    customRegex?: string;
  }>;
  signatures: Array<{
    signerId: string;
    signerName: string;
    signerEmail: string;
    signedAt?: string;
    ipAddress?: string;
    deviceInfo?: string;
    signatureMethod: 'electronic' | 'digital' | 'wet_signature';
    status: 'pending' | 'signed' | 'declined';
  }>;
  securityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  accessPermissions: Array<{
    userId: string;
    permission: 'read' | 'write' | 'sign' | 'approve';
  }>;
  auditTrail: Array<{
    timestamp: string;
    userId: string;
    action: 'created' | 'modified' | 'approved' | 'rejected' | 'signed' | 'viewed';
    details: string;
    ipAddress?: string;
  }>;
  isTemplate: boolean;
  parentFormId?: string;
  submissionCount: number;
  lastSubmissionDate?: string;
  notificationSettings: {
    emailOnSubmission: boolean;
    emailOnSignature: boolean;
    emailOnApproval: boolean;
    reminderFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  };
}

interface SafeFormsManagerProps {
  onEditForm?: (form: SafeForm) => void;
  onCreateNew?: () => void;
}

// Mock data for demonstration
const mockForms: SafeForm[] = [
  {
    id: '1',
    name: 'Commercial Loan Application Form',
    type: 'loan_application',
    category: 'financial',
    status: 'active',
    version: 2,
    templateId: 'template-001',
    customerId: '1',
    dealId: 'deal-001',
    createdBy: 'John Smith',
    createdAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-20T14:45:00Z',
    approvedBy: 'Jane Doe',
    approvedAt: '2024-01-18T16:20:00Z',
    expiryDate: '2024-12-31T23:59:59Z',
    description: 'Standard commercial loan application form with enhanced KYC requirements',
    tags: ['commercial', 'loan', 'kyc', 'approved'],
    formData: {
      businessName: 'Acme Manufacturing Corp',
      loanAmount: 500000,
      purpose: 'Equipment Purchase',
      collateral: 'Manufacturing Equipment',
    },
    validationRules: [
      { field: 'businessName', rule: 'required', message: 'Business name is required' },
      { field: 'loanAmount', rule: 'numeric', message: 'Loan amount must be numeric' },
      { field: 'contactEmail', rule: 'email', message: 'Valid email address required' },
    ],
    signatures: [
      {
        signerId: 'user-001',
        signerName: 'John Smith',
        signerEmail: 'john@acmemfg.com',
        signedAt: '2024-01-19T10:30:00Z',
        ipAddress: '192.168.1.100',
        deviceInfo: 'Chrome/Windows',
        signatureMethod: 'electronic',
        status: 'signed',
      },
      {
        signerId: 'user-002',
        signerName: 'Sarah Johnson',
        signerEmail: 'sarah@acmemfg.com',
        signatureMethod: 'electronic',
        status: 'pending',
      },
    ],
    securityLevel: 'confidential',
    accessPermissions: [
      { userId: 'user-001', permission: 'read' },
      { userId: 'user-002', permission: 'sign' },
      { userId: 'admin-001', permission: 'approve' },
    ],
    auditTrail: [
      {
        timestamp: '2024-01-15T10:30:00Z',
        userId: 'user-001',
        action: 'created',
        details: 'Form created from template',
        ipAddress: '192.168.1.100',
      },
      {
        timestamp: '2024-01-19T10:30:00Z',
        userId: 'user-001',
        action: 'signed',
        details: 'Electronic signature applied',
        ipAddress: '192.168.1.100',
      },
    ],
    isTemplate: false,
    submissionCount: 1,
    lastSubmissionDate: '2024-01-19T10:30:00Z',
    notificationSettings: {
      emailOnSubmission: true,
      emailOnSignature: true,
      emailOnApproval: true,
      reminderFrequency: 'weekly',
    },
  },
  {
    id: '2',
    name: 'Credit Check Authorization Form',
    type: 'credit_check_authorization',
    category: 'compliance',
    status: 'pending_review',
    version: 1,
    templateId: 'template-002',
    customerId: '2',
    dealId: 'deal-002',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T16:20:00Z',
    lastModified: '2024-01-19T11:30:00Z',
    description: 'Authorization form for credit bureau checks and background verification',
    tags: ['credit-check', 'authorization', 'compliance'],
    formData: {
      applicantName: 'Green Energy Solutions LLC',
      authorizationType: 'Credit Bureau Check',
      consentGiven: true,
    },
    validationRules: [
      { field: 'applicantName', rule: 'required', message: 'Applicant name is required' },
      { field: 'consentGiven', rule: 'required', message: 'Consent must be provided' },
    ],
    signatures: [
      {
        signerId: 'user-003',
        signerName: 'Mike Wilson',
        signerEmail: 'mike@greenenergy.com',
        signatureMethod: 'digital',
        status: 'pending',
      },
    ],
    securityLevel: 'internal',
    accessPermissions: [
      { userId: 'user-003', permission: 'sign' },
      { userId: 'admin-002', permission: 'approve' },
    ],
    auditTrail: [
      {
        timestamp: '2024-01-10T16:20:00Z',
        userId: 'user-002',
        action: 'created',
        details: 'Form created for credit authorization',
        ipAddress: '192.168.1.101',
      },
    ],
    isTemplate: false,
    submissionCount: 0,
    notificationSettings: {
      emailOnSubmission: true,
      emailOnSignature: true,
      emailOnApproval: false,
      reminderFrequency: 'daily',
    },
  },
];

const SafeFormsManager: React.FC<SafeFormsManagerProps> = ({ onEditForm, onCreateNew }) => {
  const [forms, setForms] = useState<SafeForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'draft' | 'pending_review' | 'approved' | 'rejected' | 'active' | 'expired' | 'archived'
  >('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'submissions' | 'expiry'>(
    'modified'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load forms from localStorage
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    setLoading(true);
    try {
      const savedForms = localStorage.getItem('safeForms');
      if (savedForms) {
        setForms(JSON.parse(savedForms));
      } else {
        setForms(mockForms);
        localStorage.setItem('safeForms', JSON.stringify(mockForms));
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
      setForms(mockForms);
    } finally {
      setLoading(false);
    }
  };

  const saveForms = (updatedForms: SafeForm[]) => {
    try {
      localStorage.setItem('safeForms', JSON.stringify(updatedForms));
      setForms(updatedForms);
    } catch (error) {
      console.error('Error saving forms:', error);
      toast.error('Failed to save forms');
    }
  };

  // Filter and sort forms
  const filteredForms = forms
    .filter(form => {
      const matchesSearch =
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
      const matchesType = filterType === 'all' || form.type === filterType;
      const matchesCategory = filterCategory === 'all' || form.category === filterCategory;
      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'modified':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'submissions':
          comparison = a.submissionCount - b.submissionCount;
          break;
        case 'expiry':
          const aExpiry = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
          const bExpiry = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
          comparison = aExpiry - bExpiry;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // CRUD Operations
  const handleCreate = () => {
    onCreateNew?.();
  };

  const handleEdit = (form: SafeForm) => {
    onEditForm?.(form);
  };

  const handleDelete = (formId: string) => {
    const updatedForms = forms.filter(form => form.id !== formId);
    saveForms(updatedForms);
    toast.success('Form deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (form: SafeForm) => {
    const newForm: SafeForm = {
      ...form,
      id: Date.now().toString(),
      name: `${form.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'draft',
      version: 1,
      submissionCount: 0,
      lastSubmissionDate: undefined,
      signatures: form.signatures.map(sig => ({
        ...sig,
        status: 'pending' as const,
        signedAt: undefined,
      })),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          action: 'created' as const,
          details: 'Form duplicated',
        },
      ],
    };
    const updatedForms = [...forms, newForm];
    saveForms(updatedForms);
    toast.success('Form duplicated successfully');
  };

  const handleStatusChange = (
    formId: string,
    newStatus:
      | 'draft'
      | 'pending_review'
      | 'approved'
      | 'rejected'
      | 'active'
      | 'expired'
      | 'archived'
  ) => {
    const updatedForms = forms.map(form =>
      form.id === formId
        ? {
            ...form,
            status: newStatus,
            lastModified: new Date().toISOString(),
            approvedAt: newStatus === 'approved' ? new Date().toISOString() : form.approvedAt,
            approvedBy: newStatus === 'approved' ? 'Current User' : form.approvedBy,
          }
        : form
    );
    saveForms(updatedForms);
    toast.success(`Form status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleSendForSignature = (formId: string) => {
    const updatedForms = forms.map(form => {
      if (form.id === formId) {
        const pendingSignatures = form.signatures.filter(sig => sig.status === 'pending');
        if (pendingSignatures.length === 0) {
          toast.warning('No pending signatures found');
          return form;
        }
        toast.success(`Signature requests sent to ${pendingSignatures.length} signers`);
        return {
          ...form,
          lastModified: new Date().toISOString(),
          auditTrail: [
            ...form.auditTrail,
            {
              timestamp: new Date().toISOString(),
              userId: 'current-user',
              action: 'modified' as const,
              details: `Signature requests sent to ${pendingSignatures.length} signers`,
            },
          ],
        };
      }
      return form;
    });
    saveForms(updatedForms);
  };

  const handleBulkDelete = () => {
    const updatedForms = forms.filter(form => !selectedForms.includes(form.id));
    saveForms(updatedForms);
    toast.success(`${selectedForms.length} forms deleted`);
    setSelectedForms([]);
  };

  const handleBulkStatusChange = (
    status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'active' | 'expired' | 'archived'
  ) => {
    const updatedForms = forms.map(form =>
      selectedForms.includes(form.id)
        ? {
            ...form,
            status,
            lastModified: new Date().toISOString(),
            approvedAt: status === 'approved' ? new Date().toISOString() : form.approvedAt,
            approvedBy: status === 'approved' ? 'Current User' : form.approvedBy,
          }
        : form
    );
    saveForms(updatedForms);
    toast.success(`${selectedForms.length} forms updated`);
    setSelectedForms([]);
  };

  // Export function
  const handleExport = () => {
    const selectedData =
      selectedForms.length > 0 ? forms.filter(form => selectedForms.includes(form.id)) : forms;

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `safe-forms-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Forms exported successfully');
  };

  // Get unique values for filters
  const formTypes = Array.from(new Set(forms.map(form => form.type)));
  const formCategories = Array.from(new Set(forms.map(form => form.category)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'loan_application':
        return '💰';
      case 'credit_check_authorization':
        return '🔍';
      case 'collateral_agreement':
        return '🏦';
      case 'guarantee_form':
        return '🛡️';
      case 'compliance_document':
        return '📋';
      case 'kyc_form':
        return '👤';
      case 'aml_document':
        return '🔒';
      case 'tax_form':
        return '📊';
      case 'insurance_form':
        return '☂️';
      default:
        return '📄';
    }
  };

  const getSignatureStatus = (signatures: SafeForm['signatures']) => {
    const total = signatures.length;
    const signed = signatures.filter(sig => sig.status === 'signed').length;
    const pending = signatures.filter(sig => sig.status === 'pending').length;
    const declined = signatures.filter(sig => sig.status === 'declined').length;

    if (signed === total)
      return { status: 'complete', color: 'text-green-600', text: `${signed}/${total} Complete` };
    if (declined > 0)
      return { status: 'declined', color: 'text-red-600', text: `${declined} Declined` };
    if (pending > 0)
      return { status: 'pending', color: 'text-yellow-600', text: `${pending} Pending` };
    return { status: 'none', color: 'text-gray-600', text: 'No Signatures' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 rounded-lg mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-3">Safe Forms Manager</h1>
            <p className="text-lg opacity-90">
              Secure form management with electronic signatures and compliance tracking
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors flex items-center"
            >
              <span className="mr-2">📝</span>
              Create New Form
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Forms</p>
              <p className="text-2xl font-semibold text-gray-900">
                {forms.filter(form => form.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
              <p className="text-2xl font-semibold text-gray-900">
                {forms.reduce(
                  (sum, form) =>
                    sum + form.signatures.filter(sig => sig.status === 'pending').length,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {forms.reduce((sum, form) => sum + form.submissionCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search forms, description, tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {formTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {formCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="modified">Last Modified</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="submissions">Submissions</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedForms.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-indigo-800">
                {selectedForms.length} form{selectedForms.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('approved')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange('archived')}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  Archive
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedForms([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {filteredForms.length} of {forms.length} forms
            </span>
            <button
              onClick={() => {
                const allIds = filteredForms.map(form => form.id);
                setSelectedForms(selectedForms.length === allIds.length ? [] : allIds);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {selectedForms.length === filteredForms.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Export All
            </button>
            <button
              onClick={loadForms}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Forms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading forms...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl">📋</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No forms found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ||
              filterStatus !== 'all' ||
              filterType !== 'all' ||
              filterCategory !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first form.'}
            </p>
            {!searchTerm &&
              filterStatus === 'all' &&
              filterType === 'all' &&
              filterCategory === 'all' && (
                <button
                  onClick={handleCreate}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Your First Form
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedForms.length === filteredForms.length}
                      onChange={() => {
                        const allIds = filteredForms.map(form => form.id);
                        setSelectedForms(selectedForms.length === allIds.length ? [] : allIds);
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signatures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map(form => {
                  const signatureStatus = getSignatureStatus(form.signatures);
                  return (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedForms.includes(form.id)}
                          onChange={() => {
                            setSelectedForms(prev =>
                              prev.includes(form.id)
                                ? prev.filter(id => id !== form.id)
                                : [...prev, form.id]
                            );
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTypeIcon(form.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {form.name}
                              {form.isTemplate && <span className="ml-1 text-blue-600">📄</span>}
                            </div>
                            <div className="text-sm text-gray-500">{form.description}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {form.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {form.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{form.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 capitalize">
                            {form.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">{form.category}</div>
                          <div className="text-xs text-gray-400">
                            Security: {form.securityLevel}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}
                          >
                            {form.status.replace('_', ' ').charAt(0).toUpperCase() +
                              form.status.replace('_', ' ').slice(1)}
                          </span>
                          <div className="text-sm text-gray-500">v{form.version}</div>
                          {form.expiryDate && (
                            <div className="text-xs text-gray-400">
                              Expires: {formatDate(form.expiryDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${signatureStatus.color}`}>
                            {signatureStatus.text}
                          </div>
                          {form.signatures.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {form.signatures.filter(sig => sig.signedAt).length} completed
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{form.submissionCount}</div>
                          {form.lastSubmissionDate && (
                            <div className="text-xs text-gray-500">
                              Last: {formatDate(form.lastSubmissionDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(form)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Form"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDuplicate(form)}
                            className="text-green-600 hover:text-green-900"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleSendForSignature(form.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send for Signature"
                          >
                            ✍️
                          </button>
                          <div className="relative">
                            <select
                              value={form.status}
                              onChange={e => handleStatusChange(form.id, e.target.value as any)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              title="Change Status"
                            >
                              <option value="draft">Draft</option>
                              <option value="pending_review">Pending Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <button
                            onClick={() => setShowDeleteConfirm(form.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Form</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this form? This action cannot be undone and will
                  remove all associated data, signatures, and audit trails.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeFormsManager;
