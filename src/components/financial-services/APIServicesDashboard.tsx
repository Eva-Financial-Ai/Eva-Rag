import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudIcon,
  ServerIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  description: string;
  category: 'underwriting' | 'video' | 'images' | 'security' | 'chat' | 'matching' | 'gateway';
  responseTime: number;
  uptime: number;
  requestsPerMinute: number;
  errorRate: number;
  lastHealthCheck: Date;
  version: string;
  isPublic: boolean;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: string;
  };
}

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  issues?: string[];
}

interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakRequestsPerMinute: number;
  activeConnections: number;
}

const APIServicesDashboard: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [metrics, setMetrics] = useState<APIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    peakRequestsPerMinute: 0,
    activeConnections: 0,
  });
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/system/endpoints`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEndpoints(data.endpoints || mockEndpoints);
      } else {
        setEndpoints(mockEndpoints);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      setEndpoints(mockEndpoints);
    }
  }, []);

  const fetchServiceHealth = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/system/health`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServiceHealth(data.services || mockServiceHealth);
      } else {
        setServiceHealth(mockServiceHealth);
      }
    } catch (error) {
      console.error('Error fetching service health:', error);
      setServiceHealth(mockServiceHealth);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/system/metrics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || mockMetrics);
      } else {
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics(mockMetrics);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
    fetchServiceHealth();
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServiceHealth();
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchEndpoints, fetchServiceHealth, fetchMetrics]);



  const testEndpoint = async (endpoint: APIEndpoint) => {
    try {
      setTestResponse({ loading: true });
      
      const url = getFullEndpointUrl(endpoint);
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        ...(endpoint.method !== 'GET' && {
          body: JSON.stringify(getSamplePayload(endpoint)),
        }),
      });

      const data = await response.json();
      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime: Date.now() - performance.now(),
      });
    } catch (error) {
      setTestResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getFullEndpointUrl = (endpoint: APIEndpoint): string => {
    const baseUrls: Record<string, string> = {
      gateway: process.env.REACT_APP_API_URL || '',
      video: process.env.REACT_APP_VIDEO_URL || '',
      images: process.env.REACT_APP_IMAGES_URL || '',
      security: process.env.REACT_APP_SECURITY_URL || '',
      chat: process.env.REACT_APP_CHAT_URL || '',
      matching: process.env.REACT_APP_SMART_MATCHING_URL || '',
      underwriting: process.env.REACT_APP_API_URL || '',
    };

    return `${baseUrls[endpoint.category]}${endpoint.path}`;
  };

  const getSamplePayload = (endpoint: APIEndpoint): any => {
    const samplePayloads: Record<string, any> = {
      '/api/v1/underwriting/process': {
        applicationId: 'APP-2024-001',
        useAI: true,
        complianceLevel: 'high',
      },
      '/api/v1/video/token': {
        identity: 'test_user',
        room: 'test_room',
        complianceLevel: 'high',
      },
      '/api/v1/images/upload': {
        documentType: 'test',
        piiLevel: 'low',
      },
    };

    return samplePayloads[endpoint.path] || {};
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchEndpoints(),
      fetchServiceHealth(),
      fetchMetrics(),
    ]);
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
      case 'down':
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-100';
      case 'POST': return 'text-green-600 bg-green-100';
      case 'PUT': return 'text-yellow-600 bg-yellow-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'PATCH': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'underwriting': return <CpuChipIcon className="h-5 w-5" />;
      case 'video': return <PlayIcon className="h-5 w-5" />;
      case 'images': return <CloudIcon className="h-5 w-5" />;
      case 'security': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'gateway': return <ServerIcon className="h-5 w-5" />;
      default: return <Cog6ToothIcon className="h-5 w-5" />;
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    if (filter === 'all') return true;
    return endpoint.category === filter || endpoint.status === filter;
  });

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : 'N/A';

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Services Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all financial service endpoints</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {format(new Date(), 'h:mm:ss a')}
            </div>
            <button
              onClick={refreshAll}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.peakRequestsPerMinute}</div>
            <div className="text-sm text-gray-600">Peak RPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.activeConnections}</div>
            <div className="text-sm text-gray-600">Active Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.failedRequests}</div>
            <div className="text-sm text-gray-600">Failed Requests</div>
          </div>
        </div>
      </div>

      {/* Service Health Status */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Service Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {serviceHealth.map((service) => (
            <div key={service.service} className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getCategoryIcon(service.service)}
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900 capitalize">{service.service}</div>
              <div className="text-xs text-gray-500">{service.responseTime}ms</div>
              <div className="text-xs text-gray-500">{service.uptime}% uptime</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Endpoints List */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              {[
                { value: 'all', label: 'All Endpoints' },
                { value: 'underwriting', label: 'Underwriting' },
                { value: 'video', label: 'Video Services' },
                { value: 'images', label: 'Image Processing' },
                { value: 'security', label: 'Security' },
                { value: 'gateway', label: 'API Gateway' },
                { value: 'active', label: 'Active Only' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === f.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Security
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEndpoints.map((endpoint) => (
                  <tr
                    key={endpoint.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedEndpoint(endpoint)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getCategoryIcon(endpoint.category)}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                          </div>
                          <div className="text-sm text-gray-500">{endpoint.path}</div>
                          <div className="text-xs text-gray-400">{endpoint.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        v{endpoint.version}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{endpoint.responseTime}ms</div>
                      <div className="text-sm text-gray-500">{endpoint.uptime}% uptime</div>
                      <div className="text-xs text-gray-400">{endpoint.requestsPerMinute} req/min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {endpoint.requiresAuth && (
                          <ShieldCheckIcon className="h-4 w-4 text-green-500" title="Requires Auth" />
                        )}
                        {endpoint.isPublic && (
                          <CloudIcon className="h-4 w-4 text-blue-500" title="Public API" />
                        )}
                        {endpoint.rateLimit && (
                          <ClockIcon className="h-4 w-4 text-orange-500" title="Rate Limited" />
                        )}
                      </div>
                      {endpoint.errorRate > 0 && (
                        <div className="text-xs text-red-600">{endpoint.errorRate}% errors</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEndpoint(endpoint);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testEndpoint(endpoint);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Endpoint Details Sidebar */}
        {selectedEndpoint && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Endpoint Details</h3>
                <button
                  onClick={() => setSelectedEndpoint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <StopIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedEndpoint.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Path:</span>
                      <span className="text-sm font-medium text-right break-all">{selectedEndpoint.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium capitalize">{selectedEndpoint.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Version:</span>
                      <span className="text-sm font-medium">v{selectedEndpoint.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Performance</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Response Time:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedEndpoint.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Uptime:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedEndpoint.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Requests/Min:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedEndpoint.requestsPerMinute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Error Rate:</span>
                      <span className={`text-sm font-medium ${selectedEndpoint.errorRate > 5 ? 'text-red-600' : 'text-blue-900'}`}>
                        {selectedEndpoint.errorRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Configuration */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Security</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Authentication:</span>
                      <span className={`text-sm font-medium ${selectedEndpoint.requiresAuth ? 'text-green-900' : 'text-red-600'}`}>
                        {selectedEndpoint.requiresAuth ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Public API:</span>
                      <span className={`text-sm font-medium ${selectedEndpoint.isPublic ? 'text-orange-600' : 'text-green-900'}`}>
                        {selectedEndpoint.isPublic ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedEndpoint.rateLimit && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Rate Limit:</span>
                        <span className="text-sm font-medium text-green-900">
                          {selectedEndpoint.rateLimit.requests}/{selectedEndpoint.rateLimit.window}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Endpoint */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Test Endpoint</h4>
                <button
                  onClick={() => testEndpoint(selectedEndpoint)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Test Endpoint
                </button>
                
                {testResponse && (
                  <div className="mt-4 bg-gray-900 text-gray-100 rounded-lg p-4 text-sm">
                    {testResponse.loading ? (
                      <div>Testing...</div>
                    ) : testResponse.error ? (
                      <div className="text-red-400">Error: {testResponse.error}</div>
                    ) : (
                      <div>
                        <div className="mb-2">
                          Status: <span className={testResponse.status < 400 ? 'text-green-400' : 'text-red-400'}>
                            {testResponse.status} {testResponse.statusText}
                          </span>
                        </div>
                        <div className="mb-2">Response Time: {testResponse.responseTime}ms</div>
                        <div className="max-h-32 overflow-y-auto">
                          <pre>{JSON.stringify(testResponse.data, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full URL */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Full URL</h4>
                <div className="bg-gray-100 rounded-lg p-3">
                  <code className="text-sm text-gray-800 break-all">
                    {getFullEndpointUrl(selectedEndpoint)}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for demo purposes
const mockEndpoints: APIEndpoint[] = [
  {
    id: 'ep-001',
    name: 'Process Underwriting Application',
    path: '/api/v1/underwriting/process',
    method: 'POST',
    status: 'active',
    description: 'AI-powered loan application processing',
    category: 'underwriting',
    responseTime: 1250,
    uptime: 99.8,
    requestsPerMinute: 45,
    errorRate: 0.2,
    lastHealthCheck: new Date(),
    version: '2.1',
    isPublic: false,
    requiresAuth: true,
    rateLimit: { requests: 100, window: '1m' },
  },
  {
    id: 'ep-002',
    name: 'Get Video Token',
    path: '/api/v1/video/token',
    method: 'POST',
    status: 'active',
    description: 'Generate Twilio video access token',
    category: 'video',
    responseTime: 320,
    uptime: 99.9,
    requestsPerMinute: 12,
    errorRate: 0.1,
    lastHealthCheck: new Date(),
    version: '1.4',
    isPublic: false,
    requiresAuth: true,
  },
  {
    id: 'ep-003',
    name: 'Upload Image',
    path: '/api/v1/images/upload',
    method: 'POST',
    status: 'active',
    description: 'Upload and process financial documents',
    category: 'images',
    responseTime: 2100,
    uptime: 99.5,
    requestsPerMinute: 23,
    errorRate: 0.8,
    lastHealthCheck: new Date(),
    version: '1.2',
    isPublic: false,
    requiresAuth: true,
    rateLimit: { requests: 50, window: '5m' },
  },
  {
    id: 'ep-004',
    name: 'Bot Protection Check',
    path: '/api/v1/security/verify',
    method: 'POST',
    status: 'active',
    description: 'Turnstile bot protection verification',
    category: 'security',
    responseTime: 180,
    uptime: 99.99,
    requestsPerMinute: 150,
    errorRate: 0.05,
    lastHealthCheck: new Date(),
    version: '1.0',
    isPublic: true,
    requiresAuth: false,
    rateLimit: { requests: 1000, window: '1m' },
  },
];

const mockServiceHealth: ServiceHealth[] = [
  { service: 'gateway', status: 'healthy', responseTime: 45, uptime: 99.9, lastCheck: new Date() },
  { service: 'underwriting', status: 'healthy', responseTime: 120, uptime: 99.8, lastCheck: new Date() },
  { service: 'video', status: 'healthy', responseTime: 89, uptime: 99.9, lastCheck: new Date() },
  { service: 'images', status: 'degraded', responseTime: 340, uptime: 99.1, lastCheck: new Date(), issues: ['High processing queue'] },
  { service: 'security', status: 'healthy', responseTime: 15, uptime: 99.99, lastCheck: new Date() },
  { service: 'chat', status: 'healthy', responseTime: 67, uptime: 99.7, lastCheck: new Date() },
  { service: 'matching', status: 'healthy', responseTime: 156, uptime: 99.6, lastCheck: new Date() },
];

const mockMetrics: APIMetrics = {
  totalRequests: 2847592,
  successfulRequests: 2834156,
  failedRequests: 13436,
  averageResponseTime: 187,
  peakRequestsPerMinute: 847,
  activeConnections: 234,
};

export default APIServicesDashboard; 