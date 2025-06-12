import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskMapType } from './RiskMapNavigator';

interface RiskMap {
  id: string;
  name: string;
  type: RiskMapType;
  status: 'In Progress' | 'Completed' | 'Pending Review' | 'Archived';
  lastUpdated: string;
  score?: number;
  client: string;
  loanAmount: number;
  createdBy: string;
  starred?: boolean;
}

// Mock data for risk maps - using lazy initialization
const generateMockRiskMaps = (): RiskMap[] => [
  {
    id: 'map1',
    name: 'Unsecured Loan Assessment - Acme Corp',
    type: 'unsecured',
    status: 'In Progress',
    lastUpdated: '2023-10-26',
    score: 87,
    client: 'Acme Corporation',
    loanAmount: 150000,
    createdBy: 'John Smith',
    starred: true,
  },
  {
    id: 'map2',
    name: 'Equipment Financing - XYZ Rentals',
    type: 'equipment',
    status: 'Completed',
    lastUpdated: '2023-10-25',
    score: 92,
    client: 'XYZ Equipment Rentals',
    loanAmount: 275000,
    createdBy: 'Sarah Johnson',
  },
  {
    id: 'map3',
    name: 'Real Estate Deal - Downtown Tower',
    type: 'realestate',
    status: 'Pending Review',
    lastUpdated: '2023-10-27',
    score: 76,
    client: 'Urban Development LLC',
    loanAmount: 1200000,
    createdBy: 'Michael Brown',
  },
  {
    id: 'map4',
    name: 'Working Capital - Tech Startup',
    type: 'unsecured',
    status: 'Completed',
    lastUpdated: '2023-10-23',
    score: 81,
    client: 'Innovate Tech Solutions',
    loanAmount: 100000,
    createdBy: 'John Smith',
    starred: true,
  },
  {
    id: 'map5',
    name: 'Fleet Financing - Logistics Co',
    type: 'equipment',
    status: 'Completed',
    lastUpdated: '2023-10-20',
    score: 88,
    client: 'Fast Track Logistics',
    loanAmount: 450000,
    createdBy: 'Sarah Johnson',
  },
  {
    id: 'map6',
    name: 'Office Purchase - Law Firm',
    type: 'realestate',
    status: 'In Progress',
    lastUpdated: '2023-10-24',
    client: 'Johnson & Associates Law',
    loanAmount: 850000,
    createdBy: 'Michael Brown',
  },
  {
    id: 'map7',
    name: 'Expansion Capital - Retail Chain',
    type: 'unsecured',
    status: 'Archived',
    lastUpdated: '2023-10-10',
    score: 79,
    client: 'City Goods Retail',
    loanAmount: 200000,
    createdBy: 'Emma Wilson',
  },
];

// Lazy initialize mock data only when component mounts
const MOCK_RISK_MAPS = (() => generateMockRiskMaps())();

// Define filter types
type FilterStatus = 'All' | 'In Progress' | 'Completed' | 'Pending Review' | 'Archived';
type FilterType = 'All' | RiskMapType;
type SortField = 'lastUpdated' | 'name' | 'score' | 'loanAmount';
type SortDirection = 'asc' | 'desc';

// Pre-calculate style constants to avoid re-computation
const STATUS_STYLES = {
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  'Pending Review': 'bg-blue-100 text-blue-800 border-blue-200',
  Archived: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

const TYPE_STYLES = {
  unsecured: 'bg-purple-100 text-purple-800 border-purple-200',
  equipment: 'bg-green-100 text-green-800 border-green-200',
  realestate: 'bg-blue-100 text-blue-800 border-blue-200',
} as const;

const TYPE_LABELS = {
  unsecured: 'Unsecured',
  equipment: 'Equipment',
  realestate: 'Real Estate',
} as const;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized risk map item component
const RiskMapItem = React.memo<{
  map: RiskMap;
  onSelect: (map: RiskMap) => void;
  onToggleStar: (id: string, event: React.MouseEvent) => void;
  onArchiveToggle: (id: string, event: React.MouseEvent) => void;
  formatCurrency: (amount: number) => string;
}>(({ map, onSelect, onToggleStar, onArchiveToggle, formatCurrency }) => {
  const handleClick = useCallback(() => onSelect(map), [map, onSelect]);
  const handleStar = useCallback(
    (e: React.MouseEvent) => onToggleStar(map.id, e),
    [map.id, onToggleStar]
  );
  const handleArchive = useCallback(
    (e: React.MouseEvent) => onArchiveToggle(map.id, e),
    [map.id, onArchiveToggle]
  );

  const scoreStyle = useMemo(() => {
    if (!map.score) return '';
    if (map.score >= 90) return 'bg-green-100 text-green-800';
    if (map.score >= 80) return 'bg-blue-100 text-blue-800';
    if (map.score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }, [map.score]);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 gap-3 py-4 px-4 hover:bg-gray-50 cursor-pointer transition-colors items-center"
      onClick={handleClick}
    >
      {/* Name - visible on all screens */}
      <div className="col-span-1 md:col-span-4">
        <div className="flex items-start">
          <button
            className="mr-2 text-gray-400 hover:text-yellow-500 focus:outline-none"
            onClick={handleStar}
            title={map.starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            {map.starred ? (
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 15.585l-7.07 3.716 1.351-7.87-5.719-5.582 7.885-1.146L10 0l3.553 7.703 7.885 1.146-5.719 5.582 1.351 7.87L10 15.585z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </button>
          <div>
            <h3 className="font-medium text-gray-900">{map.name}</h3>
            <p className="text-sm text-gray-500">{map.client}</p>
          </div>
        </div>
      </div>

      {/* Status & Type - visible on md+ screens */}
      <div className="col-span-1 md:col-span-2 mt-2 md:mt-0">
        <div className="flex flex-col space-y-2">
          <span
            className={`text-xs px-2 py-1 rounded-full inline-flex items-center border ${STATUS_STYLES[map.status]}`}
          >
            {map.status}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full inline-flex items-center border ${TYPE_STYLES[map.type]}`}
          >
            {TYPE_LABELS[map.type]}
          </span>
        </div>
      </div>

      {/* Amount - collapsed on mobile */}
      <div className="col-span-1 md:col-span-2 mt-2 md:mt-0">
        <div className="text-sm font-medium">{formatCurrency(map.loanAmount)}</div>
        <div className="text-xs text-gray-500">Created by {map.createdBy}</div>
      </div>

      {/* Risk Score - collapsed on mobile */}
      <div className="col-span-1 md:col-span-2 mt-2 md:mt-0">
        {map.score ? (
          <div className={`text-sm font-medium px-2 py-1 rounded-md inline-flex ${scoreStyle}`}>
            {map.score}/100
          </div>
        ) : (
          <div className="text-xs text-gray-500">No score yet</div>
        )}
      </div>

      {/* Last Updated - visible on all screens */}
      <div className="col-span-1 md:col-span-2 flex justify-between items-center mt-2 md:mt-0">
        <span className="text-sm text-gray-500">{map.lastUpdated}</span>
        <button
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={handleArchive}
          title={map.status === 'Archived' ? 'Unarchive' : 'Archive'}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});

RiskMapItem.displayName = 'RiskMapItem';

const AllRiskMapsView: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<RiskMap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [typeFilter, setTypeFilter] = useState<FilterType>('All');
  const [sortBy, setSortBy] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showOnlyStarred, setShowOnlyStarred] = useState<boolean>(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized format currency function
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Memoized handlers
  const handleSelectMap = useCallback(
    (map: RiskMap) => {
      navigate(`/risk-assessment/eva-report?type=${map.type}`);
    },
    [navigate]
  );

  const handleToggleStar = useCallback((id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMaps(prevMaps =>
      prevMaps.map(map => (map.id === id ? { ...map, starred: !map.starred } : map))
    );
  }, []);

  const handleArchiveToggle = useCallback((id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMaps(prevMaps =>
      prevMaps.map(map =>
        map.id === id
          ? {
              ...map,
              status: map.status === 'Archived' ? 'Completed' : 'Archived',
            }
          : map
      )
    );
  }, []);

  // Simulate async data loading
  useEffect(() => {
    const loadMaps = async () => {
      try {
        // Simulate API call with minimal delay
        await new Promise(resolve => setTimeout(resolve, 100));
        setMaps(MOCK_RISK_MAPS);
      } catch (error) {
        console.error('Error loading risk maps:', error);
        setMaps([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaps();
  }, []);

  // Optimized filtering and sorting with debounced search
  const filteredAndSortedMaps = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();

    // First filter
    const filtered = maps.filter(map => {
      if (
        searchLower &&
        !map.name.toLowerCase().includes(searchLower) &&
        !map.client.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      if (statusFilter !== 'All' && map.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'All' && map.type !== typeFilter) {
        return false;
      }

      if (showOnlyStarred && !map.starred) {
        return false;
      }

      return true;
    });

    // Then sort
    return filtered.sort((a, b) => {
      const direction = sortDirection === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'lastUpdated':
          return (
            direction * (new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          );
        case 'score':
          return direction * ((b.score || 0) - (a.score || 0));
        case 'loanAmount':
          return direction * (b.loanAmount - a.loanAmount);
        case 'name':
        default:
          return direction * a.name.localeCompare(b.name);
      }
    });
  }, [maps, debouncedSearchTerm, statusFilter, typeFilter, sortBy, sortDirection, showOnlyStarred]);

  // Memoized sort handler
  const handleSort = useCallback(
    (field: SortField) => {
      setSortDirection(prev => (field === sortBy ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'));
      setSortBy(field);
    },
    [sortBy]
  );

  // Memoized render sort indicator
  const renderSortIndicator = useCallback(
    (field: SortField) => {
      if (sortBy !== field) return null;
      return sortDirection === 'asc' ? '↑' : '↓';
    },
    [sortBy, sortDirection]
  );

  const handleCreateNew = useCallback(() => {
    navigate('/risk-assessment/new');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Maps</h2>
          <p className="text-gray-600 mt-1">View and manage all your risk assessments</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Risk Map
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search by name or client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="sr-only">Filter by Status</label>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FilterStatus)}
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="sr-only">Filter by Type</label>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as FilterType)}
          >
            <option value="All">All Types</option>
            <option value="unsecured">Unsecured</option>
            <option value="equipment">Equipment</option>
            <option value="realestate">Real Estate</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            id="starred-filter"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={showOnlyStarred}
            onChange={e => setShowOnlyStarred(e.target.checked)}
          />
          <label htmlFor="starred-filter" className="ml-2 text-sm text-gray-700">
            Show only starred
          </label>
        </div>

        <div className="text-sm text-gray-500">
          {filteredAndSortedMaps.length} result{filteredAndSortedMaps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 py-3 px-4 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-600 uppercase tracking-wider border-b">
        <div
          className="col-span-4 flex items-center cursor-pointer"
          onClick={() => handleSort('name')}
        >
          Name {renderSortIndicator('name')}
        </div>
        <div className="col-span-2">Status & Type</div>
        <div className="col-span-2 cursor-pointer" onClick={() => handleSort('loanAmount')}>
          Amount {renderSortIndicator('loanAmount')}
        </div>
        <div className="col-span-2 cursor-pointer" onClick={() => handleSort('score')}>
          Score {renderSortIndicator('score')}
        </div>
        <div className="col-span-2 cursor-pointer" onClick={() => handleSort('lastUpdated')}>
          Last Updated {renderSortIndicator('lastUpdated')}
        </div>
      </div>

      {/* Risk Maps List */}
      <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-200">
        {filteredAndSortedMaps.length > 0 ? (
          filteredAndSortedMaps.map(map => (
            <RiskMapItem
              key={map.id}
              map={map}
              onSelect={handleSelectMap}
              onToggleStar={handleToggleStar}
              onArchiveToggle={handleArchiveToggle}
              formatCurrency={formatCurrency}
            />
          ))
        ) : (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No risk maps found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Risk Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRiskMapsView;
