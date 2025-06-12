/**
 * Mock Cloud Storage Service
 * Provides working UI functionality without OAuth requirements
 */

export interface CloudFile {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedTime: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  provider: 'google' | 'onedrive' | 'local';
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

class MockCloudStorageService {
  private mockFiles: CloudFile[] = [
    {
      id: 'mock-google-1',
      name: 'Business_License.pdf',
      type: 'application/pdf',
      size: 2048576,
      modifiedTime: '2024-01-15T10:30:00Z',
      downloadUrl: '/mock-downloads/business-license.pdf',
      provider: 'google',
    },
    {
      id: 'mock-google-2',
      name: 'Financial_Statements_2023.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1536000,
      modifiedTime: '2024-01-10T14:22:00Z',
      downloadUrl: '/mock-downloads/financial-statements.xlsx',
      provider: 'google',
    },
    {
      id: 'mock-onedrive-1',
      name: 'Tax_Returns_2023.pdf',
      type: 'application/pdf',
      size: 3072000,
      modifiedTime: '2024-01-12T09:15:00Z',
      downloadUrl: '/mock-downloads/tax-returns.pdf',
      provider: 'onedrive',
    },
    {
      id: 'mock-onedrive-2',
      name: 'Bank_Statements_Q4.pdf',
      type: 'application/pdf',
      size: 1024000,
      modifiedTime: '2024-01-08T16:45:00Z',
      downloadUrl: '/mock-downloads/bank-statements.pdf',
      provider: 'onedrive',
    },
  ];

  private uploadCallbacks: Array<(progress: UploadProgress) => void> = [];
  private isConnected = {
    google: false,
    onedrive: false,
  };

  // Simulate connection to Google Drive
  async connectGoogleDrive(): Promise<{ success: boolean; message: string }> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.isConnected.google = true;
        resolve({
          success: true,
          message: 'Successfully connected to Google Drive (Mock)',
        });
      }, 1500);
    });
  }

  // Simulate connection to OneDrive
  async connectOneDrive(): Promise<{ success: boolean; message: string }> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.isConnected.onedrive = true;
        resolve({
          success: true,
          message: 'Successfully connected to OneDrive (Mock)',
        });
      }, 1200);
    });
  }

  // Check connection status
  isGoogleDriveConnected(): boolean {
    return this.isConnected.google;
  }

  isOneDriveConnected(): boolean {
    return this.isConnected.onedrive;
  }

  // Simulate fetching files from Google Drive
  async getGoogleDriveFiles(folderId?: string): Promise<CloudFile[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const googleFiles = this.mockFiles.filter(file => file.provider === 'google');
        resolve(googleFiles);
      }, 800);
    });
  }

  // Simulate fetching files from OneDrive
  async getOneDriveFiles(folderId?: string): Promise<CloudFile[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const oneDriveFiles = this.mockFiles.filter(file => file.provider === 'onedrive');
        resolve(oneDriveFiles);
      }, 900);
    });
  }

  // Simulate file upload to cloud storage
  async uploadToCloudStorage(
    files: File[],
    provider: 'google' | 'onedrive',
    folderId?: string,
  ): Promise<CloudFile[]> {
    const uploadedFiles: CloudFile[] = [];

    for (const file of files) {
      const mockFile: CloudFile = {
        id: `mock-${provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        modifiedTime: new Date().toISOString(),
        downloadUrl: `/mock-downloads/${file.name}`,
        provider,
      };

      // Simulate upload progress
      await this.simulateUpload(mockFile);

      uploadedFiles.push(mockFile);
      this.mockFiles.push(mockFile);
    }

    return uploadedFiles;
  }

  // Simulate upload progress
  private async simulateUpload(file: CloudFile): Promise<void> {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Notify completion
          this.uploadCallbacks.forEach(callback => {
            callback({
              fileId: file.id,
              fileName: file.name,
              progress: 100,
              status: 'completed',
            });
          });

          resolve();
        } else {
          // Notify progress
          this.uploadCallbacks.forEach(callback => {
            callback({
              fileId: file.id,
              fileName: file.name,
              progress: Math.round(progress),
              status: 'uploading',
            });
          });
        }
      }, 200);
    });
  }

  // Subscribe to upload progress
  onUploadProgress(callback: (progress: UploadProgress) => void): () => void {
    this.uploadCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.uploadCallbacks.indexOf(callback);
      if (index > -1) {
        this.uploadCallbacks.splice(index, 1);
      }
    };
  }

  // Simulate file download
  async downloadFile(file: CloudFile): Promise<Blob> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Create a mock file blob
        const mockContent = `Mock content for ${file.name}`;
        const blob = new Blob([mockContent], { type: file.type });
        resolve(blob);
      }, 500);
    });
  }

  // Search files across both providers
  async searchFiles(query: string): Promise<CloudFile[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const filteredFiles = this.mockFiles.filter(file =>
          file.name.toLowerCase().includes(query.toLowerCase()),
        );
        resolve(filteredFiles);
      }, 600);
    });
  }

  // Disconnect from cloud services
  disconnect(provider?: 'google' | 'onedrive'): void {
    if (provider) {
      this.isConnected[provider] = false;
    } else {
      this.isConnected.google = false;
      this.isConnected.onedrive = false;
    }
  }

  // Get connection status
  getConnectionStatus(): { google: boolean; onedrive: boolean } {
    return { ...this.isConnected };
  }

  // Utility to format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility to get file icon based on type
  static getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    return '📁';
  }
}

// Export singleton instance
export const mockCloudStorageService = new MockCloudStorageService();
export { MockCloudStorageService };
export default mockCloudStorageService;
