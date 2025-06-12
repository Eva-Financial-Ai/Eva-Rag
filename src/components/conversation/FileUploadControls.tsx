import React from 'react';
import { Camera, Image, File, X } from '../../utils/mockIcons';
import { formatFileSize } from '../../utils/fileUtils';

// Using the MessageAttachment type from conversation.ts
import { MessageAttachment } from '../../types/conversation';

interface FileUploadControlsProps {
  onCameraCapture: () => void;
  onImageSelect: () => void;
  onFileSelect: () => void;
  selectedFiles: MessageAttachment[];
  onRemoveFile: (fileId: string) => void;
}

export const FileUploadControls: React.FC<FileUploadControlsProps> = ({
  onCameraCapture,
  onImageSelect,
  onFileSelect,
  selectedFiles,
  onRemoveFile
}) => {
  return (
    <div className="mb-4">
      {/* Upload Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={onCameraCapture}
          className="flex-1 flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <Camera className="w-6 h-6 mb-2" />
          <span className="text-sm">Camera</span>
        </button>
        
        <button
          onClick={onImageSelect}
          className="flex-1 flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <Image className="w-6 h-6 mb-2" />
          <span className="text-sm">Photos</span>
        </button>
        
        <button
          onClick={onFileSelect}
          className="flex-1 flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <File className="w-6 h-6 mb-2" />
          <span className="text-sm">Files</span>
        </button>
      </div>
      
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map(file => (
            <SelectedFileItem
              key={file.id}
              file={file}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SelectedFileItemProps {
  file: MessageAttachment;
  onRemove: () => void;
}

const SelectedFileItem: React.FC<SelectedFileItemProps> = ({ file, onRemove }) => {
  const getFileIcon = () => {
    switch (file.fileType.split('/')[0]) {
      case 'image':
        return <Image size={20} />;
      case 'video':
        return <Camera size={20} />;
      case 'audio':
        return <File size={20} />;
      default:
        return <File size={20} />;
    }
  };

  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="mr-3">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{file.fileName}</div>
        <div className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</div>
      </div>
      <button 
        onClick={onRemove}
        className="p-1 rounded-full hover:bg-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}; 