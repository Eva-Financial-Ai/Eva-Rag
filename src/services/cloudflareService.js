import { debugLog } from '../utils/auditLogger';
import { logger } from '../utils/logger';

// EVA AI Cloudflare Service Integration
// Handles all interactions with Cloudflare Workers, R2, KV, D1, Analytics, and Queues

class CloudflareService {
  constructor() {
    this.baseURL = process.env.REACT_APP_WORKER_URL || 'https://eva-data-sync.evafi.workers.dev';
    this.apiKey = process.env.REACT_APP_API_KEY;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Generic API call with retry logic
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        return response;
      } catch (error) {
        logger.error(`API call attempt ${attempt} failed:`, error);

        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Database Synchronization
  async syncToDatabase(table, operation, data) {
    try {
      const result = await this.apiCall('/api/sync/database', {
        method: 'POST',
        body: JSON.stringify({ table, operation, data }),
      });

      debugLog('general', 'log_statement', `Database sync successful for ${table}:`, result)
      return result;
    } catch (error) {
      logger.error('Database sync failed:', error);
      throw error;
    }
  }

  // File Upload to R2
  async uploadFile(file, userId, documentType, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentType', documentType);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            debugLog('general', 'log_statement', 'File upload successful:', response)
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${this.baseURL}/api/storage/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${this.apiKey}`);
        xhr.send(formData);
      });
    } catch (error) {
      logger.error('File upload failed:', error);
      throw error;
    }
  }

  // File Retrieval from R2
  async retrieveFile(filename, userId) {
    try {
      const response = await this.apiCall(
        `/api/storage/retrieve?filename=${encodeURIComponent(filename)}&userId=${userId}`,
        { method: 'GET' }
      );

      debugLog('general', 'log_statement', 'File retrieval successful:', filename)
      return response;
    } catch (error) {
      logger.error('File retrieval failed:', error);
      throw error;
    }
  }

  // Cache Operations
  async getFromCache(key) {
    try {
      const result = await this.apiCall(`/api/cache/get?key=${encodeURIComponent(key)}`, {
        method: 'GET',
      });

      return result.value;
    } catch (error) {
      logger.error('Cache get failed:', error);
      return null;
    }
  }

  async setCache(key, value, ttl = 3600) {
    try {
      const result = await this.apiCall('/api/cache/set', {
        method: 'POST',
        body: JSON.stringify({ key, value, ttl }),
      });

      debugLog('general', 'log_statement', 'Cache set successful:', key)
      return result;
    } catch (error) {
      logger.error('Cache set failed:', error);
      throw error;
    }
  }

  // Analytics Tracking
  async trackEvent(event, userId, metadata = {}, value = 0) {
    try {
      const result = await this.apiCall('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ event, userId, metadata, value }),
      });

      debugLog('general', 'log_statement', 'Analytics event tracked:', event)
      return result;
    } catch (error) {
      logger.error('Analytics tracking failed:', error);
      // Don't throw error for analytics to avoid breaking user flow
    }
  }

  // Queue Processing
  async queueTask(type, data) {
    try {
      const result = await this.apiCall('/api/queue/process', {
        method: 'POST',
        body: JSON.stringify({ type, data }),
      });

      debugLog('general', 'log_statement', 'Task queued successfully:', type)
      return result;
    } catch (error) {
      logger.error('Queue processing failed:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const result = await this.apiCall('/api/health', { method: 'GET' });
      debugLog('general', 'log_statement', 'Health check result:', result)
      return result;
    } catch (error) {
      logger.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // User Management
  async createUser(userData) {
    try {
      // Sync to database
      await this.syncToDatabase('users', 'create', userData);

      // Cache user data
      await this.setCache(`user:${userData.id}`, userData, 7200); // 2 hours

      // Track user creation
      await this.trackEvent('user_created', userData.id, {
        userType: userData.user_type,
        registrationMethod: userData.registration_method,
      });

      return { success: true, userId: userData.id };
    } catch (error) {
      logger.error('User creation failed:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      // Try cache first
      let userData = await this.getFromCache(`user:${userId}`);

      if (!userData) {
        // Fallback to database query (would need to implement)
        debugLog('general', 'log_statement', 'User not in cache, fetching from database...')
        // This would typically call a database query endpoint
      }

      return userData;
    } catch (error) {
      logger.error('Get user failed:', error);
      throw error;
    }
  }

  // Credit Application Management
  async submitCreditApplication(applicationData) {
    try {
      // Sync to database
      await this.syncToDatabase('credit_applications', 'create', applicationData);

      // Queue for processing
      await this.queueTask('credit_application', {
        applicationId: applicationData.id,
        userId: applicationData.user_id,
        amount: applicationData.amount,
      });

      // Track submission
      await this.trackEvent(
        'credit_application_submitted',
        applicationData.user_id,
        {
          amount: applicationData.amount,
          businessType: applicationData.business_type,
        },
        applicationData.amount
      );

      return { success: true, applicationId: applicationData.id };
    } catch (error) {
      logger.error('Credit application submission failed:', error);
      throw error;
    }
  }

  // Document Management
  async uploadDocument(file, userId, documentType, applicationId = null) {
    try {
      // Upload file to R2
      const uploadResult = await this.uploadFile(file, userId, documentType);

      // Create document record
      const documentData = {
        id: this.generateId(),
        filename: uploadResult.filename,
        user_id: userId,
        application_id: applicationId,
        document_type: documentType,
        file_size: file.size,
        content_type: file.type,
        uploaded_at: new Date().toISOString(),
        status: 'uploaded',
      };

      // Sync to database
      await this.syncToDatabase('documents', 'create', documentData);

      // Track upload
      await this.trackEvent(
        'document_uploaded',
        userId,
        {
          documentType,
          fileSize: file.size,
          applicationId,
        },
        file.size
      );

      return { success: true, document: documentData, url: uploadResult.url };
    } catch (error) {
      logger.error('Document upload failed:', error);
      throw error;
    }
  }

  // Transaction Management
  async createTransaction(transactionData) {
    try {
      // Sync to database
      await this.syncToDatabase('transactions', 'create', transactionData);

      // Cache recent transaction
      await this.setCache(`transaction:${transactionData.id}`, transactionData, 1800); // 30 minutes

      // Track transaction
      await this.trackEvent(
        'transaction_created',
        transactionData.user_id,
        {
          type: transactionData.type,
          status: transactionData.status,
        },
        transactionData.amount
      );

      return { success: true, transactionId: transactionData.id };
    } catch (error) {
      logger.error('Transaction creation failed:', error);
      throw error;
    }
  }

  // Chat Session Management
  async createChatSession(userId, sessionData) {
    try {
      const chatSession = {
        id: this.generateId(),
        user_id: userId,
        session_name: sessionData.name || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        ...sessionData,
      };

      // Sync to database
      await this.syncToDatabase('chat_sessions', 'create', chatSession);

      // Cache session
      await this.setCache(`chat_session:${chatSession.id}`, chatSession, 3600);

      // Track session creation
      await this.trackEvent('chat_session_created', userId, {
        sessionName: chatSession.session_name,
      });

      return { success: true, session: chatSession };
    } catch (error) {
      logger.error('Chat session creation failed:', error);
      throw error;
    }
  }

  async saveChatMessage(sessionId, messageData) {
    try {
      const message = {
        id: this.generateId(),
        session_id: sessionId,
        content: messageData.content,
        role: messageData.role, // 'user' or 'assistant'
        timestamp: new Date().toISOString(),
        ...messageData,
      };

      // Sync to database
      await this.syncToDatabase('chat_messages', 'create', message);

      // Update session cache
      const session = await this.getFromCache(`chat_session:${sessionId}`);
      if (session) {
        session.updated_at = new Date().toISOString();
        session.last_message = message.content;
        await this.setCache(`chat_session:${sessionId}`, session, 3600);
      }

      // Track message
      await this.trackEvent('chat_message_sent', session?.user_id, {
        sessionId,
        role: message.role,
        messageLength: message.content.length,
      });

      return { success: true, message };
    } catch (error) {
      logger.error('Chat message save failed:', error);
      throw error;
    }
  }

  // Storage Lock Management
  async createStorageLock(userId, lockData) {
    try {
      const storageLock = {
        id: this.generateId(),
        user_id: userId,
        asset_type: lockData.assetType,
        lock_amount: lockData.amount,
        lock_duration: lockData.duration,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + lockData.duration * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        ...lockData,
      };

      // Sync to database
      await this.syncToDatabase('storage_locks', 'create', storageLock);

      // Track lock creation
      await this.trackEvent(
        'storage_lock_created',
        userId,
        {
          assetType: storageLock.asset_type,
          duration: storageLock.lock_duration,
        },
        storageLock.lock_amount
      );

      return { success: true, lock: storageLock };
    } catch (error) {
      logger.error('Storage lock creation failed:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getUserAnalytics(userId, timeframe = '7d') {
    try {
      // Get recent analytics from KV
      const recentData = await this.getFromCache(`analytics:${userId}:recent`);

      // Track analytics request
      await this.trackEvent('analytics_requested', userId, { timeframe });

      return {
        success: true,
        data: recentData || [],
        timeframe,
      };
    } catch (error) {
      logger.error('Get user analytics failed:', error);
      throw error;
    }
  }

  // Utility Functions
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Batch Operations
  async batchSync(operations) {
    const results = [];

    for (const operation of operations) {
      try {
        const result = await this.syncToDatabase(
          operation.table,
          operation.operation,
          operation.data
        );
        results.push({ success: true, operation, result });
      } catch (error) {
        results.push({ success: false, operation, error: error.message });
      }
    }

    return results;
  }

  // Real-time Status Updates
  async getSystemStatus() {
    try {
      const health = await this.healthCheck();
      const timestamp = new Date().toISOString();

      return {
        status: health.status,
        services: health.checks,
        timestamp,
        uptime: health.uptime || 'unknown',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Performance Monitoring
  async trackPerformance(operation, duration, success = true) {
    try {
      await this.trackEvent(
        'performance_metric',
        'system',
        {
          operation,
          success,
          duration,
        },
        duration
      );
    } catch (error) {
      logger.error('Performance tracking failed:', error);
    }
  }
}

// Create singleton instance
const cloudflareService = new CloudflareService();

// Export service and individual methods for convenience
export default cloudflareService;

export const {
  syncToDatabase,
  uploadFile,
  retrieveFile,
  getFromCache,
  setCache,
  trackEvent,
  queueTask,
  healthCheck,
  createUser,
  getUser,
  submitCreditApplication,
  uploadDocument,
  createTransaction,
  createChatSession,
  saveChatMessage,
  createStorageLock,
  getUserAnalytics,
  getSystemStatus,
  trackPerformance,
} = cloudflareService;
