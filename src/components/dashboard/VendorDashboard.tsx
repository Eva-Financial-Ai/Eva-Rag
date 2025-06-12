import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardCard from './DashboardCard';

interface User {
  id: string;
  role: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
  name: string;
  email: string;
}

interface VendorDashboardProps {
  user: User;
}

// Mock clients data
const mockClients = [
  {
    id: 'client-123',
    name: 'ABC Manufacturing',
    status: 'Active',
    equipmentValue: 450000,
    lastPurchase: '2023-10-15',
    nextContact: '2023-11-05',
  },
  {
    id: 'client-124',
    name: 'XYZ Equipment Rentals',
    status: 'Active',
    equipmentValue: 875000,
    lastPurchase: '2023-09-28',
    nextContact: '2023-10-28',
  },
  {
    id: 'client-125',
    name: 'City Construction LLC',
    status: 'Prospect',
    equipmentValue: 0,
    lastPurchase: null,
    nextContact: '2023-10-30',
  },
];

// Mock deal pipeline data
const mockDeals = [
  {
    id: 'deal-123',
    client: 'ABC Manufacturing',
    equipmentType: 'Industrial Machinery',
    amount: 125000,
    status: 'Proposal Sent',
    probability: 75,
    closingDate: '2023-11-15',
    commission: 7500,
  },
  {
    id: 'deal-124',
    client: 'XYZ Equipment Rentals',
    equipmentType: 'Construction Equipment',
    amount: 280000,
    status: 'Financing Approval',
    probability: 90,
    closingDate: '2023-11-10',
    commission: 16800,
  },
  {
    id: 'deal-125',
    client: 'City Construction LLC',
    equipmentType: 'Heavy Machinery',
    amount: 350000,
    status: 'Initial Discussion',
    probability: 40,
    closingDate: '2023-12-05',
    commission: 21000,
  },
];

// Mock commission data
const mockCommission = {
  mtd: 12500,
  ytd: 148700,
  pending: 45300,
  topEquipment: [
    { type: 'Construction Equipment', sales: 450000, commission: 27000 },
    { type: 'Industrial Machinery', sales: 380000, commission: 22800 },
    { type: 'Commercial Vehicles', sales: 325000, commission: 19500 },
  ],
};

// Mock equipment data
const mockEquipment = [
  {
    id: 'equip-123',
    name: 'Industrial CNC Machine',
    manufacturer: 'MachineTech',
    price: 125000,
    category: 'Industrial',
    inStock: true,
  },
  {
    id: 'equip-124',
    name: 'Excavator X450',
    manufacturer: 'HeavyDuty',
    price: 175000,
    category: 'Construction',
    inStock: true,
  },
  {
    id: 'equip-125',
    name: 'Commercial Truck T800',
    manufacturer: 'RoadKing',
    price: 95000,
    category: 'Transportation',
    inStock: false,
  },
];

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  // Define navigation for vendor
  const navigation = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: '/dashboard',
      active: true,
    },
    {
      label: 'Clients',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      href: '/clients',
      active: false,
    },
    {
      label: 'Deals',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      href: '/deals',
      active: false,
    },
    {
      label: 'Equipment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      href: '/equipment',
      active: false,
    },
  ];

  // Function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'proposal sent':
        return 'bg-blue-100 text-blue-800';
      case 'financing approval':
        return 'bg-purple-100 text-purple-800';
      case 'initial discussion':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get probability badge style
  const getProbabilityBadge = (probability: number) => {
    if (probability >= 70) return 'bg-green-100 text-green-800';
    if (probability >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout
      user={user}
      title="Vendor Dashboard"
      subtitle="Manage your clients, track deals, and monitor equipment inventory"
    >
      {/* Client Management Card */}
      <DashboardCard
        title="Client Management"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      >
        <div className="space-y-3">
          {mockClients.map(client => (
            <div
              key={client.id}
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(client.status)}`}>
                  {client.status}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Equipment Value</div>
                  <div className="font-medium">
                    {client.equipmentValue ? formatCurrency(client.equipmentValue) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Next Contact</div>
                  <div className="font-medium">{client.nextContact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => navigate('/clients/add')}
            className="flex-1 text-sm bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
          >
            Add Client
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-2"
          >
            View All
          </button>
        </div>
      </DashboardCard>

      {/* Deal Pipeline Card */}
      <DashboardCard
        title="Deal Pipeline"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      >
        <div className="space-y-3">
          {mockDeals.map(deal => (
            <div
              key={deal.id}
              className="border rounded-md overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="p-3 cursor-pointer" onClick={() => navigate(`/deals/${deal.id}`)}>
                <div className="flex justify-between">
                  <div className="font-medium text-gray-900">{deal.client}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(deal.status)}`}>
                    {deal.status}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {deal.equipmentType} - {formatCurrency(deal.amount)}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Probability</span>
                    <span className={getProbabilityBadge(deal.probability)}>
                      {deal.probability}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${deal.probability >= 70 ? 'bg-green-500' : deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${deal.probability}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <div>
                    <span className="text-gray-500">Closing: </span>
                    <span className="font-medium">{deal.closingDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Commission: </span>
                    <span className="font-medium text-green-700">
                      {formatCurrency(deal.commission)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/deals/create')}
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            Create New Deal
          </button>
        </div>
      </DashboardCard>

      {/* Commission Tracker Card */}
      <DashboardCard
        title="Commission Tracker"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xs text-blue-700 mb-1">MTD</div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(mockCommission.mtd)}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xs text-green-700 mb-1">YTD</div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(mockCommission.ytd)}
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-xs text-yellow-700 mb-1">Pending</div>
            <div className="text-xl font-bold text-yellow-900">
              {formatCurrency(mockCommission.pending)}
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Top Equipment Categories</h4>
          <div className="space-y-3">
            {mockCommission.topEquipment.map((category, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-800">{category.type}</div>
                  <div className="text-green-600 font-medium">
                    {formatCurrency(category.commission)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Total Sales: {formatCurrency(category.sales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Equipment Financing Card */}
      <DashboardCard
        title="Equipment Financing"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        }
      >
        <div className="p-4 bg-indigo-50 rounded-lg mb-4 border border-indigo-100">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-700 mb-1">Smart Financing</div>
            <p className="text-sm text-indigo-600 mb-3">
              Offer equipment financing with EVA's smart matching technology
            </p>
            <button
              onClick={() => navigate('/smart-match')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
            >
              Match Clients with Lenders
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">Financing Benefits</h4>
          <div className="space-y-2">
            <div className="flex items-start">
              <svg
                className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">Increase equipment sales by up to 40%</span>
            </div>
            <div className="flex items-start">
              <svg
                className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">
                Earn additional commission from financing
              </span>
            </div>
            <div className="flex items-start">
              <svg
                className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">
                Fast approvals, typically within 24-48 hours
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Equipment Catalog Card */}
      <DashboardCard
        title="Equipment Catalog"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      >
        <div className="space-y-3">
          {mockEquipment.map(equipment => (
            <div
              key={equipment.id}
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/equipment/${equipment.id}`)}
            >
              <div className="flex justify-between">
                <div className="font-medium text-gray-900">{equipment.name}</div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${equipment.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {equipment.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {equipment.manufacturer} - {equipment.category}
              </div>
              <div className="text-sm font-medium text-gray-900 mt-2">
                {formatCurrency(equipment.price)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/equipment/catalog')}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Browse full equipment catalog →
          </button>
        </div>
      </DashboardCard>

      {/* Quick Actions Card */}
      <DashboardCard
        title="Quick Actions"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
      >
        <div className="space-y-2">
          <button
            onClick={() => navigate('/clients/add')}
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            Add New Client
          </button>
          <button
            onClick={() => navigate('/deals/create')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Create New Deal
          </button>
          <button
            onClick={() => navigate('/equipment/catalog')}
            className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
          >
            Equipment Catalog
          </button>
          <button
            onClick={() => navigate('/smart-match')}
            className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
          >
            Smart Financing
          </button>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default VendorDashboard;
