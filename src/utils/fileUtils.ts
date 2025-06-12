import { MessageAttachment } from '../types/conversation';
import { FileAttachment } from '../types/chat';

export const handleFileSelection = async (
  files: FileList,
  type: 'camera' | 'image' | 'file'
): Promise<MessageAttachment[]> => {
  const attachments: MessageAttachment[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const attachment: MessageAttachment = {
      id: generateId(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date()
    };
    attachments.push(attachment);
  }
  
  return attachments;
};

// Adapter function to convert between attachment types
export const convertFileToMessageAttachment = (fileAttachment: FileAttachment): MessageAttachment => {
  return {
    id: fileAttachment.id,
    fileName: fileAttachment.name,
    fileType: fileAttachment.mimeType,
    fileSize: fileAttachment.size,
    url: fileAttachment.url,
    uploadedAt: new Date()
  };
};

export const convertMessageToFileAttachment = (messageAttachment: MessageAttachment): FileAttachment => {
  return {
    id: messageAttachment.id,
    name: messageAttachment.fileName,
    type: getFileType(messageAttachment.fileType),
    url: messageAttachment.url,
    size: messageAttachment.fileSize,
    mimeType: messageAttachment.fileType
  };
};

export const getFileType = (mimeType: string): 'image' | 'document' | 'video' | 'audio' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
}; 