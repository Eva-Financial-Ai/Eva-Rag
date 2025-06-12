import {
  CalendarIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface AIAssistantPreviewProps {
  className?: string;
}

const AIAssistantPreview: React.FC<AIAssistantPreviewProps> = ({ className = '' }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'google-meets' | 'microsoft-teams'>(
    'google-meets'
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <VideoCameraIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Meeting Assistant</h2>
        <p className="text-gray-600 mb-4">Real-time AI agent for commercial finance meetings</p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-full">
          <span className="text-orange-700 font-semibold text-sm">🚀 Launching July 15, 2025</span>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Integration</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedPlatform('google-meets')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedPlatform === 'google-meets'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <VideoCameraIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Google Meets</div>
                <div className="text-sm text-gray-500">Native integration</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlatform('microsoft-teams')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedPlatform === 'microsoft-teams'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <VideoCameraIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Microsoft Teams</div>
                <div className="text-sm text-gray-500">Native integration</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Features Preview</h3>
        <div className="space-y-4">
          {/* Real-time Transcription */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MicrophoneIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Real-time Transcription</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cloudflare Stream-powered live transcription with 99%+ accuracy for finance
                terminology.
              </p>
              <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                ✓ Finance terminology optimized
              </div>
            </div>
          </div>

          {/* Live Deal Analysis */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Live Deal Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">
                EVA provides real-time insights on loan terms, risk factors, and compliance during
                discussions.
              </p>
              <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                ✓ Context-aware analysis
              </div>
            </div>
          </div>

          {/* Action Items & Summary */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Automatic Summaries & Action Items</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate professional meeting summaries with action items, deadlines, and
                follow-ups.
              </p>
              <div className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                ✓ Calendar integration ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Retention Integration</h3>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-900">Seamless Calendar Sync</span>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Automatically schedules follow-ups, creates customer touchpoints, and tracks
            relationship milestones.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-blue-200">
              <span className="text-blue-600">📅 Auto-scheduling</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <span className="text-blue-600">🎯 Deal tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Infrastructure</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">AI Model:</span>
              <span className="font-medium">Llama 3.3 70B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">Cloudflare Workers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transcription:</span>
              <span className="font-medium">Cloudflare Stream</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-medium text-green-600">&lt; 2 seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-medium text-green-600">99%+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Security:</span>
              <span className="font-medium text-green-600">Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Development Roadmap</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Q2 2025: Ollama Llama 3.3 70B Integration</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">July 15: Meeting Assistant MVP Launch</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Q4 2025: Nemotron 70B Upgrade</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed"
        >
          Available July 15, 2025
        </button>
        <p className="text-xs text-gray-500 mt-2">Join the beta program for early access</p>
      </div>
    </div>
  );
};

export default AIAssistantPreview;
