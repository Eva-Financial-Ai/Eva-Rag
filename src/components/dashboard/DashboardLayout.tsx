import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

// Define the shape of a transaction for the dropdown
interface Transaction {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: string;
  date: string;
}

// Define the shape of a user
interface User {
  id: string;
  name: string;
  email: string;
  role: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  user: User;
  onUserChange?: (user: User) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  user,
  onUserChange,
}) => {
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUserTypeDropdownOpen, setIsUserTypeDropdownOpen] = useState(false);
  const userTypeDropdownRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);

  const isSidebarCollapsed = userContext?.sidebarCollapsed || false;

  // Mock transactions for demonstration
  const mockTransactions: Transaction[] = [
    {
      id: 'TX-101',
      borrowerName: 'Acme Industries',
      type: 'Equipment Loan',
      amount: 750000,
      status: 'In Progress',
      date: '2023-08-15',
    },
    {
      id: 'TX-102',
      borrowerName: 'Smith Enterprises',
      type: 'Finance Lease',
      amount: 1250000,
      status: 'In Progress',
      date: '2023-08-20',
    },
    {
      id: 'TX-103',
      borrowerName: 'Tech Innovations Inc',
      type: 'Commercial Mortgage',
      amount: 2500000,
      status: 'In Progress',
      date: '2023-08-25',
    },
  ];

  // Handle clicks outside the user type dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userTypeDropdownRef.current &&
        !userTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    // Navigate to transaction details or update context
    navigate(`/transaction/${transaction.id}`);
  };

  const handleUserTypeSelect = (role: User['role']) => {
    localStorage.setItem('userRole', role);

    // Update the global UserContext
    if (userContext && userContext.setUserRole) {
      userContext.setUserRole(role);
    }

    // Create a new user object with the selected role
    const newUser: User = {
      ...user,
      role,
    };

    // Call the onUserChange callback if provided
    if (onUserChange) {
      onUserChange(newUser);
    }

    // Close the dropdown
    setIsUserTypeDropdownOpen(false);

    // Don't navigate - let the current dashboard update in place
    // The RoleBasedDashboard will automatically re-render with new role data
  };

  // Get the current applicant info string
  const currentApplicantInfoString = selectedTransaction
    ? `${selectedTransaction.borrowerName} - ${selectedTransaction.type}`
    : 'No Applicant Selected';

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isSidebarCollapsed ? 'main-content-collapsed' : 'main-content'}`}
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>

            {/* User Type Selector */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={userTypeDropdownRef}>
                <button
                  onClick={() => setIsUserTypeDropdownOpen(!isUserTypeDropdownOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">View as:</span>
                  <span className="font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <svg
                    className={`ml-2 h-4 w-4 transition-transform ${isUserTypeDropdownOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isUserTypeDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {['borrower', 'vendor', 'broker', 'lender', 'admin'].map(role => (
                        <button
                          key={role}
                          onClick={() => handleUserTypeSelect(role as User['role'])}
                          className={`${
                            user.role === role ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                          role="menuitem"
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
