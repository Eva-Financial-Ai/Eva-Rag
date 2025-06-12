import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApiMutation } from '../../hooks/useApiQuery';
import { useAuth } from '../../hooks/useAuth';

interface UploadedVideo {
  id: string;
  filename: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  uploadUrl?: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

interface StreamUploadResponse {
  video_id: string;
  upload_url: string;
  status: string;
  max_duration_seconds: number;
}

const StreamUpload: React.FC = () => {
  const { hasStreamAccess, getAccessTokenSilently } = useAuth();
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Upload mutation
  const uploadMutation = useApiMutation<StreamUploadResponse, File>(
    async (file: File) => {
      const token = await getAccessTokenSilently();

      // First, get upload URL from our API Gateway
      const response = await fetch(
        'https://eva-api-gateway-simple.evafiai.workers.dev/api/v1/stream/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const uploadData = await response.json();

      // Upload file directly to Cloudflare Stream
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(uploadData.data.upload_url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      return uploadData;
    },
    {
      onSuccess: (data, file) => {
        const videoId = file.name + '_' + Date.now();
        setUploadedVideos(prev =>
          prev.map(video =>
            video.filename === file.name
              ? {
                  ...video,
                  id: data.video_id || videoId,
                  status: 'processing',
                  uploadUrl: data.upload_url,
                  progress: 100,
                }
              : video
          )
        );

        // Start polling for video status
        pollVideoStatus(data.video_id || videoId);
      },
      onError: (error, file) => {
        setUploadedVideos(prev =>
          prev.map(video =>
            video.filename === file.name
              ? {
                  ...video,
                  status: 'error',
                  error: error.message || 'Upload failed',
                  progress: 0,
                }
              : video
          )
        );
      },
    }
  );

  // Poll video processing status
  const pollVideoStatus = useCallback(
    async (videoId: string) => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `https://eva-api-gateway-simple.evafiai.workers.dev/api/v1/stream/videos/${videoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const videoData = await response.json();

          setUploadedVideos(prev =>
            prev.map(video =>
              video.id === videoId
                ? {
                    ...video,
                    status: videoData.status === 'ready' ? 'ready' : 'processing',
                    playbackUrl: videoData.playback_url,
                    thumbnailUrl: videoData.thumbnail,
                    duration: videoData.duration,
                  }
                : video
            )
          );

          // Continue polling if still processing
          if (videoData.status !== 'ready' && videoData.status !== 'error') {
            setTimeout(() => pollVideoStatus(videoId), 3000);
          }
        }
      } catch (error) {
        console.error('Failed to poll video status:', error);
      }
    },
    [getAccessTokenSilently]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('video/')) {
          alert('Only video files are allowed');
          return;
        }

        // Validate file size (5GB max)
        const maxSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes
        if (file.size > maxSize) {
          alert('File size must be less than 5GB');
          return;
        }

        // Add to upload queue
        const videoId = file.name + '_' + Date.now();
        const newVideo: UploadedVideo = {
          id: videoId,
          filename: file.name,
          size: file.size,
          status: 'uploading',
          progress: 0,
        };

        setUploadedVideos(prev => [...prev, newVideo]);

        // Start upload
        uploadMutation.mutate(file);
      });
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    },
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeVideo = (videoId: string) => {
    setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                You don't have permission to access stream management. This feature is only
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
        <div className="flex items-center">
          <VideoCameraIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Video Upload
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload videos for processing and streaming. System admin access required.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="w-full">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragAccept ? 'border-green-400 bg-green-50' : ''}
            ${isDragReject ? 'border-red-400 bg-red-50' : ''}
            ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
            ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />

          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop videos here' : 'Upload videos'}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Drag and drop video files here, or click to select files
          </p>

          <div className="mt-4 text-xs text-gray-400">
            <p>Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV</p>
            <p>Maximum file size: 5GB | Maximum duration: 1 hour</p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Select Videos
          </button>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadedVideos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Queue</h3>

          <div className="space-y-3">
            {uploadedVideos.map(video => (
              <div
                key={video.id}
                className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {video.status === 'ready' && (
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      )}
                      {video.status === 'uploading' && (
                        <CloudArrowUpIcon className="h-8 w-8 text-blue-500 animate-pulse" />
                      )}
                      {video.status === 'processing' && (
                        <VideoCameraIcon className="h-8 w-8 text-yellow-500 animate-spin" />
                      )}
                      {video.status === 'error' && <XCircleIcon className="h-8 w-8 text-red-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{video.filename}</p>
                      <div className="text-sm text-gray-500 space-x-4">
                        <span>{formatFileSize(video.size)}</span>
                        {video.duration && <span>{formatDuration(video.duration)}</span>}
                        <span className="capitalize">{video.status}</span>
                      </div>
                      {video.error && <p className="text-sm text-red-600 mt-1">{video.error}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {video.status === 'ready' && video.playbackUrl && (
                      <a
                        href={video.playbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        View
                      </a>
                    )}

                    <button
                      onClick={() => removeVideo(video.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(video.status === 'uploading' || video.status === 'processing') && (
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          video.status === 'uploading' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {video.status === 'uploading'
                        ? `Uploading... ${video.progress}%`
                        : 'Processing video...'}
                    </p>
                  </div>
                )}

                {/* Thumbnail */}
                {video.thumbnailUrl && (
                  <div className="mt-3">
                    <img
                      src={video.thumbnailUrl}
                      alt="Video thumbnail"
                      className="h-20 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <VideoCameraIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Upload Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum file size: 5GB per video</li>
                <li>Maximum duration: 1 hour (3600 seconds)</li>
                <li>Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV</li>
                <li>Videos are automatically transcoded for optimal streaming</li>
                <li>Adaptive bitrate streaming is enabled for all videos</li>
                <li>Global CDN ensures fast playback worldwide</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamUpload;
