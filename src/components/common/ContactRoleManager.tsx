import React, { useState, useEffect } from 'react';
import { useUserType } from '../../contexts/UserTypeContext';
import { BorrowerRole, BrokerRole, LenderRole, VendorRole, roleDisplayNames } from '../../types/UserTypes';

import { debugLog } from '../../utils/auditLogger';

// Mock types to replace deleted services
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType?: string;
  company?: string;
}

interface ContactRelationship {
  id: string;
  contactId: string;
  entityId: string;
  entityType: 'customer' | 'transaction';
  relationshipType: 'primary' | 'secondary' | 'approver' | 'viewer';
  role: string;
}

interface ContactRoleManagerProps {
  entityId: string;
  entityType: 'customer' | 'transaction';
  onUpdate?: () => void;
}

interface ContactOption {
  contact: Contact;
  relationship?: ContactRelationship;
}

const ContactRoleManager: React.FC<ContactRoleManagerProps> = ({ entityId, entityType, onUpdate }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<ContactRelationship[]>([]);
  const [availableContacts, setAvailableContacts] = useState<ContactOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<'primary' | 'secondary' | 'approver' | 'viewer'>('secondary');
  
  const { userType } = useUserType();
  
  // Load existing contacts and relationships for this entity
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock data - replace with actual API calls
        const mockContacts: Contact[] = [
          { id: 'contact-1', name: 'John Doe', email: 'john@example.com', phone: '555-0123', userType: 'borrower', company: 'Doe Industries' },
          { id: 'contact-2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0456', userType: 'broker', company: 'Smith Financial' }
        ];
        
        const mockRelationships: ContactRelationship[] = [
          {
            id: 'rel-1',
            contactId: 'contact-1',
            entityId,
            entityType,
            relationshipType: 'primary',
            role: 'admin'
          }
        ];
        
        setContacts(mockContacts);
        setRelationships(mockRelationships);
        
        // Create contact options with relationship info
        const options: ContactOption[] = mockContacts.map(contact => {
          const relationship = mockRelationships.find(rel => rel.contactId === contact.id);
          return { contact, relationship };
        });
        setAvailableContacts(options);
      } catch (err) {
        console.error("Error fetching contact data:", err);
        setError("Failed to load contacts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [entityId, entityType]);
  
  // Get available roles based on contact type
  const getRolesForUserType = (userType: string) => {
    switch (userType) {
      case 'borrower':
        return Object.values(BorrowerRole).map(role => ({ 
          id: role, 
          label: roleDisplayNames[role] || role
        }));
      case 'broker':
        return Object.values(BrokerRole).map(role => ({ 
          id: role, 
          label: roleDisplayNames[role] || role
        }));
      case 'lender':
        return Object.values(LenderRole).map(role => ({ 
          id: role, 
          label: roleDisplayNames[role] || role
        }));
      case 'vendor':
        return Object.values(VendorRole).map(role => ({ 
          id: role, 
          label: roleDisplayNames[role] || role
        }));
      default:
        return [{ id: 'default_role', label: 'Default Role' }];
    }
  };
  
  // Handle adding a contact
  const handleAddContact = async () => {
    if (!selectedContactId || !selectedRole) return;
    
    try {
      setLoading(true);
      
      const relationship: Omit<ContactRelationship, 'id'> = {
        contactId: selectedContactId,
        entityId,
        entityType,
        relationshipType: selectedRelationshipType,
        role: selectedRole,
      };
      
              const newRelationship = { ...relationship, id: 'rel-' + Date.now() };
        const response = await Promise.resolve({ success: true, data: newRelationship });
        
        if (response.success) {
          // Add this relationship to our list
          if (response.data) {
            setRelationships([...relationships, response.data]);
          }
          
          // Update the contact in our available contacts list
          const updatedAvailableContacts = availableContacts.map(option => {
            if (option.contact.id === selectedContactId) {
              return {
                ...option,
                relationship: response.data,
              };
            }
            return option;
          });
          setAvailableContacts(updatedAvailableContacts);
          
          // Mock reload - no need to fetch again
          debugLog('general', 'log_statement', 'Contact associated successfully')
        
        // Reset selection
        setSelectedContactId('');
        setSelectedRole('');
        
        // Notify parent of update
        if (onUpdate) onUpdate();
      } else {
        setError("Failed to associate contact. Please try again.");
      }
    } catch (err) {
      console.error("Error associating contact:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle removing a contact
  const handleRemoveContact = async (contactId: string) => {
    try {
      setLoading(true);
      
      const response = await Promise.resolve({ success: true });
      
      if (response.success) {
        // Remove this relationship from our list
        setRelationships(relationships.filter(rel => rel.contactId !== contactId));
        
        // Update the contact in our available contacts list
        const updatedAvailableContacts = availableContacts.map(option => {
          if (option.contact.id === contactId) {
            return {
              ...option,
              relationship: undefined,
            };
          }
          return option;
        });
        setAvailableContacts(updatedAvailableContacts);
        
        // Mock reload - no need to fetch again
        debugLog('general', 'log_statement', 'Contact removed successfully')
        
        // Notify parent of update
        if (onUpdate) onUpdate();
      } else {
        setError("Failed to remove contact association. Please try again.");
      }
    } catch (err) {
      console.error("Error removing contact association:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle changing a contact's role
  const handleChangeRole = async (contactId: string, role: string, relationshipType: 'primary' | 'secondary' | 'approver' | 'viewer') => {
    try {
      setLoading(true);
      
      // Find the existing relationship
      const existingRelationship = relationships.find(rel => 
        rel.contactId === contactId && rel.entityId === entityId && rel.entityType === entityType
      );
      
      if (!existingRelationship) {
        setError("Contact relationship not found.");
        setLoading(false);
        return;
      }
      
      const updatedRelationship: Omit<ContactRelationship, 'id'> = {
        ...existingRelationship,
        role,
        relationshipType,
      };
      
              const response = await Promise.resolve({ success: true, data: { ...updatedRelationship, id: 'rel-' + Date.now() } });
      
      if (response.success) {
        // Update this relationship in our list
        const updatedRelationships = relationships.map(rel => {
          if (rel.contactId === contactId && rel.entityId === entityId && rel.entityType === entityType) {
            return {
              ...rel,
              role,
              relationshipType,
            };
          }
          return rel;
        });
        setRelationships(updatedRelationships);
        
        // Update the contact in our available contacts list
        const updatedAvailableContacts = availableContacts.map(option => {
          if (option.contact.id === contactId) {
            return {
              ...option,
              relationship: {
                ...option.relationship!,
                role,
                relationshipType,
              },
            };
          }
          return option;
        });
        setAvailableContacts(updatedAvailableContacts);
        
        // Notify parent of update
        if (onUpdate) onUpdate();
      } else {
        setError("Failed to update contact role. Please try again.");
      }
    } catch (err) {
      console.error("Error changing contact role:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Get role label for display
  const getRoleLabel = (roleId: string): string => {
    return roleDisplayNames[roleId] || roleId;
  };
  
  // Get relationship type label
  const getRelationshipTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'primary': 'Primary Contact',
      'secondary': 'Secondary Contact',
      'approver': 'Approver',
      'viewer': 'Viewer Only',
    };
    return labels[type] || type;
  };
  
  return (
    <div className="contact-role-manager p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {entityType === 'customer' ? 'Customer Contacts' : 'Transaction Team'}
      </h2>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4" role="alert">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Add new contact form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {entityType === 'customer' ? 'Add Contact to Customer' : 'Add Team Member'}
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="contact-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Contact
            </label>
            <select
              id="contact-select"
              className="form-select block w-full"
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select a contact --</option>
              {availableContacts
                .filter(option => !option.relationship) // Only show contacts not already associated
                .map(option => (
                  <option key={option.contact.id} value={option.contact.id}>
                    {option.contact.name} ({option.contact.userType})
                  </option>
                ))
              }
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role-select"
              className="form-select block w-full"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading || !selectedContactId}
            >
              <option value="">-- Select a role --</option>
              {selectedContactId && availableContacts
                .find(option => option.contact.id === selectedContactId)
                ?.contact.userType && 
                getRolesForUserType(
                  availableContacts.find(option => option.contact.id === selectedContactId)!.contact.userType
                ).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))
              }
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="relationship-type-select" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              id="relationship-type-select"
              className="form-select block w-full"
              value={selectedRelationshipType}
              onChange={(e) => setSelectedRelationshipType(e.target.value as any)}
              disabled={loading || !selectedContactId}
            >
              <option value="primary">Primary Contact</option>
              <option value="secondary">Secondary Contact</option>
              <option value="approver">Approver</option>
              <option value="viewer">Viewer Only</option>
            </select>
          </div>
          
          <div className="flex justify-end items-end">
            <button
              type="button"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              onClick={handleAddContact}
              disabled={loading || !selectedContactId || !selectedRole}
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Current contacts list */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {entityType === 'customer' ? 'Current Contacts' : 'Current Team Members'}
        </h3>
        
        {contacts.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center">
            No contacts associated with this {entityType} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map(contact => {
                  const relationship = relationships.find(rel => 
                    rel.contactId === contact.id && 
                    rel.entityId === entityId && 
                    rel.entityType === entityType
                  );
                  
                  return (
                    <tr key={contact.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.company}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {roleDisplayNames[contact.userType] || contact.userType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {relationship ? (
                          <select
                            className="form-select text-sm"
                            value={relationship.role}
                            onChange={(e) => handleChangeRole(
                              contact.id, 
                              e.target.value,
                              relationship.relationshipType
                            )}
                            disabled={loading}
                          >
                            {getRolesForUserType(contact.userType).map(role => (
                              <option key={role.id} value={role.id}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500 italic">No role assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {relationship ? (
                          <select
                            className="form-select text-sm"
                            value={relationship.relationshipType}
                            onChange={(e) => handleChangeRole(
                              contact.id,
                              relationship.role,
                              e.target.value as any
                            )}
                            disabled={loading}
                          >
                            <option value="primary">Primary Contact</option>
                            <option value="secondary">Secondary Contact</option>
                            <option value="approver">Approver</option>
                            <option value="viewer">Viewer Only</option>
                          </select>
                        ) : (
                          <span className="text-gray-500 italic">No relationship</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.email}</div>
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveContact(contact.id)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactRoleManager; 