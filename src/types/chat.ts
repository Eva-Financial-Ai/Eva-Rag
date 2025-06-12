export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size: number;
  mimeType: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  messageCount: number;
}

export interface ChatSettings {
  style: 'normal' | 'creative' | 'precise' | 'custom';
  extendedThinking: boolean;
  researchEnabled: boolean;
  selectedProject?: string;
}

export interface ModelConfig {
  name: string;
  version: string;
  displayName: string;
} 