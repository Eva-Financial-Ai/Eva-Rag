import React, { useState, useEffect } from 'react';
import { LockClosedIcon, XMarkIcon, CheckIcon, DocumentIcon, InformationCircleIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

// Define file types and period options
type FileType = 'Balance Sheet' | 'Tax Returns' | 'Bank Statements' | 'Profit & Loss Statement' | 'Proof Of Ownership' | 'Account receivable aging report';
type PeriodType = '3 Month' | '6 Month' | '1 Year' | 'YTD' | 'MTD';
type DocumentType = 'EXT' | 'MTD' | 'YTD';

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  type: 'individual' | 'business';
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customerId: string;
}

interface DocumentRequest {
  id: string;
  fileType: FileType;
  documentType?: DocumentType;
  periodTime?: PeriodType;
  customPeriod?: string;
  isSelected: boolean;
  notes?: string;
}

interface FileLockRequestEnhancedProps {
  position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onRequestComplete?: (requestData: {
    selectedDocs: DocumentRequest[];
    customer?: Customer;
    contact?: Contact;
    requestNotes?: string;
  }) => void;
  customers?: Customer[];
  contacts?: Contact[];
}

const FileLockRequestEnhanced: React.FC<FileLockRequestEnhancedProps> = ({ 
  position = 'center',
  onRequestComplete,
  customers = [],
  contacts = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [requestNotes, setRequestNotes] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentRequest[]>([
    { 
      id: '1',
      fileType: 'Balance Sheet', 
      documentType: undefined, 
      periodTime: '3 Month', 
      isSelected: false 
    },
    { 
      id: '2',
      fileType: 'Tax Returns', 
      documentType: 'EXT', 
      periodTime: undefined, 
      isSelected: false 
    },
    { 
      id: '3',
      fileType: 'Bank Statements', 
      documentType: 'MTD', 
      periodTime: undefined, 
      isSelected: false 
    },
    { 
      id: '4',
      fileType: 'Profit & Loss Statement', 
      documentType: 'MTD', 
      periodTime: undefined, 
      isSelected: false 
    },
    { 
      id: '5',
      fileType: 'Proof Of Ownership', 
      documentType: undefined, 
      periodTime: undefined, 
      isSelected: false 
    },
    { 
      id: '6',
      fileType: 'Account receivable aging report', 
      documentType: undefined, 
      periodTime: undefined, 
      isSelected: false 
    }
  ]);
  
  // Filter contacts when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setFilteredContacts(contacts.filter(contact => contact.customerId === selectedCustomer.id));
    } else {
      setFilteredContacts([]);
    }
    setSelectedContact(undefined);
  }, [selectedCustomer, contacts]);
  
  // Position styling classes
  const positionClasses = {
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };
  
  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCurrentStep(1);
    }
  };
  
  const handleDocumentSelect = (id: string) => {
    const updatedDocs = selectedDocuments.map(doc => 
      doc.id === id ? { ...doc, isSelected: !doc.isSelected } : doc
    );
    setSelectedDocuments(updatedDocs);
  };
  
  const handlePeriodChange = (id: string, period: PeriodType) => {
    const updatedDocs = selectedDocuments.map(doc => 
      doc.id === id ? { ...doc, periodTime: period } : doc
    );
    setSelectedDocuments(updatedDocs);
  };

  const handleCustomPeriodChange = (id: string, customPeriod: string) => {
    const updatedDocs = selectedDocuments.map(doc => 
      doc.id === id ? { ...doc, customPeriod } : doc
    );
    setSelectedDocuments(updatedDocs);
  };

  const addDocumentRequest = () => {
    const newDoc: DocumentRequest = {
      id: Date.now().toString(),
      fileType: 'Balance Sheet',
      isSelected: true
    };
    setSelectedDocuments([...selectedDocuments, newDoc]);
  };

  const removeDocumentRequest = (id: string) => {
    setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== id));
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = () => {
    if (onRequestComplete) {
      onRequestComplete({
        selectedDocs: selectedDocuments.filter(doc => doc.isSelected),
        customer: selectedCustomer,
        contact: selectedContact,
        requestNotes
      });
    }
    setIsOpen(false);
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Customer & Contact</h3>
              
              {/* Customer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setSelectedCustomer(customer);
                  }}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company ? `(${customer.company})` : ''} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Selection */}
              {selectedCustomer && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <select
                    value={selectedContact?.id || ''}
                    onChange={(e) => {
                      const contact = filteredContacts.find(c => c.id === e.target.value);
                      setSelectedContact(contact);
                    }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a contact...</option>
                    {filteredContacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Request Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Notes (Optional)</label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add any specific instructions or notes for this document request..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Select Documents</h3>
              <button
                onClick={addDocumentRequest}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Document
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedDocuments.map((doc, index) => (
                <div key={doc.id} className="flex items-center border border-gray-200 rounded-lg p-4">
                  <div className="flex-shrink-0 mr-4">
                    <input
                      type="checkbox"
                      checked={doc.isSelected}
                      onChange={() => handleDocumentSelect(doc.id)}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Document Type Selection */}
                    <div>
                      <select
                        value={doc.fileType}
                        onChange={(e) => {
                          const updatedDocs = selectedDocuments.map(d => 
                            d.id === doc.id ? { ...d, fileType: e.target.value as FileType } : d
                          );
                          setSelectedDocuments(updatedDocs);
                        }}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm"
                      >
                        <option value="Balance Sheet">Balance Sheet</option>
                        <option value="Tax Returns">Tax Returns</option>
                        <option value="Bank Statements">Bank Statements</option>
                        <option value="Profit & Loss Statement">Profit & Loss Statement</option>
                        <option value="Proof Of Ownership">Proof Of Ownership</option>
                        <option value="Account receivable aging report">Account Receivable Aging Report</option>
                      </select>
                    </div>

                    {/* Period Selection */}
                    <div className="flex space-x-3">
                      {doc.fileType !== 'Proof Of Ownership' && (
                        <div className="flex-1">
                          <select
                            value={doc.periodTime || ''}
                            onChange={(e) => handlePeriodChange(doc.id, e.target.value as PeriodType)}
                            className="block w-full py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm"
                          >
                            <option value="">Select period...</option>
                            <option value="3 Month">3 Month</option>
                            <option value="6 Month">6 Month</option>
                            <option value="1 Year">1 Year</option>
                            <option value="YTD">YTD</option>
                            <option value="MTD">MTD</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          value={doc.customPeriod || ''}
                          onChange={(e) => handleCustomPeriodChange(doc.id, e.target.value)}
                          placeholder="Custom period/notes..."
                          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {selectedDocuments.length > 1 && (
                    <button
                      onClick={() => removeDocumentRequest(doc.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Request</h3>
            
            {/* Customer & Contact Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
              {selectedCustomer && (
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedCustomer.name} {selectedCustomer.company ? `(${selectedCustomer.company})` : ''}
                </p>
              )}
              {selectedContact && (
                <p className="text-sm text-gray-600">
                  <strong>Contact:</strong> {selectedContact.name} - {selectedContact.email}
                </p>
              )}
              {requestNotes && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Notes:</strong> {requestNotes}
                </p>
              )}
            </div>

            {/* Documents Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Requested Documents ({selectedDocuments.filter(d => d.isSelected).length})</h4>
              <div className="space-y-2">
                {selectedDocuments.filter(doc => doc.isSelected).map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{doc.fileType}</p>
                      {doc.periodTime && (
                        <p className="text-sm text-gray-600">Period: {doc.periodTime}</p>
                      )}
                      {doc.customPeriod && (
                        <p className="text-sm text-gray-600">Notes: {doc.customPeriod}</p>
                      )}
                    </div>
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Floating lock button - only show if not center position */}
      {position !== 'center' && (
        <button
          onClick={toggleModal}
          className={`fixed ${positionClasses[position]} z-30 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300`}
          aria-label="Request Documents"
        >
          <LockClosedIcon className="h-6 w-6" />
        </button>
      )}
      
      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={toggleModal}></div>
            
            {/* Modal panel */}
            <div className={`relative bg-white rounded-lg max-w-4xl w-full mx-auto shadow-xl transform transition-all ${position === 'center' ? 'max-h-[90vh]' : ''}`}>
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2 text-primary-600" />
                  <h2 className="text-xl font-medium text-gray-900">Document Request</h2>
                  <span className="ml-3 text-sm text-gray-500">Step {currentStep} of 3</span>
                </div>
                <button onClick={toggleModal} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="px-6 py-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Body */}
              <div className="px-6 py-6 max-h-96 overflow-y-auto">
                {renderStepContent()}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNext}
                      disabled={currentStep === 1 && !selectedCustomer}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={selectedDocuments.filter(d => d.isSelected).length === 0}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileLockRequestEnhanced; 