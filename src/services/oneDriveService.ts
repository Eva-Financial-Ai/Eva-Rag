/**
 * OneDrive Integration Service
 *
 * Provides integration with Microsoft OneDrive for document upload and management
 * within the FileLock and Shield Vault systems.
 */

import { PublicClientApplication } from '@azure/msal-browser';

import { debugLog } from '../utils/auditLogger';

// OneDrive/Microsoft Graph API configuration
const ONEDRIVE_CONFIG = {
  clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: window.location.origin,
  scopes: ['user.read', 'files.read', 'files.read.all', 'files.read.selected'],
};

// OneDrive file interface
export interface OneDriveFile {
  id: string;
  name: string;
  size?: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  webUrl?: string;
  '@microsoft.graph.downloadUrl'?: string;
  file?: {
    mimeType: string;
    hashes?: {
      quickXorHash?: string;
      sha1Hash?: string;
      sha256Hash?: string;
    };
  };
  folder?: {
    childCount: number;
  };
  parentReference?: {
    id: string;
    path: string;
  };
  shared?: {
    scope: string;
    sharedDateTime: string;
  };
}

// OneDrive picker result
export interface OneDrivePickerResult {
  action: string;
  files: Array<{
    id: string;
    name: string;
    size?: number;
    mimeType?: string;
    webUrl?: string;
    downloadUrl?: string;
    thumbnails?: Array<{
      id: string;
      large?: { url: string };
      medium?: { url: string };
      small?: { url: string };
    }>;
  }>;
}

export class OneDriveService {
  private static instance: OneDriveService;
  private msalInstance: PublicClientApplication;
  private accessToken: string | null = null;
  private account: any = null;

  private constructor() {
    // Initialize MSAL
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: ONEDRIVE_CONFIG.clientId,
        authority: ONEDRIVE_CONFIG.authority,
        redirectUri: ONEDRIVE_CONFIG.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true,
      },
    });
  }

  static getInstance(): OneDriveService {
    if (!OneDriveService.instance) {
      OneDriveService.instance = new OneDriveService();
    }
    return OneDriveService.instance;
  }

  /**
   * Initialize OneDrive service
   */
  async initialize(): Promise<void> {
    try {
      // Handle redirect response if returning from auth
      await this.msalInstance.handleRedirectPromise();

      // Check if user is already signed in
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.account = accounts[0];
        await this.acquireToken();
      }
    } catch (error) {
      console.error('Error initializing OneDrive service:', error);
    }
  }

  /**
   * Sign in to Microsoft/OneDrive
   */
  async signIn(): Promise<boolean> {
    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ONEDRIVE_CONFIG.scopes,
      });

      if (loginResponse.account) {
        this.account = loginResponse.account;
        this.accessToken = loginResponse.accessToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('OneDrive sign-in failed:', error);
      return false;
    }
  }

  /**
   * Sign out from OneDrive
   */
  async signOut(): Promise<void> {
    if (this.account) {
      await this.msalInstance.logoutPopup({
        account: this.account,
      });
      this.account = null;
      this.accessToken = null;
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.account !== null;
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): any {
    if (!this.account) return null;

    return {
      id: this.account.homeAccountId,
      name: this.account.name,
      email: this.account.username,
    };
  }

  /**
   * Acquire access token
   */
  private async acquireToken(): Promise<string | null> {
    if (!this.account) return null;

    try {
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        scopes: ONEDRIVE_CONFIG.scopes,
        account: this.account,
      });

      this.accessToken = tokenResponse.accessToken;
      return this.accessToken;
    } catch (error) {
      // If silent token acquisition fails, use popup
      try {
        const tokenResponse = await this.msalInstance.acquireTokenPopup({
          scopes: ONEDRIVE_CONFIG.scopes,
          account: this.account,
        });

        this.accessToken = tokenResponse.accessToken;
        return this.accessToken;
      } catch (popupError) {
        console.error('Failed to acquire token:', popupError);
        return null;
      }
    }
  }

  /**
   * Show OneDrive file picker
   */
  async showPicker(options?: {
    multiSelect?: boolean;
    fileTypes?: string[];
    viewType?: 'files' | 'folders' | 'all';
  }): Promise<OneDrivePickerResult | null> {
    if (!this.isSignedIn()) {
      const signedIn = await this.signIn();
      if (!signedIn) return null;
    }

    // Ensure we have a valid token
    const token = await this.acquireToken();
    if (!token) return null;

    return new Promise(resolve => {
      const pickerOptions = {
        clientId: ONEDRIVE_CONFIG.clientId,
        action: options?.multiSelect ? 'share' : 'download',
        multiSelect: options?.multiSelect || false,
        openInNewWindow: true,
        advanced: {
          redirectUri: ONEDRIVE_CONFIG.redirectUri,
          endpointHint: 'api.onedrive.com',
          accessToken: token,
          isConsumerAccount: false,
        },
        success: (files: any) => {
          const result: OneDrivePickerResult = {
            action: 'picked',
            files: files.value.map((file: any) => ({
              id: file.id,
              name: file.name,
              size: file.size,
              mimeType: file.file?.mimeType,
              webUrl: file.webUrl,
              downloadUrl: file['@microsoft.graph.downloadUrl'],
              thumbnails: file.thumbnails,
            })),
          };
          resolve(result);
        },
        cancel: () => {
          resolve(null);
        },
        error: (error: any) => {
          console.error('OneDrive picker error:', error);
          resolve(null);
        },
      };

      // Filter by file types if specified
      if (options?.fileTypes && options.fileTypes.length > 0) {
        // pickerOptions.advanced.filter = options.fileTypes.join(','); // OneDrive picker doesn't support this property
        debugLog('general', 'log_statement', 'File type filtering requested:', options.fileTypes)
      }

      // Launch the picker
      window.OneDrive.open(pickerOptions);
    });
  }

  /**
   * Get file metadata from OneDrive
   */
  async getFileMetadata(fileId: string): Promise<OneDriveFile | null> {
    const token = await this.acquireToken();
    if (!token) return null;

    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch file metadata');

      const data = await response.json() as { value: any[] };
      return data.value[0] as OneDriveFile;
    } catch (error) {
      console.error('Error fetching file metadata:', error);
      return null;
    }
  }

  /**
   * Download file from OneDrive
   */
  async downloadFile(fileId: string): Promise<Blob | null> {
    const token = await this.acquireToken();
    if (!token) return null;

    try {
      // First get the download URL
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata || !metadata['@microsoft.graph.downloadUrl']) {
        throw new Error('Download URL not available');
      }

      // Download the file
      const response = await fetch(metadata['@microsoft.graph.downloadUrl']);
      if (!response.ok) throw new Error('Download failed');

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  /**
   * List files from OneDrive
   */
  async listFiles(options?: {
    folderId?: string;
    pageSize?: number;
    skipToken?: string;
    orderBy?: string;
    filter?: string;
  }): Promise<{
    files: OneDriveFile[];
    nextLink?: string;
  }> {
    const token = await this.acquireToken();
    if (!token) return { files: [] };

    try {
      let url = 'https://graph.microsoft.com/v1.0/me/drive/root/children';

      if (options?.folderId) {
        url = `https://graph.microsoft.com/v1.0/me/drive/items/${options.folderId}/children`;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (options?.pageSize) params.append('$top', options.pageSize.toString());
      if (options?.skipToken) params.append('$skiptoken', options.skipToken);
      if (options?.orderBy) params.append('$orderby', options.orderBy);
      if (options?.filter) params.append('$filter', options.filter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to list files');

      const data = await response.json() as { value: any[] };
      return {
        files: data.value || [],
        nextLink: data['@odata.nextLink'],
      };
    } catch (error) {
      console.error('Error listing files:', error);
      return { files: [] };
    }
  }

  /**
   * Search files in OneDrive
   */
  async searchFiles(query: string): Promise<OneDriveFile[]> {
    const token = await this.acquireToken();
    if (!token) return [];

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/search(q='${encodeURIComponent(query)}')?$top=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json() as { value: any[] };
      return data.value || [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  /**
   * Convert OneDrive file to standard File object
   */
  async convertToFile(driveFile: OneDriveFile): Promise<File | null> {
    const blob = await this.downloadFile(driveFile.id);
    if (!blob) return null;

    const mimeType = driveFile.file?.mimeType || 'application/octet-stream';

    return new File([blob], driveFile.name, {
      type: mimeType,
      lastModified: new Date(driveFile.lastModifiedDateTime).getTime(),
    });
  }

  /**
   * Load OneDrive picker SDK
   */
  static async loadPickerSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.OneDrive) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}

// Declare OneDrive types
declare global {
  interface Window {
    OneDrive: any;
  }
}

export default OneDriveService;
