import React, { useState, useRef } from 'react';
import {
  ArrowUpTrayIcon,
  DocumentCheckIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: 'active' | 'inactive' | 'pending';
  source?: string;
  enriched?: boolean;
  verified?: boolean;
  linkedinUrl?: string;
  companyWebsite?: string;
  companySize?: string;
  companyIndustry?: string;
  lastContactDate?: string;
  notes?: string;
  tags?: string[];
}

interface ContactImportProps {
  onImportComplete: (contacts: Contact[]) => void;
}

const ContactImport: React.FC<ContactImportProps> = ({ onImportComplete }) => {
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'enrich' | 'verify' | 'complete'>('upload');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedContacts, setImportedContacts] = useState<Contact[]>([]);
  const [enrichedContacts, setEnrichedContacts] = useState<Contact[]>([]);
  const [verifiedContacts, setVerifiedContacts] = useState<Contact[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedImportType, setSelectedImportType] = useState<'csv' | 'excel' | 'google' | 'outlook'>('csv');
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [verifyProgress, setVerifyProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockContacts: Contact[] = [
    {
      id: 'c1',
      name: 'John Smith',
      email: 'john.smith@acmecorp.com',
      phone: '(555) 123-4567',
      company: 'Acme Corporation',
      title: 'CFO',
      status: 'pending',
      source: 'import'
    },
    {
      id: 'c2',
      name: 'Sarah Johnson',
      email: 'sjohnson@example.com',
      phone: '(555) 987-6543',
      company: 'TechGrowth Inc.',
      title: 'VP of Sales',
      status: 'pending',
      source: 'import'
    },
    {
      id: 'c3',
      name: 'Michael Wong',
      email: 'mwong@growth.co',
      phone: '(555) 456-7890',
      company: 'Growth Ventures',
      title: 'CEO',
      status: 'pending',
      source: 'import'
    },
    {
      id: 'c4',
      name: 'Lisa Chen',
      email: 'lchen@innovate.io',
      phone: '(555) 567-8901',
      company: 'Innovate Solutions',
      title: 'Director of Operations',
      status: 'pending',
      source: 'import'
    },
    {
      id: 'c5',
      name: 'Robert Davis',
      email: 'rdavis@finance.com',
      phone: '(555) 234-5678',
      company: 'Finance Partners LLC',
      title: 'Managing Partner',
      status: 'pending',
      source: 'import'
    }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportErrors([]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    setIsProcessing(true);
    
    // Simulate file parsing process
    setTimeout(() => {
      setImportedContacts(mockContacts);
      setImportStep('preview');
      setIsProcessing(false);
    }, 1500);
  };

  const handleEnrich = () => {
    setIsProcessing(true);
    
    // Simulate enrichment process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setEnrichProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        const enriched = mockContacts.map(contact => ({
          ...contact,
          enriched: true,
          companySize: Math.floor(Math.random() * 1000) + ' employees',
          companyIndustry: ['Finance', 'Technology', 'Healthcare', 'Manufacturing', 'Retail'][Math.floor(Math.random() * 5)],
          linkedinUrl: `https://linkedin.com/in/${contact.name.toLowerCase().replace(' ', '-')}`,
          companyWebsite: `https://www.${contact.company.toLowerCase().replace(' ', '')}.com`,
        }));
        
        setEnrichedContacts(enriched);
        setImportStep('verify');
        setIsProcessing(false);
        setVerifyProgress(0);
      }
    }, 500);
  };

  const handleVerify = () => {
    setIsProcessing(true);
    
    // Simulate verification process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setVerifyProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        const verified = enrichedContacts.map(contact => ({
          ...contact,
          verified: Math.random() > 0.2, // 80% chance of verification success
          status: 'active' as const // explicitly type as 'active' to satisfy the union type
        }));
        
        setVerifiedContacts(verified);
        setImportStep('complete');
        setIsProcessing(false);
      }
    }, 400);
  };

  const handleComplete = () => {
    onImportComplete(verifiedContacts);
  };

  const renderUploadStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Contacts</h3>
      
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          {[
            { id: 'csv', label: 'CSV File', icon: DocumentTextIcon },
            { id: 'excel', label: 'Excel', icon: DocumentTextIcon },
            { id: 'google', label: 'Google', icon: UserPlusIcon },
            { id: 'outlook', label: 'Outlook', icon: UserPlusIcon }
          ].map(option => (
            <button
              key={option.id}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                selectedImportType === option.id ? 
                'bg-primary-50 text-primary-700 border border-primary-300' : 
                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedImportType(option.id as any)}
            >
              <option.icon className="h-4 w-4 mr-2" />
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".csv,.xlsx,.xls"
          />
          
          {importFile ? (
            <div>
              <DocumentCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
              <p className="text-xs text-gray-500 mb-4">
                {(importFile.size / 1024).toFixed(2)} KB • {new Date().toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                size="small"
                onClick={triggerFileInput}
                leftIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div>
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-1">Drag & drop your file here</p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <Button 
                variant="outline"
                onClick={triggerFileInput}
                leftIcon={<ArrowUpTrayIcon className="h-4 w-4" />}
              >
                Browse Files
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: CSV, Excel spreadsheets (.xlsx, .xls)
              </p>
            </div>
          )}
        </div>
        
        {importErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              Import errors
            </h4>
            <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
              {importErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">
            We'll help you validate and enrich your contacts after upload.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => onImportComplete([])}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={!importFile || isProcessing}
            isLoading={isProcessing}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Imported Contacts</h3>
      
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {importedContacts.map((contact, index) => (
                <tr key={contact.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {contact.email}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {contact.phone}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {contact.company}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {contact.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 flex items-center">
            <DocumentCheckIcon className="h-4 w-4 mr-1" />
            Next Step: Lead Enrichment
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            Using EVA AI, we can enrich your contacts with additional data like LinkedIn profiles, company details, and more.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">
            {importedContacts.length} contacts found in your import file.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setImportStep('upload')}>
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEnrich}
            disabled={importedContacts.length === 0 || isProcessing}
            isLoading={isProcessing}
          >
            Enrich Contacts
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEnrichStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Enriching Your Contacts</h3>
      
      <div className="mb-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${enrichProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Processing...</span>
            <span className="text-xs text-gray-500">{enrichProgress}%</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-gray-50">
            <h5 className="text-sm font-medium text-gray-800 mb-2">What We're Adding:</h5>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                LinkedIn profiles where available
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                Company websites and domains
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                Company size and industry information
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                Standardizing contact information
              </li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-md bg-blue-50">
            <h5 className="text-sm font-medium text-blue-800 mb-2">EVA AI Enrichment</h5>
            <p className="text-xs text-blue-700">
              Our AI assistant is analyzing each contact for the best match against public data sources.
              This helps ensure your contact data is as complete as possible.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">
            Please wait while we enrich your {importedContacts.length} contacts.
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => setImportStep('preview')}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Verifying Contact Information</h3>
      
      <div className="mb-6">
        {isProcessing ? (
          <div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Verification Progress</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${verifyProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Verifying email addresses and phone numbers...</span>
                <span className="text-xs text-gray-500">{verifyProgress}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center text-center p-8">
              <div>
                <ArrowPathIcon className="h-12 w-12 text-primary-500 mx-auto mb-4 animate-spin" />
                <p className="text-sm font-medium text-gray-900">Verifying contact data...</p>
                <p className="text-xs text-gray-500 mt-1">
                  This process checks the validity of email addresses and phone numbers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enriched Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrichedContacts.map((contact, index) => (
                    <tr key={contact.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {contact.email}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {contact.phone}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {contact.company}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-xs text-primary-600 flex items-center">
                          View details <ChevronDownIcon className="h-3 w-3 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-medium text-green-800 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Enrichment Complete
              </h4>
              <p className="mt-1 text-xs text-green-700">
                We've successfully enriched your contacts. Next, we'll verify email addresses and phone numbers for deliverability.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">
            {enrichedContacts.length} contacts enriched successfully.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setImportStep('preview')}
            disabled={isProcessing}
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleVerify}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            Verify Contacts
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
        <p className="text-sm text-gray-600">
          Your contacts have been imported, enriched, and verified successfully.
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-md p-4 bg-gray-50 text-center">
          <p className="text-2xl font-bold text-gray-900">{verifiedContacts.length}</p>
          <p className="text-xs text-gray-600">Total Contacts</p>
        </div>
        <div className="border rounded-md p-4 bg-gray-50 text-center">
          <p className="text-2xl font-bold text-green-600">
            {verifiedContacts.filter(c => c.enriched).length}
          </p>
          <p className="text-xs text-gray-600">Enriched</p>
        </div>
        <div className="border rounded-md p-4 bg-gray-50 text-center">
          <p className="text-2xl font-bold text-primary-600">
            {verifiedContacts.filter(c => c.verified).length}
          </p>
          <p className="text-xs text-gray-600">Verified</p>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
        <h4 className="text-sm font-medium text-yellow-800 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          Verification Results
        </h4>
        <p className="mt-1 text-xs text-yellow-700">
          {verifiedContacts.filter(c => !c.verified).length} contacts couldn't be fully verified. We recommend reviewing these contacts manually.
        </p>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setImportStep('verify')}
        >
          Back to Results
        </Button>
        <Button 
          variant="primary" 
          onClick={handleComplete}
        >
          Add to Contacts
        </Button>
      </div>
    </div>
  );

  // Render the appropriate step
  const renderStep = () => {
    switch (importStep) {
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'enrich':
        return renderEnrichStep();
      case 'verify':
        return renderVerifyStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload' },
            { key: 'preview', label: 'Preview' },
            { key: 'enrich', label: 'Enrich' },
            { key: 'verify', label: 'Verify' },
            { key: 'complete', label: 'Complete' }
          ].map((step, index, array) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    importStep === step.key
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : importStep === 'upload' && step.key !== 'upload'
                        ? 'border-gray-300 bg-white text-gray-400'
                        : ['preview', 'enrich', 'verify', 'complete'].indexOf(importStep) >= ['preview', 'enrich', 'verify', 'complete'].indexOf(step.key as any)
                          ? 'border-primary-600 bg-white text-primary-600'
                          : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {importStep === step.key ? (
                    <span className="text-xs font-medium">{index + 1}</span>
                  ) : ['preview', 'enrich', 'verify', 'complete'].indexOf(importStep) > ['preview', 'enrich', 'verify', 'complete'].indexOf(step.key as any) ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    importStep === step.key
                      ? 'text-primary-600'
                      : ['preview', 'enrich', 'verify', 'complete'].indexOf(importStep) >= ['preview', 'enrich', 'verify', 'complete'].indexOf(step.key as any)
                        ? 'text-primary-600'
                        : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {index < array.length - 1 && (
                <div
                  className={`h-0.5 w-full max-w-[100px] ${
                    ['preview', 'enrich', 'verify', 'complete'].indexOf(importStep) > index
                      ? 'bg-primary-600'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
};

export default ContactImport; 