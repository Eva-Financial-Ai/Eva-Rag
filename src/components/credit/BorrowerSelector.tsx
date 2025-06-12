import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Borrower {
  id: string;
  businessName: string;
  dba?: string;
  taxId: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress?: string;
  dateEstablished?: string;
  dunsNumber?: string;
  industry?: string;
  stateOfFormation?: string;
  ownerInfo?: {
    firstName: string;
    lastName: string;
    title: string;
    ownershipPercentage: number;
    ssn?: string;
    dateOfBirth?: string;
  }[];
}

interface BorrowerSelectorProps {
  onSelectBorrower: (borrower: Borrower) => void;
  applicationId?: string;
}

const BorrowerSelector: React.FC<BorrowerSelectorProps> = ({ onSelectBorrower, applicationId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  // Fetch borrowers when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchBorrowers();
    }
  }, [isOpen]);

  // Mock function to fetch borrowers from database
  const fetchBorrowers = async () => {
    setIsLoading(true);
    try {
      // In a real app, replace this with an API call to fetch borrowers
      setTimeout(() => {
        const mockBorrowers: Borrower[] = [
          {
            id: 'bor-1',
            businessName: 'Acme Corporation',
            dba: 'Acme Inc.',
            taxId: '12-3456789',
            businessEmail: 'info@acme.com',
            businessPhone: '(555) 123-4567',
            businessAddress: '123 Main St, San Francisco, CA 94105',
            dateEstablished: '2010-05-15',
            dunsNumber: '123456789',
            industry: 'Manufacturing',
            stateOfFormation: 'California',
            ownerInfo: [
              {
                firstName: 'John',
                lastName: 'Smith',
                title: 'CEO',
                ownershipPercentage: 51,
                ssn: '123-45-6789',
                dateOfBirth: '1975-08-15',
              },
              {
                firstName: 'Jane',
                lastName: 'Doe',
                title: 'COO',
                ownershipPercentage: 49,
                ssn: '987-65-4321',
                dateOfBirth: '1978-03-22',
              },
            ],
          },
          {
            id: 'bor-2',
            businessName: 'TechStart LLC',
            dba: 'TechStart',
            taxId: '98-7654321',
            businessEmail: 'hello@techstart.io',
            businessPhone: '(555) 987-6543',
            businessAddress: '456 Market St, San Francisco, CA 94105',
            dateEstablished: '2018-11-03',
            dunsNumber: '987654321',
            industry: 'Software Development',
            stateOfFormation: 'Delaware',
            ownerInfo: [
              {
                firstName: 'Michael',
                lastName: 'Johnson',
                title: 'Founder',
                ownershipPercentage: 100,
                ssn: '456-78-9012',
                dateOfBirth: '1985-12-10',
              },
            ],
          },
          {
            id: 'bor-3',
            businessName: 'Sunshine Bakery',
            dba: 'Sunshine Baked Goods',
            taxId: '45-6789012',
            businessEmail: 'orders@sunshinebakery.com',
            businessPhone: '(555) 345-6789',
            businessAddress: '789 Baker St, San Francisco, CA 94123',
            dateEstablished: '2015-07-22',
            dunsNumber: '456789012',
            industry: 'Food & Beverage',
            stateOfFormation: 'California',
            ownerInfo: [
              {
                firstName: 'Sarah',
                lastName: 'Williams',
                title: 'Owner',
                ownershipPercentage: 100,
                ssn: '567-89-0123',
                dateOfBirth: '1982-04-18',
              },
            ],
          },
        ];
        setBorrowers(mockBorrowers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      setIsLoading(false);
    }
  };

  // Filter borrowers based on search term
  const filteredBorrowers = borrowers.filter(
    borrower =>
      borrower.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.dba?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.taxId.includes(searchTerm)
  );

  const handleSelectBorrower = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setIsOpen(false);
    onSelectBorrower(borrower);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Pre-fill from Existing Borrower
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Select Existing Borrower
                  </h3>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Search borrowers by name or tax ID..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  ) : filteredBorrowers.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Business Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tax ID
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Contact
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBorrowers.map(borrower => (
                            <tr key={borrower.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {borrower.businessName}
                                </div>
                                {borrower.dba && (
                                  <div className="text-sm text-gray-500">DBA: {borrower.dba}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {borrower.taxId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{borrower.businessEmail}</div>
                                <div>{borrower.businessPhone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleSelectBorrower(borrower)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      {searchTerm
                        ? 'No borrowers found matching your search criteria'
                        : 'No borrowers available'}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Add New Borrower
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerSelector;
