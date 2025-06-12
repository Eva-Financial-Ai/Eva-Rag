import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Types for contact management
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  companyId?: string;
  companyName?: string;
  relationship: 'primary' | 'secondary' | 'guarantor' | 'reference' | 'partner';
  role: 'decision_maker' | 'influencer' | 'user' | 'technical' | 'financial';
  status: 'active' | 'inactive' | 'pending';
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  preferredContactMethod: 'email' | 'phone' | 'mobile' | 'text';
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  birthday?: string;
  isDecisionMaker: boolean;
  communicationHistory: Array<{
    date: string;
    type: 'email' | 'phone' | 'meeting' | 'text';
    subject: string;
    notes?: string;
  }>;
}

interface ContactManagerProps {
  onEditContact?: (contact: Contact) => void;
  onCreateNew?: () => void;
}

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@acmemfg.com',
    phone: '+1-555-0123',
    mobile: '+1-555-0124',
    title: 'CFO',
    department: 'Finance',
    companyId: '1',
    companyName: 'Acme Manufacturing Corp',
    relationship: 'primary',
    role: 'decision_maker',
    status: 'active',
    address: {
      street: '123 Industrial Way',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA',
    },
    notes: 'Primary decision maker for equipment financing',
    tags: ['key-contact', 'decision-maker', 'finance'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lastContactDate: '2024-01-18T09:15:00Z',
    preferredContactMethod: 'email',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/johnsmith',
    },
    isDecisionMaker: true,
    communicationHistory: [
      {
        date: '2024-01-18T09:15:00Z',
        type: 'email',
        subject: 'Equipment Financing Proposal',
        notes: 'Sent initial proposal',
      },
    ],
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@greenenergy.com',
    phone: '+1-555-0456',
    mobile: '+1-555-0457',
    title: 'Operations Manager',
    department: 'Operations',
    companyId: '2',
    companyName: 'Green Energy Solutions LLC',
    relationship: 'secondary',
    role: 'influencer',
    status: 'active',
    address: {
      street: '456 Solar Drive',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      country: 'USA',
    },
    notes: 'Manages day-to-day operations, influences financing decisions',
    tags: ['operations', 'renewable-energy', 'influencer'],
    createdAt: '2024-01-10T16:20:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
    lastContactDate: '2024-01-17T15:20:00Z',
    preferredContactMethod: 'phone',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
    },
    isDecisionMaker: false,
    communicationHistory: [
      {
        date: '2024-01-17T15:20:00Z',
        type: 'phone',
        subject: 'Solar Equipment Discussion',
        notes: 'Discussed equipment specifications',
      },
    ],
  },
];

const ContactManager: React.FC<ContactManagerProps> = ({ onEditContact, onCreateNew }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>(
    'all'
  );
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'lastContact' | 'company'>(
    'updated'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load contacts from localStorage
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    setLoading(true);
    try {
      const savedContacts = localStorage.getItem('contacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        setContacts(mockContacts);
        localStorage.setItem('contacts', JSON.stringify(mockContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
      setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  };

  const saveContacts = (updatedContacts: Contact[]) => {
    try {
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast.error('Failed to save contacts');
    }
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
      const matchesRelationship =
        filterRelationship === 'all' || contact.relationship === filterRelationship;
      const matchesRole = filterRole === 'all' || contact.role === filterRole;
      return matchesSearch && matchesStatus && matchesRelationship && matchesRole;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'lastContact':
          const aContact = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
          const bContact = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
          comparison = aContact - bContact;
          break;
        case 'company':
          comparison = (a.companyName || '').localeCompare(b.companyName || '');
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // CRUD Operations
  const handleCreate = () => {
    onCreateNew?.();
  };

  const handleEdit = (contact: Contact) => {
    onEditContact?.(contact);
  };

  const handleDelete = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    saveContacts(updatedContacts);
    toast.success('Contact deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (contact: Contact) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      firstName: `${contact.firstName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      communicationHistory: [],
    };
    const updatedContacts = [...contacts, newContact];
    saveContacts(updatedContacts);
    toast.success('Contact duplicated successfully');
  };

  const handleStatusChange = (contactId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, status: newStatus, updatedAt: new Date().toISOString() }
        : contact
    );
    saveContacts(updatedContacts);
    toast.success(`Contact status updated to ${newStatus}`);
  };

  const handleBulkDelete = () => {
    const updatedContacts = contacts.filter(contact => !selectedContacts.includes(contact.id));
    saveContacts(updatedContacts);
    toast.success(`${selectedContacts.length} contacts deleted`);
    setSelectedContacts([]);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive' | 'pending') => {
    const updatedContacts = contacts.map(contact =>
      selectedContacts.includes(contact.id)
        ? { ...contact, status, updatedAt: new Date().toISOString() }
        : contact
    );
    saveContacts(updatedContacts);
    toast.success(`${selectedContacts.length} contacts updated`);
    setSelectedContacts([]);
  };

  // Export function
  const handleExport = () => {
    const selectedData =
      selectedContacts.length > 0
        ? contacts.filter(contact => selectedContacts.includes(contact.id))
        : contacts;

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Contacts exported successfully');
  };

  // Get unique values for filters
  const contactRelationships = Array.from(new Set(contacts.map(contact => contact.relationship)));
  const contactRoles = Array.from(new Set(contacts.map(contact => contact.role)));

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
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'primary':
        return '⭐';
      case 'secondary':
        return '👤';
      case 'guarantor':
        return '🛡️';
      case 'reference':
        return '📋';
      case 'partner':
        return '🤝';
      default:
        return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'decision_maker':
        return 'bg-purple-100 text-purple-800';
      case 'influencer':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-orange-100 text-orange-800';
      case 'financial':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-8 rounded-lg mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-3">Contact Manager</h1>
            <p className="text-lg opacity-90">Manage business contacts and relationship mapping</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add New Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Decision Makers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contacts.filter(contact => contact.isDecisionMaker).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contacts.filter(contact => contact.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(contacts.map(contact => contact.companyId).filter(Boolean)).size}
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
              placeholder="Search contacts, email, company..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Relationship Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <select
              value={filterRelationship}
              onChange={e => setFilterRelationship(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Relationships</option>
              {contactRelationships.map(relationship => (
                <option key={relationship} value={relationship}>
                  {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              {contactRoles.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="company">Company</option>
              <option value="lastContact">Last Contact</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Deactivate
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
                  onClick={() => setSelectedContacts([])}
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
              Showing {filteredContacts.length} of {contacts.length} contacts
            </span>
            <button
              onClick={() => {
                const allIds = filteredContacts.map(contact => contact.id);
                setSelectedContacts(selectedContacts.length === allIds.length ? [] : allIds);
              }}
              className="text-sm text-green-600 hover:text-green-800"
            >
              {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export All
            </button>
            <button
              onClick={loadContacts}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl">👥</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ||
              filterStatus !== 'all' ||
              filterRelationship !== 'all' ||
              filterRole !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first contact.'}
            </p>
            {!searchTerm &&
              filterStatus === 'all' &&
              filterRelationship === 'all' &&
              filterRole === 'all' && (
                <button
                  onClick={handleCreate}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Your First Contact
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
                      checked={selectedContacts.length === filteredContacts.length}
                      onChange={() => {
                        const allIds = filteredContacts.map(contact => contact.id);
                        setSelectedContacts(
                          selectedContacts.length === allIds.length ? [] : allIds
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => {
                          setSelectedContacts(prev =>
                            prev.includes(contact.id)
                              ? prev.filter(id => id !== contact.id)
                              : [...prev, contact.id]
                          );
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {getRelationshipIcon(contact.relationship)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                            {contact.isDecisionMaker && (
                              <span className="ml-1 text-purple-600">⭐</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{contact.title}</div>
                          <div className="text-sm text-gray-500">{contact.department}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{contact.companyName || 'N/A'}</div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(contact.role)}`}
                        >
                          {contact.role.replace('_', ' ').charAt(0).toUpperCase() +
                            contact.role.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                        >
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500 capitalize">
                          {contact.relationship} contact
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{contact.email}</div>
                        <div className="text-gray-500">{contact.phone}</div>
                        <div className="text-xs text-gray-400">
                          Prefers: {contact.preferredContactMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContactDate ? formatDate(contact.lastContactDate) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDuplicate(contact)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <div className="relative">
                          <select
                            value={contact.status}
                            onChange={e => handleStatusChange(contact.id, e.target.value as any)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            title="Change Status"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(contact.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Contact</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this contact? This action cannot be undone.
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

export default ContactManager;
