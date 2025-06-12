import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopNavbar from '../layout/TopNavbar';

const TransactionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  // Define transaction types
  interface Borrower {
    name: string;
    type: string;
    established: string;
    industry: string;
    creditScore: number;
  }

  interface Loan {
    type: string;
    term: number;
    rate: number;
    payment: number;
    startDate: string;
  }

  interface TimelineEvent {
    date: string;
    event: string;
    user: string;
  }

  interface Transaction {
    id: string;
    name: string;
    amount: number;
    status: string;
    borrower: Borrower;
    loan: Loan;
    timeline: TimelineEvent[];
    equipment?: {
      type: string;
      model: string;
      value: number;
      vendor: string;
    };
    property?: {
      type: string;
      size: string;
      address: string;
      value: number;
    };
    purpose?: {
      use: string;
      details: string;
      expectedReturn: string;
    };
  }

  // Simulated transaction data
  const transactions: Record<string, Transaction> = {
    'TX-123': {
      id: 'TX-123',
      name: 'Acme Industries Equipment Finance',
      amount: 125000,
      status: 'In Progress',
      borrower: {
        name: 'Acme Industries LLC',
        type: 'LLC',
        established: '2015',
        industry: 'Manufacturing',
        creditScore: 710,
      },
      loan: {
        type: 'Equipment Finance',
        term: 60,
        rate: 5.75,
        payment: 2400,
        startDate: '2023-10-01',
      },
      equipment: {
        type: 'Industrial CNC Machine',
        model: 'CNC-5000',
        value: 95000,
        vendor: 'Industrial Machining Solutions',
      },
      timeline: [
        { date: '2023-08-15', event: 'Application submitted', user: 'John Smith' },
        { date: '2023-08-16', event: 'Documents requested', user: 'Chris Taylor' },
        { date: '2023-08-18', event: 'Documents received', user: 'Linda Johnson' },
        { date: '2023-08-20', event: 'Credit analysis started', user: 'Michael Davis' },
      ],
    },
    'TX-124': {
      id: 'TX-124',
      name: 'Global Manufacturing Real Estate',
      amount: 250000,
      status: 'Approved',
      borrower: {
        name: 'Global Manufacturing',
        type: 'Corporation',
        established: '2010',
        industry: 'Manufacturing',
        creditScore: 760,
      },
      loan: {
        type: 'Commercial Real Estate',
        term: 120,
        rate: 4.85,
        payment: 3200,
        startDate: '2023-09-15',
      },
      property: {
        type: 'Industrial',
        size: '10,000 sq ft',
        address: '123 Business Park Dr, Atlanta, GA',
        value: 310000,
      },
      timeline: [
        { date: '2023-08-10', event: 'Application submitted', user: 'Sarah Johnson' },
        { date: '2023-08-12', event: 'Documents requested', user: 'Chris Taylor' },
        { date: '2023-08-13', event: 'Documents received', user: 'Linda Johnson' },
        { date: '2023-08-14', event: 'Credit approval granted', user: 'Michael Davis' },
      ],
    },
    'TX-125': {
      id: 'TX-125',
      name: 'Sunrise Retail Working Capital',
      amount: 50000,
      status: 'Under Review',
      borrower: {
        name: 'Sunrise Retail',
        type: 'LLC',
        established: '2020',
        industry: 'Retail',
        creditScore: 680,
      },
      loan: {
        type: 'Working Capital',
        term: 24,
        rate: 7.25,
        payment: 2200,
        startDate: 'Pending',
      },
      purpose: {
        use: 'Inventory Purchase',
        details: 'Seasonal inventory expansion for holiday season',
        expectedReturn: '$65,000 additional revenue',
      },
      timeline: [
        { date: '2023-08-18', event: 'Application submitted', user: 'Alex Wong' },
        { date: '2023-08-19', event: 'Documents requested', user: 'Chris Taylor' },
        { date: '2023-08-21', event: 'Some documents received', user: 'Linda Johnson' },
        { date: '2023-08-22', event: 'Additional documents requested', user: 'Michael Davis' },
      ],
    },
  };

  // Fetch transaction data
  useEffect(() => {
    setLoading(true);

    // Simulating API call
    setTimeout(() => {
      if (id && transactions[id as keyof typeof transactions]) {
        setTransaction(transactions[id as keyof typeof transactions]);
      } else {
        // Default to first transaction if ID doesn't exist
        setTransaction(transactions['TX-123']);
      }
      setLoading(false);
    }, 800);
  }, [id, transactions]);

  // Render loading state
  if (loading) {
    return (
      <div>
        <TopNavbar currentTransaction={id} />
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Render transaction not found
  if (!transaction) {
    return (
      <div>
        <TopNavbar currentTransaction={id} />
        <div className="p-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">Transaction Not Found</h1>
            <p className="text-gray-600">The transaction you're looking for does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNavbar currentTransaction={transaction.id} />

      <div className="p-6">
        {/* Transaction Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{transaction.name}</h1>
              <p className="text-gray-600">ID: {transaction.id}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  transaction.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {transaction.status}
              </span>
              <span className="ml-3 text-xl font-bold">${transaction.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Transaction Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column - Borrower info */}
          <div className="md:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Borrower Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.borrower.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.borrower.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Established</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {transaction.borrower.established}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Industry</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.borrower.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Credit Score</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {transaction.borrower.creditScore}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Middle column - Loan/Product info */}
          <div className="md:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Loan Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.loan.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Term</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.loan.term} months</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.loan.rate}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monthly Payment</dt>
                    <dd className="mt-1 text-sm text-gray-900">${transaction.loan.payment}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{transaction.loan.startDate}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Right column - Asset/Purpose/Property info */}
          <div className="md:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {transaction.equipment
                    ? 'Equipment Information'
                    : transaction.property
                      ? 'Property Information'
                      : 'Loan Purpose'}
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {transaction.equipment && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Equipment Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.equipment.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Model</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.equipment.model}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Value</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${transaction.equipment.value.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.equipment.vendor}</dd>
                    </div>
                  </dl>
                )}

                {transaction.property && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.property.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.property.size}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.property.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Value</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${transaction.property.value.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                )}

                {transaction.purpose && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Use of Funds</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.purpose.use}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Details</dt>
                      <dd className="mt-1 text-sm text-gray-900">{transaction.purpose.details}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expected Return</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {transaction.purpose.expectedReturn}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Transaction Timeline</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {transaction.timeline.map((event, eventIdx) => (
                    <li key={event.date + event.event}>
                      <div className="relative pb-8">
                        {eventIdx !== transaction.timeline.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                              <svg
                                className="h-5 w-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                {event.event}{' '}
                                <span className="font-medium text-gray-900">by {event.user}</span>
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {event.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          {transaction.status !== 'Approved' && (
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Approve
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Request Documents
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Edit Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
