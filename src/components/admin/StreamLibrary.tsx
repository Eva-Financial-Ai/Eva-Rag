import {
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../../hooks/useAuth';

interface Video {
  video_id: string;
  title?: string;
  filename?: string;
  status: 'ready' | 'processing' | 'error';
  duration: number;
  size?: number;
  thumbnail: string;
  playback_url: string;
  created: string;
  views?: number;
  description?: string;
}

interface StreamLibraryResponse {
  videos: Video[];
  total: number;
  page: number;
  per_page: number;
}

const StreamLibrary: React.FC = () => {
  const { hasStreamAccess, getAccessTokenSilently } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [page, setPage] = useState(1);

  // Fetch videos query
  const {
    data: videosData,
    isLoading,
    error,
    refetch,
  } = useApiQuery<StreamLibraryResponse>(
    ['stream-videos', page, searchTerm, selectedStatus, sortBy, sortOrder],
    async () => {
      const token = await getAccessTokenSilently();
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const response = await fetch(
        `https://eva-api-gateway-simple.evafiai.workers.dev/api/v1/stream/videos?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      return response.json();
    },
    {
      enabled: hasStreamAccess,
      staleTime: 30000, // 30 seconds
    }
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://eva-api-gateway-simple.evafiai.workers.dev/api/v1/stream/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        refetch();
        if (selectedVideo?.video_id === videoId) {
          setSelectedVideo(null);
        }
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video');
    }
  };

  const VideoModal: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {video.title || video.filename || video.video_id}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="aspect-video w-full bg-black rounded-lg mb-4">
            <video controls className="w-full h-full rounded-lg" poster={video.thumbnail}>
              <source src={video.playback_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Duration:</strong> {formatDuration(video.duration)}
            </div>
            <div>
              <strong>Created:</strong> {formatDate(video.created)}
            </div>
            <div>
              <strong>Status:</strong>
              <span
                className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  video.status === 'ready'
                    ? 'bg-green-100 text-green-800'
                    : video.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {video.status}
              </span>
            </div>
            <div>
              <strong>Views:</strong> {video.views || 0}
            </div>
          </div>

          {video.description && (
            <div className="mt-4">
              <strong>Description:</strong>
              <p className="mt-1 text-gray-700">{video.description}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <a
              href={video.playback_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download
            </a>
            <button
              onClick={() => handleDeleteVideo(video.video_id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasStreamAccess) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                You don't have permission to access the video library. This feature is only
                available to system administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Video Library
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and view all uploaded videos. System admin access required.
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {videosData && `${videosData.total} total videos`}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="created">Created Date</option>
            <option value="duration">Duration</option>
            <option value="views">Views</option>
            <option value="title">Title</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading videos</h3>
          <p className="text-gray-500 mb-4">There was a problem loading the video library.</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : videosData?.videos.length === 0 ? (
        <div className="text-center py-12">
          <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">Upload some videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videosData?.videos.map(video => (
            <div
              key={video.video_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={video.thumbnail}
                  alt={video.title || video.filename || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                  <EyeIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs ${
                    video.status === 'ready'
                      ? 'bg-green-500 text-white'
                      : video.status === 'processing'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                  }`}
                >
                  {video.status}
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                  {video.title || video.filename || video.video_id}
                </h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {formatDate(video.created)}</div>
                  <div>Views: {video.views || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {videosData && videosData.total > videosData.per_page && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {Math.ceil(videosData.total / videosData.per_page)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(videosData.total / videosData.per_page)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  );
};

export default StreamLibrary;
