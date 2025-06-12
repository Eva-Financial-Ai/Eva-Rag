import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflow } from '../../contexts/WorkflowContext';
import TopNavigation from '../../components/layout/TopNavigation';
import { 
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// Form template interface
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  lastUpdated: string;
  useCount: number;
}

// Form category interface
interface FormCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
}

const SafeFormsPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { currentTransaction } = useWorkflow();
  
  // State for active category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Mock form categories
  const formCategories: FormCategory[] = [
    {
      id: 'loan',
      name: 'Loan Documents',
      description: 'Commercial loan applications and related forms',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      count: 12
    },
    {
      id: 'legal',
      name: 'Legal Forms',
      description: 'Business agreements, contracts, and legal declarations',
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      count: 8
    },
    {
      id: 'financial',
      name: 'Financial Statements',
      description: 'Balance sheets, income statements, and cash flow reports',
      icon: <ChartBarIcon className="w-6 h-6" />,
      count: 9
    },
    {
      id: 'compliance',
      name: 'Compliance Documents',
      description: 'Regulatory and compliance requirement forms',
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      count: 7
    },
  ];
  
  // Mock form templates
  const formTemplates: FormTemplate[] = [
    {
      id: 'loan-1',
      name: 'Commercial Loan Application',
      description: 'Standard commercial loan application with automated financial analysis',
      category: 'loan',
      lastUpdated: '2023-05-15',
      useCount: 128
    },
    {
      id: 'loan-2',
      name: 'Business Line of Credit Request',
      description: 'Application for revolving credit facility with customizable terms',
      category: 'loan',
      lastUpdated: '2023-04-22',
      useCount: 94
    },
    {
      id: 'legal-1',
      name: 'Service Agreement Template',
      description: 'Customizable service agreement with standard legal provisions',
      category: 'legal',
      lastUpdated: '2023-05-01',
      useCount: 75
    },
    {
      id: 'financial-1',
      name: 'Income Statement Template',
      description: 'Standardized income statement with automated calculation',
      category: 'financial',
      lastUpdated: '2023-05-10',
      useCount: 112
    },
    {
      id: 'compliance-1',
      name: 'KYC Documentation Form',
      description: 'Know Your Customer documentation for regulatory compliance',
      category: 'compliance',
      lastUpdated: '2023-04-28',
      useCount: 203
    },
    {
      id: 'loan-3',
      name: 'SBA Loan Application',
      description: 'Small Business Administration loan application with guidelines',
      category: 'loan',
      lastUpdated: '2023-03-15',
      useCount: 86
    },
  ];
  
  // Filter templates based on active category
  const filteredTemplates = activeCategory === 'all' 
    ? formTemplates 
    : formTemplates.filter(template => template.category === activeCategory);
  
  return (
    <div className="pl-20 sm:pl-72 w-full">
      <div className="container mx-auto px-2 py-6 max-w-full">
        <TopNavigation 
          title="Safe Forms"
        />
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Safe Forms</h1>
                <p className="text-gray-600">
                  Structured document templates with automated data integration
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center transition-colors duration-150"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                Refresh
              </button>
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center transition-colors duration-150"
              >
                <PlusIcon className="w-5 h-5 mr-1.5" />
                Create Form
              </button>
            </div>
          </div>
          
          {/* Form Categories Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Form Categories</h2>
            
            <div className="flex overflow-x-auto pb-4 space-x-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              
              {formCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
          
          {/* Category Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {formCategories.map(category => (
              <div 
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 border rounded-lg transition-all duration-150 hover:shadow-md cursor-pointer ${
                  activeCategory === category.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-md mr-3 ${
                    activeCategory === category.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.count} templates</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
          
          {/* Form Templates Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                {activeCategory === 'all' ? 'All Templates' : formCategories.find(c => c.id === activeCategory)?.name + ' Templates'}
              </h2>
              <div className="text-sm text-gray-500">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id}
                  className="p-4 hover:bg-gray-100 transition-colors duration-150 flex items-start"
                >
                  <div className="bg-white border border-gray-200 p-2 rounded-md mr-4">
                    <DocumentDuplicateIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Used {template.useCount} times
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Last updated: {template.lastUpdated}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center transition-colors duration-150">
                          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                          Download
                        </button>
                        <button className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors duration-150">
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-900 font-medium">No templates found</h3>
                <p className="text-gray-500 text-sm mt-1">
                  No templates are available for the selected category.
                </p>
              </div>
            )}
          </div>
          
          {/* Recently Used Forms Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Recently Used Forms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.slice(0, 3).map(template => (
                <div 
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-150"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500">Used {new Date().toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex justify-end">
                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center transition-colors duration-150">
                      Continue <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeFormsPage; 