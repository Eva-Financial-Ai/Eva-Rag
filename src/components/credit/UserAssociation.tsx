import React, { useState, useEffect } from 'react';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import {
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface AssociateUser {
  id: string;
  type: 'borrower_owner' | 'vendor_manufacturer' | 'real_estate_broker' | 'private_party_person' | 'private_party_business' | 'loan_originator' | 'lender' | 'internal_employee';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  department?: string;
  license?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  specialties?: string[];
  previouslyWorkedWith?: boolean;
  lastWorkedDate?: string;
  relationship?: string;
  notes?: string;
}

interface UserAssociationProps {
  onUsersChange?: (users: AssociateUser[]) => void;
  existingUsers?: AssociateUser[];
}

const UserAssociation: React.FC<UserAssociationProps> = ({
  onUsersChange,
  existingUsers = []
}) => {
  const { currentRole, getBaseUserType } = useUserPermissions();
  const [currentStep, setCurrentStep] = useState<'select_type' | 'add_details' | 'list_users'>('select_type');
  const [selectedType, setSelectedType] = useState<AssociateUser['type'] | null>(null);
  const [associatedUsers, setAssociatedUsers] = useState<AssociateUser[]>(existingUsers);
  const [newUser, setNewUser] = useState<Partial<AssociateUser>>({});
  const [showLookup, setShowLookup] = useState(false);
  const [searchResults, setSearchResults] = useState<AssociateUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (onUsersChange) {
      onUsersChange(associatedUsers);
      }
  }, [associatedUsers, onUsersChange]);

  // Mock data for lookup
  const mockDatabase: Record<AssociateUser['type'], AssociateUser[]> = {
    borrower_owner: [
      { id: '1', type: 'borrower_owner', name: 'John Smith', email: 'john@company.com', company: 'ABC Corp', title: 'CEO', previouslyWorkedWith: true, lastWorkedDate: '2023-08-15' },
      { id: '2', type: 'borrower_owner', name: 'Sarah Johnson', email: 'sarah@ventures.com', company: 'Johnson Ventures', title: 'Founder', previouslyWorkedWith: false }
      ],
    vendor_manufacturer: [
      { id: '3', type: 'vendor_manufacturer', name: 'TechCorp Manufacturing', email: 'sales@techcorp.com', company: 'TechCorp', specialties: ['Electronics', 'Industrial Equipment'], previouslyWorkedWith: true, lastWorkedDate: '2023-09-20' },
      { id: '4', type: 'vendor_manufacturer', name: 'Global Suppliers Inc', email: 'info@globalsuppliers.com', company: 'Global Suppliers Inc', specialties: ['Raw Materials', 'Components'], previouslyWorkedWith: false }
    ],
    real_estate_broker: [
      { id: '5', type: 'real_estate_broker', name: 'Mike Thompson', email: 'mike@realty.com', company: 'Elite Realty', license: 'CA-RE-12345', specialties: ['Commercial', 'Industrial'], previouslyWorkedWith: true, lastWorkedDate: '2023-07-10' },
      { id: '6', type: 'real_estate_broker', name: 'Lisa Rodriguez', email: 'lisa@premiumre.com', company: 'Premium Real Estate', license: 'CA-RE-67890', specialties: ['Luxury', 'Investment'], previouslyWorkedWith: false }
    ],
    private_party_person: [
      { id: '7', type: 'private_party_person', name: 'Robert Davis', email: 'robert.davis@email.com', phone: '(555) 123-4567', relationship: 'Individual Seller', previouslyWorkedWith: false },
      { id: '8', type: 'private_party_person', name: 'Emily Chen', email: 'emily.chen@email.com', phone: '(555) 987-6543', relationship: 'Private Investor', previouslyWorkedWith: true, lastWorkedDate: '2023-05-15' }
      ],
    private_party_business: [
      { id: '9', type: 'private_party_business', name: 'Family Holdings LLC', email: 'contact@familyholdings.com', company: 'Family Holdings LLC', relationship: 'Asset Seller', previouslyWorkedWith: false },
      { id: '10', type: 'private_party_business', name: 'Investment Partners Group', email: 'deals@ipg.com', company: 'Investment Partners Group', relationship: 'Business Seller', previouslyWorkedWith: true, lastWorkedDate: '2023-06-30' }
    ],
    loan_originator: [
      { id: '11', type: 'loan_originator', name: 'David Park', email: 'david@quickloans.com', company: 'Quick Capital', license: 'NMLS-123456', specialties: ['Commercial', 'SBA'], previouslyWorkedWith: true, lastWorkedDate: '2023-10-05' },
      { id: '12', type: 'loan_originator', name: 'Amanda Wilson', email: 'amanda@fastfunding.com', company: 'Fast Funding Solutions', license: 'NMLS-789012', specialties: ['Equipment', 'Real Estate'], previouslyWorkedWith: false }
    ],
    lender: [
      { id: '13', type: 'lender', name: 'First National Bank', email: 'commercial@firstnational.com', company: 'First National Bank', specialties: ['Commercial Loans', 'SBA'], previouslyWorkedWith: true, lastWorkedDate: '2023-09-12' },
      { id: '14', type: 'lender', name: 'Capital Funding Corp', email: 'loans@capitalfunding.com', company: 'Capital Funding Corp', specialties: ['Asset-Based', 'Bridge Loans'], previouslyWorkedWith: false }
    ],
    internal_employee: [
      { id: '15', type: 'internal_employee', name: 'Jennifer Lopez', email: 'jennifer.lopez@company.com', department: 'Underwriting', title: 'Senior Underwriter', previouslyWorkedWith: true },
      { id: '16', type: 'internal_employee', name: 'Mark Johnson', email: 'mark.johnson@company.com', department: 'Sales', title: 'Account Manager', previouslyWorkedWith: true }
    ]
  };

  const userTypeOptions = [
    { type: 'borrower_owner' as const, label: 'Borrower Owner', icon: '👤', description: 'Business owner or authorized representative' },
    { type: 'vendor_manufacturer' as const, label: 'Vendor/Manufacturer', icon: '🏭', description: 'Equipment or product supplier' },
    { type: 'real_estate_broker' as const, label: 'Real Estate Broker/Seller', icon: '🏢', description: 'Licensed real estate professional' },
    { type: 'private_party_person' as const, label: 'Private Party - Person', icon: '🙋', description: 'Individual asset seller' },
    { type: 'private_party_business' as const, label: 'Private Party - Business', icon: '🏪', description: 'Business entity asset seller' },
    { type: 'loan_originator' as const, label: 'Loan Originator', icon: '💼', description: 'Licensed loan origination professional' },
    { type: 'lender' as const, label: 'Lender', icon: '🏦', description: 'Financial institution or lending partner' },
    { type: 'internal_employee' as const, label: 'Internal Employee', icon: '👥', description: 'Company team member' }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!selectedType || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = mockDatabase[selectedType].filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(query.toLowerCase()))
    );
    setSearchResults(results);
  };

  const selectFromLookup = (user: AssociateUser) => {
    setAssociatedUsers([...associatedUsers, { ...user, id: Date.now().toString() }]);
    setShowLookup(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentStep('list_users');
  };

  const addNewUser = () => {
    if (!selectedType || !newUser.name || !newUser.email) return;

    const user: AssociateUser = {
      id: Date.now().toString(),
      type: selectedType,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      company: newUser.company || '',
      title: newUser.title || '',
      department: newUser.department || '',
      license: newUser.license || '',
      address: newUser.address || '',
      city: newUser.city || '',
      state: newUser.state || '',
      zip: newUser.zip || '',
      specialties: newUser.specialties || [],
      previouslyWorkedWith: false,
      relationship: newUser.relationship || '',
      notes: newUser.notes || ''
    };

    setAssociatedUsers([...associatedUsers, user]);
    setNewUser({});
    setCurrentStep('list_users');
  };

  const removeUser = (userId: string) => {
    setAssociatedUsers(associatedUsers.filter(user => user.id !== userId));
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Associate Users & Team Members</h3>
        <p className="text-gray-600">Select the type of person you want to add to this application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userTypeOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => {
              setSelectedType(option.type);
              setCurrentStep('add_details');
              setShowLookup(true);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{option.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetailsForm = () => {
    const selectedOption = userTypeOptions.find(opt => opt.type === selectedType);
    if (!selectedOption) return null;

  return (
      <div className="space-y-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{selectedOption.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedOption.label}</h3>
              <p className="text-gray-600">{selectedOption.description}</p>
            </div>
          </div>
            <button
            onClick={() => setCurrentStep('select_type')}
            className="text-gray-500 hover:text-gray-700"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
          </div>

        {/* Lookup Section */}
        {showLookup && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">
              🔍 Search Previous {selectedOption.label}s
            </h4>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-blue-700 font-medium">Found {searchResults.length} previous contacts:</p>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white p-3 rounded border border-blue-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.company && <p className="text-sm text-gray-500">{user.company}</p>}
                      {user.previouslyWorkedWith && (
                        <p className="text-xs text-green-600">Previously worked with • Last: {user.lastWorkedDate}</p>
                      )}
                      </div>
                      <button
                      onClick={() => selectFromLookup(user)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                      Add
                      </button>
                  </div>
                ))}
              </div>
            )}

                  <button
              onClick={() => setShowLookup(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
                  >
              Or add new {selectedOption.label.toLowerCase()} →
                  </button>
                </div>
        )}

        {/* Add New Form */}
        {!showLookup && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add New {selectedOption.label}</h4>
            
            {renderFieldsForType()}

            <div className="flex space-x-3 mt-6">
                      <button
                onClick={addNewUser}
                disabled={!newUser.name || !newUser.email}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                Add {selectedOption.label}
                      </button>
                      <button
                onClick={() => setShowLookup(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                Search Previous Instead
                      </button>
                    </div>
                  </div>
        )}
      </div>
    );
  };

  const renderFieldsForType = () => {
    const baseFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
                      </label>
                        <input
                          type="text"
              value={newUser.name || ''}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newUser.email || ''}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
                      </div>
      </>
    );

    switch (selectedType) {
      case 'borrower_owner':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newUser.company || ''}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                            </div>
                                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position</label>
                <input
                  type="text"
                  value={newUser.title || ''}
                  onChange={(e) => setNewUser({...newUser, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                                    </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newUser.phone || ''}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
                                      </div>
          </>
        );

      case 'vendor_manufacturer':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={newUser.company || ''}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone || ''}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                                </div>
                        </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., Electronics, Industrial Equipment, Raw Materials"
                onChange={(e) => setNewUser({...newUser, specialties: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
                    </div>
          </>
        );

      case 'real_estate_broker':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
                        <input
                          type="text"
                  value={newUser.company || ''}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                  value={newUser.license || ''}
                  onChange={(e) => setNewUser({...newUser, license: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                      <input
                type="text"
                placeholder="e.g., Commercial, Residential, Industrial"
                onChange={(e) => setNewUser({...newUser, specialties: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
          </>
        );

      case 'private_party_person':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                  value={newUser.phone || ''}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newUser.relationship || ''}
                  onChange={(e) => setNewUser({...newUser, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select relationship</option>
                  <option value="asset_seller">Asset Seller</option>
                  <option value="private_investor">Private Investor</option>
                  <option value="individual_seller">Individual Seller</option>
                  <option value="estate_representative">Estate Representative</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'private_party_business':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                  value={newUser.company || ''}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                      <select
                  value={newUser.relationship || ''}
                  onChange={(e) => setNewUser({...newUser, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                  <option value="">Select relationship</option>
                  <option value="business_seller">Business Seller</option>
                  <option value="asset_seller">Asset Seller</option>
                  <option value="equipment_lessor">Equipment Lessor</option>
                  <option value="private_equity">Private Equity</option>
                      </select>
                    </div>
            </div>
          </>
        );

      case 'loan_originator':
      case 'lender':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company/Institution</label>
                <input
                  type="text"
                  value={newUser.company || ''}
                  onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedType === 'loan_originator' ? 'NMLS License' : 'Institution Type'}
                        </label>
                        <input
                          type="text"
                  value={newUser.license || ''}
                  onChange={(e) => setNewUser({...newUser, license: e.target.value})}
                  placeholder={selectedType === 'loan_originator' ? 'NMLS-123456' : 'Bank, Credit Union, etc.'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                          <input
                type="text"
                placeholder="e.g., Commercial, SBA, Equipment, Real Estate"
                onChange={(e) => setNewUser({...newUser, specialties: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
            </div>
          </>
        );

      case 'internal_employee':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newUser.department || ''}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="Underwriting">Underwriting</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Legal">Legal</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                  type="text"
                  value={newUser.title || ''}
                  onChange={(e) => setNewUser({...newUser, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                      </div>
                    </div>
          </>
        );

      default:
        return baseFields;
    }
  };

  const renderUsersList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Associated Users ({associatedUsers.length})</h3>
                    <button
          onClick={() => {
            setCurrentStep('select_type');
            setSelectedType(null);
            setNewUser({});
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
          Add Another User
                    </button>
      </div>

      {associatedUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No users added yet. Click "Add Another User" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {associatedUsers.map((user) => {
            const typeOption = userTypeOptions.find(opt => opt.type === user.type);
            return (
              <div key={user.id} className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{typeOption?.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.company && <p className="text-sm text-gray-500">{user.company}</p>}
                    <p className="text-xs text-blue-600">{typeOption?.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeUser(user.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
            </div>
          )}
        </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {currentStep === 'select_type' && renderTypeSelection()}
      {currentStep === 'add_details' && renderDetailsForm()}
      {currentStep === 'list_users' && renderUsersList()}
    </div>
  );
};

export default UserAssociation;
