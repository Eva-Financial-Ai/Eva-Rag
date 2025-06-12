import React from 'react';
import { usePerformanceMonitoring } from '../../services/performanceMonitoring';
import {
  WifiIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const PerformanceMonitoringDashboard: React.FC = () => {
  const { report } = usePerformanceMonitoring();

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'unhealthy':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 border-red-300';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Monitoring</h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* WebSocket Health */}
      <div className={`rounded-lg border-2 p-6 ${getStatusColor(report.websocket.status)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <WifiIcon className="w-8 h-8 text-gray-700 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">WebSocket Connection</h3>
              <p className="text-sm text-gray-600">Real-time updates status</p>
            </div>
          </div>
          {getStatusIcon(report.websocket.status)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-500">Health Score</p>
            <p className="text-xl font-bold">{report.websocket.score}%</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-500">Success Rate</p>
            <p className="text-xl font-bold">
              {report.websocket.details.connectionAttempts > 0
                ? Math.round(
                    (report.websocket.details.successfulConnections /
                      report.websocket.details.connectionAttempts) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-500">Avg Latency</p>
            <p className="text-xl font-bold">
              {formatDuration(report.websocket.details.averageLatency)}
            </p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-500">Messages</p>
            <p className="text-xl font-bold">
              {report.websocket.details.messagesReceived + report.websocket.details.messagesSent}
            </p>
          </div>
        </div>

        {report.websocket.details.lastError && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <p className="text-sm text-red-800">Last Error: {report.websocket.details.lastError}</p>
            <p className="text-xs text-red-600">
              {new Date(report.websocket.details.lastErrorTime!).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Export Performance */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <DocumentArrowDownIcon className="w-8 h-8 text-gray-700 mr-3" />
          <div>
            <h3 className="text-lg font-semibold">Export Performance</h3>
            <p className="text-sm text-gray-600">Document export statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500">Total Exports</p>
            <p className="text-xl font-bold">{report.export.details.totalExports}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500">Success Rate</p>
            <p className="text-xl font-bold">{report.export.successRate}%</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500">Avg Time</p>
            <p className="text-xl font-bold">{formatDuration(report.export.averageTime)}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500">Popular Format</p>
            <p className="text-xl font-bold uppercase">{report.export.popularFormat}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Largest Export:</span>{' '}
            <span className="font-medium">
              {formatBytes(report.export.details.largestExportSize)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Failed Exports:</span>{' '}
            <span className="font-medium text-red-600">{report.export.details.failedExports}</span>
          </div>
        </div>
      </div>

      {/* Recent Metrics Timeline */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="w-8 h-8 text-gray-700 mr-3" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {report.recentMetrics
            .slice(-10)
            .reverse()
            .map((metric, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      metric.name.includes('error') ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <span className="text-gray-700">{metric.name}</span>
                  {metric.tags && (
                    <span className="ml-2 text-xs text-gray-500">
                      {Object.entries(metric.tags)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
