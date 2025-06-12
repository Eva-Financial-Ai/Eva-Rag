/**
 * Google Drive Integration Service
 * 
 * Provides integration with Google Drive for document upload and management
 * within the FileLock and Shield Vault systems.
 */

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
};

// Google Drive file interface
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  parents?: string[];
  starred?: boolean;
  trashed?: boolean;
  explicitlyTrashed?: boolean;
  capabilities?: {
    canDownload?: boolean;
    canEdit?: boolean;
    canShare?: boolean;
  };
}

// Google Picker result
export interface GooglePickerResult {
  action: string;
  docs: Array<{
    id: string;
    name: string;
    mimeType: string;
    sizeBytes?: number;
    url?: string;
    iconUrl?: string;
    lastEditedUtc?: number;
  }>;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isInitialized = false;
  private authInstance: any = null;
  private pickerApiLoaded = false;
  private oauthToken: string | null = null;

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Initialize Google API client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load the Google API client
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2:picker', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_DRIVE_CONFIG.apiKey,
              clientId: GOOGLE_DRIVE_CONFIG.clientId,
              discoveryDocs: GOOGLE_DRIVE_CONFIG.discoveryDocs,
              scope: GOOGLE_DRIVE_CONFIG.scope,
            });

            this.authInstance = window.gapi.auth2.getAuthInstance();
            this.isInitialized = true;
            this.pickerApiLoaded = true;
            resolve();
          } catch (error) {
            console.error('Error initializing Google API:', error);
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Sign in to Google
   */
  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const user = await this.authInstance.signIn();
      this.oauthToken = user.getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (this.authInstance) {
      await this.authInstance.signOut();
      this.oauthToken = null;
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.authInstance?.isSignedIn.get() || false;
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): any {
    if (!this.isSignedIn()) return null;
    
    const user = this.authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
    };
  }

  /**
   * Show Google Drive file picker
   */
  async showPicker(options?: {
    multiSelect?: boolean;
    mimeTypes?: string[];
    viewId?: string;
  }): Promise<GooglePickerResult | null> {
    if (!this.isSignedIn()) {
      const signedIn = await this.signIn();
      if (!signedIn) return null;
    }

    return new Promise((resolve) => {
      const view = new window.google.picker.DocsView()
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false);

      // Set mime types filter if provided
      if (options?.mimeTypes && options.mimeTypes.length > 0) {
        view.setMimeTypes(options.mimeTypes.join(','));
      }

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.oauthToken!)
        .setDeveloperKey(GOOGLE_DRIVE_CONFIG.apiKey)
        .setCallback((data: GooglePickerResult) => {
          if (data.action === window.google.picker.Action.PICKED) {
            resolve(data);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve(null);
          }
        });

      if (options?.multiSelect) {
        picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
      }

      picker.build().setVisible(true);
    });
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string): Promise<GoogleDriveFile | null> {
    if (!this.isSignedIn()) return null;

    try {
      const response = await window.gapi.client.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink,parents,starred,trashed,capabilities',
      });

      return response.result as GoogleDriveFile;
    } catch (error) {
      console.error('Error fetching file metadata:', error);
      return null;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Blob | null> {
    if (!this.isSignedIn()) return null;

    try {
      // Get file metadata first
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) return null;

      // Check if it's a Google Docs file (needs export)
      const isGoogleDoc = metadata.mimeType.startsWith('application/vnd.google-apps.');
      
      let response;
      if (isGoogleDoc) {
        // Export Google Docs files to appropriate format
        const exportMimeType = this.getExportMimeType(metadata.mimeType);
        response = await window.gapi.client.drive.files.export({
          fileId,
          mimeType: exportMimeType,
        });
      } else {
        // Download regular files
        response = await window.gapi.client.drive.files.get({
          fileId,
          alt: 'media',
        });
      }

      // Convert response to blob
      const blob = new Blob([response.body], { type: metadata.mimeType });
      return blob;
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  /**
   * Download file using direct URL (for non-Google Docs files)
   */
  async downloadFileByUrl(fileId: string, fileName: string): Promise<File | null> {
    if (!this.isSignedIn()) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.oauthToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Error downloading file by URL:', error);
      return null;
    }
  }

  /**
   * List files from Google Drive
   */
  async listFiles(options?: {
    pageSize?: number;
    pageToken?: string;
    query?: string;
    orderBy?: string;
  }): Promise<{
    files: GoogleDriveFile[];
    nextPageToken?: string;
  }> {
    if (!this.isSignedIn()) return { files: [] };

    try {
      const response = await window.gapi.client.drive.files.list({
        pageSize: options?.pageSize || 20,
        pageToken: options?.pageToken,
        q: options?.query || "trashed = false",
        orderBy: options?.orderBy || 'modifiedTime desc',
        fields: 'nextPageToken, files(id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink,iconLink)',
      });

      return {
        files: response.result.files || [],
        nextPageToken: response.result.nextPageToken,
      };
    } catch (error) {
      console.error('Error listing files:', error);
      return { files: [] };
    }
  }

  /**
   * Search files in Google Drive
   */
  async searchFiles(query: string): Promise<GoogleDriveFile[]> {
    const result = await this.listFiles({
      query: `name contains '${query}' and trashed = false`,
      pageSize: 50,
    });
    return result.files;
  }

  /**
   * Get appropriate export mime type for Google Docs
   */
  private getExportMimeType(googleMimeType: string): string {
    const exportMap: Record<string, string> = {
      'application/vnd.google-apps.document': 'application/pdf',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/pdf',
      'application/vnd.google-apps.drawing': 'image/png',
    };

    return exportMap[googleMimeType] || 'application/pdf';
  }

  /**
   * Convert Google Drive file to standard File object
   */
  async convertToFile(driveFile: GoogleDriveFile): Promise<File | null> {
    const blob = await this.downloadFile(driveFile.id);
    if (!blob) return null;

    // Determine file extension based on mime type
    const extension = this.getFileExtension(driveFile.mimeType);
    const fileName = driveFile.name.includes('.') 
      ? driveFile.name 
      : `${driveFile.name}${extension}`;

    return new File([blob], fileName, { 
      type: blob.type,
      lastModified: new Date(driveFile.modifiedTime).getTime(),
    });
  }

  /**
   * Get file extension from mime type
   */
  private getFileExtension(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'text/plain': '.txt',
      // Google Docs formats
      'application/vnd.google-apps.document': '.pdf',
      'application/vnd.google-apps.spreadsheet': '.xlsx',
      'application/vnd.google-apps.presentation': '.pdf',
    };

    return extensionMap[mimeType] || '';
  }
}

// Declare Google API types
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export default GoogleDriveService;