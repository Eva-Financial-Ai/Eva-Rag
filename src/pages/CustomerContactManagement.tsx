import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import ContactRoleManager from '../components/common/ContactRoleManager';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  TagIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { roleDisplayNames } from '../types/UserTypes';

import { debugLog } from '../utils/auditLogger';

// Mock types to replace deleted services
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Customer {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  industry?: string;
  email: string;
  phone?: string;
  tags?: string[];
}

interface ContactRelationshipSummary {
  relationshipType: string;
  role: string;
  entityId: string;
  entityType: string;
  entityName?: string;
}

const CustomerContactManagement: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedTab, setSelectedTab] = useState<'customer-contacts' | 'transaction-team'>('customer-contacts');
  const [contactRelationships, setContactRelationships] = useState<ContactRelationshipSummary[]>([]);
  const [activeContacts, setActiveContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<any[]>([]);
  
  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Mock customer data - replace with actual API call
        const mockCustomer: Customer = {
          id: customerId,
          name: 'Sample Customer',
          type: 'business',
          status: 'active',
          industry: 'Manufacturing',
          email: 'contact@samplecustomer.com',
          phone: '555-0123',
          tags: ['high-value', 'verified']
        };
        
        setCustomer(mockCustomer);
        
        // Mock contacts data - replace with actual API call
        const mockContacts: Contact[] = [
          {
            id: 'contact-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-0123'
          }
        ];
        
        setActiveContacts(mockContacts);
        
        // Mock relationship data
        const mockRelationships: ContactRelationshipSummary[] = [
          {
            relationshipType: 'primary',
            role: 'admin',
            entityId: customerId,
            entityType: 'customer',
            entityName: 'Sample Customer'
          }
        ];
        
        setContactRelationships(mockRelationships);
        
        // Mock related transactions for demo
        setRelatedTransactions([
          {
            id: 'transaction-001',
            name: 'Equipment Financing - CNC Machine',
            status: 'active',
            amount: 250000,
            dateCreated: '2023-05-15',
          },
          {
            id: 'transaction-002',
            name: 'Working Capital Line of Credit',
            status: 'pending',
            amount: 100000,
            dateCreated: '2023-06-02',
          }
        ]);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError('An error occurred while fetching customer data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [customerId]);
  
  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId === selectedContactId ? null : contactId);
  };
  
  // Handle contact role/association updates
  const handleContactUpdated = async () => {
    if (!customerId) return;
    
    try {
      // Mock refresh - replace with actual API call
      debugLog('general', 'log_statement', 'Contact updated for customer:', customerId)
    } catch (err) {
      console.error('Error refreshing contacts:', err);
    }
  };
  
  // Get a display-friendly name for a relationship type
  const getRelationshipTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'primary': 'Primary Contact',
      'secondary': 'Secondary Contact',
      'approver': 'Approver',
      'viewer': 'Viewer Only',
    };
    return labels[type] || type;
  };
  
  // Get role label
  const getRoleLabel = (roleId: string): string => {
    return roleDisplayNames[roleId] || roleId;
  };
  
  if (loading) {
    return (
      <PageLayout title="Loading Customer Contact Management..." showBackButton={true} backPath="/customers">
        <div className="w-full flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !customer) {
    return (
      <PageLayout title="Error" showBackButton={true} backPath="/customers">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          {error || 'Customer not found'}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={`Contact Management: ${customer.name}`}
      showBackButton={true}
      backPath="/customers"
    >
      <div className="space-y-6">
        {/* Customer Overview Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-700" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <p className="text-gray-600">
                  {customer.type === 'business' 
                    ? 'Business Account' 
                    : customer.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                customer.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : customer.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </span>
              
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                {customer.industry || 'No Industry'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">{customer.email}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div className="flex flex-wrap gap-1">
                {customer.tags && customer.tags.length > 0 ? (
                  customer.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setSelectedTab('customer-contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'customer-contacts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Customer Contacts
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('transaction-team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'transaction-team'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Transaction Teams
              </div>
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
          {selectedTab === 'customer-contacts' && (
            <div>
              <ContactRoleManager
                entityId={customerId!}
                entityType="customer"
                onUpdate={handleContactUpdated}
              />
            </div>
          )}
          
          {selectedTab === 'transaction-team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Related Transactions</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {relatedTransactions.map(transaction => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium text-gray-900">{transaction.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <div>Amount: ${transaction.amount.toLocaleString()}</div>
                        <div>Created: {new Date(transaction.dateCreated).toLocaleDateString()}</div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/transaction/${transaction.id}/contacts`)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Manage Transaction Team
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {relatedTransactions.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No related transactions found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomerContactManagement; 