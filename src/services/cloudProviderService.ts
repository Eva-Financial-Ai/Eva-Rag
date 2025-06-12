import { debugLog } from '../utils/auditLogger';

// Cloud Provider Integration Service
// Handles authentication and file operations for Google Drive, OneDrive, Dropbox, and iCloud

export interface CloudProviderConfig {
  googleDrive?: {
    clientId: string;
    apiKey: string;
    discoveryDocs: string[];
    scopes: string[];
  };
  oneDrive?: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
  dropbox?: {
    clientId: string;
    redirectUri: string;
  };
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modifiedTime: string;
  webViewLink?: string;
  downloadUrl?: string;
  thumbnailLink?: string;
  parents?: string[];
  provider: 'google-drive' | 'onedrive' | 'dropbox' | 'icloud';
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
}

class CloudProviderService {
  private static instance: CloudProviderService;
  private config: CloudProviderConfig;
  private tokens: Map<string, AuthToken> = new Map();
  private initialized: Map<string, boolean> = new Map();

  private constructor() {
    this.config = {
      googleDrive: {
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyDemoApiKey123456789',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.file'
        ]
      },
      oneDrive: {
        clientId: process.env.REACT_APP_ONEDRIVE_CLIENT_ID || 'demo-client-id-123',
        redirectUri: `${window.location.origin}/auth/callback/onedrive`,
        scopes: [
          'openid',
          'profile',
          'Files.Read',
          'Files.Read.All',
          'Files.ReadWrite',
          'Files.ReadWrite.All'
        ]
      },
      dropbox: {
        clientId: process.env.REACT_APP_DROPBOX_CLIENT_ID || 'demo-dropbox-client',
        redirectUri: `${window.location.origin}/auth/callback/dropbox`
      }
    };
  }

  public static getInstance(): CloudProviderService {
    if (!CloudProviderService.instance) {
      CloudProviderService.instance = new CloudProviderService();
    }
    return CloudProviderService.instance;
  }

  // Google Drive Integration
  async initializeGoogleDrive(): Promise<boolean> {
    if (this.initialized.get('google-drive')) {
      return true;
    }

    return new Promise((resolve) => {
      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.googleDrive!.apiKey,
              clientId: this.config.googleDrive!.clientId,
              discoveryDocs: this.config.googleDrive!.discoveryDocs,
              scope: this.config.googleDrive!.scopes.join(' ')
            });
            this.initialized.set('google-drive', true);
            resolve(true);
          } catch (error) {
            console.error('Error initializing Google Drive:', error);
            resolve(false);
          }
        });
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async authenticateGoogleDrive(): Promise<boolean> {
    try {
      await this.initializeGoogleDrive();
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        const user = authInstance.currentUser.get();
        const authResponse = user.getAuthResponse();
        this.tokens.set('google-drive', {
          accessToken: authResponse.access_token,
          expiresIn: authResponse.expires_in,
          tokenType: 'Bearer',
          scope: authResponse.scope
        });
        return true;
      }

      // Sign in
      const user = await authInstance.signIn();
      const authResponse = user.getAuthResponse();
      this.tokens.set('google-drive', {
        accessToken: authResponse.access_token,
        expiresIn: authResponse.expires_in,
        tokenType: 'Bearer',
        scope: authResponse.scope
      });
      return true;
    } catch (error) {
      console.error('Google Drive authentication error:', error);
      return false;
    }
  }

  async listGoogleDriveFiles(folderId?: string, pageToken?: string): Promise<{
    files: CloudFile[];
    nextPageToken?: string;
  }> {
    try {
      const query = folderId ? `'${folderId}' in parents` : "'root' in parents";
      
      const response = await window.gapi.client.drive.files.list({
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, thumbnailLink, parents)',
        pageSize: 100,
        pageToken: pageToken
      });

      const files: CloudFile[] = response.result.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: file.mimeType,
        size: parseInt(file.size) || 0,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink,
        parents: file.parents,
        provider: 'google-drive' as const
      }));

      return {
        files,
        nextPageToken: response.result.nextPageToken
      };
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      return { files: [] };
    }
  }

  async downloadGoogleDriveFile(fileId: string): Promise<Blob | null> {
    try {
      const token = this.tokens.get('google-drive');
      if (!token) {
        throw new Error('Not authenticated with Google Drive');
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading Google Drive file:', error);
      return null;
    }
  }

  // OneDrive Integration
  async authenticateOneDrive(): Promise<boolean> {
    try {
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.append('client_id', this.config.oneDrive!.clientId);
      authUrl.searchParams.append('response_type', 'token');
      authUrl.searchParams.append('redirect_uri', this.config.oneDrive!.redirectUri);
      authUrl.searchParams.append('scope', this.config.oneDrive!.scopes.join(' '));
      authUrl.searchParams.append('response_mode', 'fragment');

      // Open popup window for authentication
      const authWindow = window.open(
        authUrl.toString(),
        'onedrive-auth',
        'width=500,height=700,toolbar=no,menubar=no'
      );

      return new Promise((resolve) => {
        // Listen for message from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'onedrive-auth-success') {
            this.tokens.set('onedrive', {
              accessToken: event.data.accessToken,
              expiresIn: event.data.expiresIn,
              tokenType: 'Bearer'
            });
            window.removeEventListener('message', handleMessage);
            authWindow?.close();
            resolve(true);
          } else if (event.data.type === 'onedrive-auth-error') {
            window.removeEventListener('message', handleMessage);
            authWindow?.close();
            resolve(false);
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was blocked
        if (!authWindow || authWindow.closed) {
          window.removeEventListener('message', handleMessage);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('OneDrive authentication error:', error);
      return false;
    }
  }

  async listOneDriveFiles(folderId?: string): Promise<{
    files: CloudFile[];
    nextLink?: string;
  }> {
    try {
      const token = this.tokens.get('onedrive');
      if (!token) {
        throw new Error('Not authenticated with OneDrive');
      }

      const endpoint = folderId 
        ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`
        : 'https://graph.microsoft.com/v1.0/me/drive/root/children';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to list OneDrive files');
      }

      const data = await response.json();
      const files: CloudFile[] = data.value.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.folder ? 'folder' : 'file',
        mimeType: file.file?.mimeType,
        size: file.size || 0,
        modifiedTime: file.lastModifiedDateTime,
        webViewLink: file.webUrl,
        downloadUrl: file['@microsoft.graph.downloadUrl'],
        thumbnailLink: file.thumbnails?.[0]?.medium?.url,
        parents: file.parentReference ? [file.parentReference.id] : [],
        provider: 'onedrive' as const
      }));

      return {
        files,
        nextLink: data['@odata.nextLink']
      };
    } catch (error) {
      console.error('Error listing OneDrive files:', error);
      return { files: [] };
    }
  }

  async downloadOneDriveFile(fileId: string): Promise<Blob | null> {
    try {
      const token = this.tokens.get('onedrive');
      if (!token) {
        throw new Error('Not authenticated with OneDrive');
      }

      // First get the download URL
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get file info');
      }

      const fileInfo = await response.json();
      const downloadUrl = fileInfo['@microsoft.graph.downloadUrl'];

      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      // Download the file
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
      }

      return await fileResponse.blob();
    } catch (error) {
      console.error('Error downloading OneDrive file:', error);
      return null;
    }
  }

  // Dropbox Integration (placeholder)
  async authenticateDropbox(): Promise<boolean> {
    // Implement Dropbox OAuth flow
    debugLog('general', 'log_statement', 'Dropbox authentication not yet implemented')
    return false;
  }

  async listDropboxFiles(path?: string): Promise<{ files: CloudFile[] }> {
    // Implement Dropbox file listing
    return { files: [] };
  }

  // Generic methods
  async authenticate(provider: 'google-drive' | 'onedrive' | 'dropbox'): Promise<boolean> {
    switch (provider) {
      case 'google-drive':
        return this.authenticateGoogleDrive();
      case 'onedrive':
        return this.authenticateOneDrive();
      case 'dropbox':
        return this.authenticateDropbox();
      default:
        return false;
    }
  }

  async listFiles(
    provider: 'google-drive' | 'onedrive' | 'dropbox',
    folderId?: string
  ): Promise<{ files: CloudFile[]; nextPageToken?: string }> {
    switch (provider) {
      case 'google-drive':
        return this.listGoogleDriveFiles(folderId);
      case 'onedrive':
        const oneDriveResult = await this.listOneDriveFiles(folderId);
        return { files: oneDriveResult.files, nextPageToken: oneDriveResult.nextLink };
      case 'dropbox':
        return this.listDropboxFiles(folderId);
      default:
        return { files: [] };
    }
  }

  async downloadFile(
    provider: 'google-drive' | 'onedrive' | 'dropbox',
    fileId: string
  ): Promise<Blob | null> {
    switch (provider) {
      case 'google-drive':
        return this.downloadGoogleDriveFile(fileId);
      case 'onedrive':
        return this.downloadOneDriveFile(fileId);
      case 'dropbox':
        // Implement Dropbox download
        return null;
      default:
        return null;
    }
  }

  isAuthenticated(provider: 'google-drive' | 'onedrive' | 'dropbox'): boolean {
    return this.tokens.has(provider);
  }

  async signOut(provider: 'google-drive' | 'onedrive' | 'dropbox'): Promise<void> {
    this.tokens.delete(provider);
    
    if (provider === 'google-drive' && window.gapi?.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    }
  }
}

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export default CloudProviderService;