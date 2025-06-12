import React from 'react';

interface TypingIndicatorProps {
  sender: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ sender }) => {
  return (
    <div className="mb-4 max-w-xs">
      <div className="flex items-end mb-1">
        <span className="text-xs text-gray-500 mr-2">{sender}</span>
        <span className="text-xs text-gray-500">typing...</span>
      </div>
      
      <div className="bg-purple-100 text-gray-800 rounded-lg p-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 