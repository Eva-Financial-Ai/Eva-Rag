import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// Types for billing data
interface Subscription {
  id: string;
  name: string;
  plan: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due';
  next_billing_date: string;
  seats_used: number;
  seats_total: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  last_four: string;
  brand?: string;
  expires?: string;
  is_default: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  description: string;
  download_url?: string;
}

const BillingSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subscriptions' | 'payment-methods' | 'invoices' | 'usage'
  >('overview');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);

      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setSubscriptions([
        {
          id: 'sub_001',
          name: 'Thor Lightning Network',
          plan: 'Professional',
          price: 890,
          billing_cycle: 'monthly',
          status: 'active',
          next_billing_date: '2024-03-01',
          seats_used: 8,
          seats_total: 10,
        },
        {
          id: 'sub_002',
          name: 'EVA Risk Assessment',
          plan: 'Enterprise',
          price: 450,
          billing_cycle: 'monthly',
          status: 'active',
          next_billing_date: '2024-03-01',
          seats_used: 5,
          seats_total: 5,
        },
        {
          id: 'sub_003',
          name: 'Asset Press Platform',
          plan: 'Premium',
          price: 250,
          billing_cycle: 'monthly',
          status: 'active',
          next_billing_date: '2024-03-01',
          seats_used: 3,
          seats_total: 5,
        },
      ]);

      setPaymentMethods([
        {
          id: 'pm_001',
          type: 'card',
          brand: 'Visa',
          last_four: '4242',
          expires: '12/25',
          is_default: true,
        },
        {
          id: 'pm_002',
          type: 'bank',
          last_four: '6789',
          is_default: false,
        },
        {
          id: 'pm_003',
          type: 'crypto',
          last_four: 'bc1a',
          is_default: false,
        },
      ]);

      setInvoices([
        {
          id: 'INV-2024-0001',
          amount: 1590,
          status: 'paid',
          date: '2024-01-15',
          description: 'Monthly subscription - All services',
        },
        {
          id: 'INV-2024-0002',
          amount: 1590,
          status: 'pending',
          date: '2024-02-15',
          description: 'Monthly subscription - Thor Lightning + EVA Risk',
        },
      ]);

      setLoading(false);
    };

    loadBillingData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Spend</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(1590)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Seats</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.reduce((acc, sub) => acc + sub.seats_used, 0)} /{' '}
                {subscriptions.reduce((acc, sub) => acc + sub.seats_total, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">
                {invoices.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCardIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Payment Method</p>
              <p className="text-sm text-gray-500">Connect Stripe, Bank, or Crypto</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Upgrade Plan</p>
              <p className="text-sm text-gray-500">Add more seats or features</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Download Invoices</p>
              <p className="text-sm text-gray-500">Export to QuickBooks</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Active Subscriptions</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Subscription
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Billing
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map(subscription => (
              <tr key={subscription.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subscription.plan}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(subscription.price)}/
                    {subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {subscription.seats_used} / {subscription.seats_total}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(subscription.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(subscription.next_billing_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map(method => (
          <div key={method.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {method.type === 'card' && <CreditCardIcon className="h-8 w-8 text-blue-600" />}
                {method.type === 'bank' && <BanknotesIcon className="h-8 w-8 text-green-600" />}
                {method.type === 'crypto' && <span className="text-2xl">₿</span>}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {method.type === 'card'
                      ? method.brand
                      : method.type === 'bank'
                        ? 'Bank Account'
                        : 'Crypto Wallet'}
                  </p>
                  <p className="text-sm text-gray-500">•••• {method.last_four}</p>
                  {method.expires && (
                    <p className="text-xs text-gray-400">Expires {method.expires}</p>
                  )}
                </div>
              </div>
              {method.is_default && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                Edit
              </button>
              <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add new payment method card */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-900 mb-2">Add Payment Method</p>
            <p className="text-xs text-gray-500 mb-4">Stripe, Plaid, or Coinbase</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Add Method
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Integrations</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">S</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Stripe</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>

          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">P</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Plaid</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>

          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">C</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Coinbase</p>
              <p className="text-xs text-yellow-600">Setup Required</p>
            </div>
          </div>

          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">Q</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">QuickBooks</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Invoices & Billing History</h3>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export to QuickBooks
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Download All
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{invoice.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Download</button>
                    {invoice.status === 'pending' && (
                      <button className="text-green-600 hover:text-green-900">Pay Now</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Usage Analytics</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subscriptions.map(subscription => (
          <div key={subscription.id} className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">{subscription.name}</h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Seats Used</span>
                  <span>
                    {subscription.seats_used} / {subscription.seats_total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(subscription.seats_used / subscription.seats_total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Monthly Queries</p>
                  <p className="text-2xl font-semibold text-gray-900">12.4K</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-semibold text-gray-900">1.2s</p>
                </div>
              </div>

              {subscription.seats_used >= subscription.seats_total * 0.8 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You're using{' '}
                    {Math.round((subscription.seats_used / subscription.seats_total) * 100)}% of
                    your seats. Consider upgrading to avoid service interruption.
                  </p>
                  <button className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
                    Add Seats
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscriptions, payment methods, and billing history
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'subscriptions', name: 'Subscriptions', icon: DocumentTextIcon },
              { id: 'payment-methods', name: 'Payment Methods', icon: CreditCardIcon },
              { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon },
              { id: 'usage', name: 'Usage', icon: ChartBarIcon },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'payment-methods' && renderPaymentMethods()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'usage' && renderUsage()}
        </div>
      </div>
    </div>
  );
};

export default BillingSubscriptions;
