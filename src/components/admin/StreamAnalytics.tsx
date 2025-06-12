import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  GlobeAltIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../../hooks/useAuth';

interface StreamAnalytics {
  overview: {
    total_videos: number;
    total_views: number;
    total_duration: number;
    storage_used: number;
    bandwidth_used: number;
  };
  trending_videos: Array<{
    video_id: string;
    title: string;
    views: number;
    duration: number;
    thumbnail: string;
    growth_rate: number;
  }>;
  geographic_data: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  time_series_data: Array<{
    date: string;
    views: number;
    uploads: number;
    bandwidth: number;
  }>;
  device_data: Array<{
    device_type: string;
    views: number;
    percentage: number;
  }>;
  performance_metrics: {
    avg_load_time: number;
    avg_watch_time: number;
    completion_rate: number;
    error_rate: number;
  };
}

const StreamAnalytics: React.FC = () => {
  const { hasStreamAccess, getAccessTokenSilently } = useAuth();
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('views');

  // Fetch analytics data
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useApiQuery<StreamAnalytics>(
    ['stream-analytics', timeRange],
    async () => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://eva-api-gateway-simple.evafiai.workers.dev/api/v1/stream/analytics?period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return response.json();
    },
    {
      enabled: hasStreamAccess,
      staleTime: 300000, // 5 minutes
    },
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className: string }>;
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, trend, subtitle }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-red-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend !== undefined && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center text-red-500" />
                  )}
                  <span className="sr-only">{trend >= 0 ? 'Increased' : 'Decreased'} by</span>
                  {Math.abs(trend)}%
                </div>
              )}
            </dd>
            {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
          </dl>
        </div>
      </div>
    </div>
  );

  if (!hasStreamAccess) {
    return (
      <div className="bg-red-50 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                You don't have permission to access stream analytics. This feature is only available
                to system administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center">
            <ChartBarIcon className="mr-3 h-8 w-8 animate-pulse text-red-600" />
            <div>
              <div className="mb-2 h-8 w-48 rounded bg-gray-300"></div>
              <div className="h-4 w-96 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-8 w-8 rounded bg-gray-300"></div>
              <div className="mb-2 h-4 w-24 rounded bg-gray-300"></div>
              <div className="h-8 w-16 rounded bg-gray-300"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Error loading analytics</h3>
        <p className="mb-4 text-gray-500">There was a problem loading the analytics data.</p>
        <button
          onClick={() => refetch()}
          className="bg-red-600 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="mr-3 h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Stream Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor video performance and engagement metrics. System admin access required.
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="block rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Videos"
              value={analytics.overview.total_videos}
              icon={PlayIcon}
              subtitle="Active videos"
            />
            <MetricCard
              title="Total Views"
              value={formatNumber(analytics.overview.total_views)}
              icon={EyeIcon}
              trend={12.5}
              subtitle="Across all videos"
            />
            <MetricCard
              title="Watch Time"
              value={formatDuration(analytics.overview.total_duration)}
              icon={ClockIcon}
              trend={8.2}
              subtitle="Total watched"
            />
            <MetricCard
              title="Storage Used"
              value={formatBytes(analytics.overview.storage_used)}
              icon={GlobeAltIcon}
              subtitle="Of available storage"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(analytics.performance_metrics.completion_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.performance_metrics.avg_load_time.toFixed(1)}s
                </div>
                <div className="text-sm text-gray-500">Avg Load Time</div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatDuration(analytics.performance_metrics.avg_watch_time)}
                </div>
                <div className="text-sm text-gray-500">Avg Watch Time</div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(analytics.performance_metrics.error_rate * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-500">Error Rate</div>
              </div>
            </div>
          </div>

          {/* Trending Videos */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Trending Videos</h3>
              <p className="text-sm text-gray-500">
                Most popular videos in the selected time period
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.trending_videos.map((video, index) => (
                <div key={video.video_id} className="flex items-center space-x-4 p-6">
                  <div className="w-8 flex-shrink-0 text-lg font-bold text-gray-500">
                    #{index + 1}
                  </div>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-16 w-24 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{video.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDuration(video.duration)} • {formatNumber(video.views)} views
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        video.growth_rate >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {video.growth_rate >= 0 ? '+' : ''}
                      {video.growth_rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Data and Device Data */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Geographic Distribution */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
                <p className="text-sm text-gray-500">Views by country</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.geographic_data.map(country => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-gray-900">{country.country}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          {formatNumber(country.views)} views
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {country.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Distribution */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Device Distribution</h3>
                <p className="text-sm text-gray-500">Views by device type</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.device_data.map(device => (
                    <div key={device.device_type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium capitalize text-gray-900">
                          {device.device_type}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          {formatNumber(device.views)} views
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {device.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Chart Placeholder */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Views Over Time</h3>
              <p className="text-sm text-gray-500">
                Daily views and uploads for the selected period
              </p>
            </div>
            <div className="p-6">
              <div className="flex h-64 items-center justify-center rounded bg-gray-50">
                <div className="text-center">
                  <ChartBarIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">Time series chart would be displayed here</p>
                  <p className="text-sm text-gray-400">
                    Integration with charting library recommended
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bandwidth Usage */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-center">
              <GlobeAltIcon className="mr-3 h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Bandwidth Usage</h3>
                <p className="text-sm text-blue-700">
                  Total bandwidth used:{' '}
                  <strong>{formatBytes(analytics.overview.bandwidth_used)}</strong>
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Optimized delivery through Cloudflare's global CDN network
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StreamAnalytics;
