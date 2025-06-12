/**
 * API functions for handling electronic signature notifications
 * Integrates with Cloudflare notification worker for SMS and email delivery
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://notifications.eva-platform.com';

export interface SignatureRequestPayload {
  type: 'signature_request';
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  documentId: string;
  documentTitle: string;
  transactionId: string;
  signatureUrl: string;
  smsConsent?: boolean;
  timestamp: string;
}

export interface SignatureCompletePayload {
  type: 'signature_completed';
  signatureData: {
    id: string;
    signerId: string;
    signerName: string;
    signerRole: string;
    signatureDataUrl: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    geoLocation?: {
      latitude: number;
      longitude: number;
    };
    complianceAcknowledgments: Record<string, boolean>;
    phoneNumber?: string;
    smsConsent?: boolean;
    signerEmail?: string;
  };
  documentId: string;
  documentTitle: string;
  transactionId: string;
  remainingSignatures?: number;
  timestamp: string;
}

export interface NotificationResponse {
  success: boolean;
  emailSent: boolean;
  smsSent: boolean;
  requestId?: string;
  error?: string;
}

/**
 * Send signature request notification
 */
export const sendSignatureRequest = async (payload: SignatureRequestPayload): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/signature-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending signature request:', error);
    return {
      success: false,
      emailSent: false,
      smsSent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send signature completion notification
 */
export const sendSignatureComplete = async (payload: SignatureCompletePayload): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/signature-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending signature completion notification:', error);
    return {
      success: false,
      emailSent: false,
      smsSent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send signature reminder notification
 */
export const sendSignatureReminder = async (payload: Omit<SignatureRequestPayload, 'type'> & { reminderType: '24h' | '72h' | 'final' }): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/signature-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        type: 'signature_reminder',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending signature reminder:', error);
    return {
      success: false,
      emailSent: false,
      smsSent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get notification status for a transaction
 */
export const getNotificationStatus = async (transactionId: string): Promise<{
  success: boolean;
  notifications: Array<{
    id: string;
    type: string;
    recipient: string;
    status: string;
    timestamp: string;
    deliveryStatus?: string;
  }>;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting notification status:', error);
    return {
      success: false,
      notifications: [],
    };
  }
};

/**
 * Check if phone number has opted out of SMS
 */
export const checkSMSOptOut = async (phoneNumber: string): Promise<{
  success: boolean;
  optedOut: boolean;
  optOutDate?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/sms-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking SMS opt-out status:', error);
    return {
      success: false,
      optedOut: false,
    };
  }
};

/**
 * Test notification system connectivity
 */
export const testNotificationSystem = async (): Promise<{
  success: boolean;
  services: {
    email: boolean;
    sms: boolean;
    database: boolean;
    queue: boolean;
  };
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Simple health check - just verify the worker is responding
    return {
      success: true,
      services: {
        email: true,
        sms: true,
        database: true,
        queue: true,
      },
    };
  } catch (error) {
    console.error('Error testing notification system:', error);
    return {
      success: false,
      services: {
        email: false,
        sms: false,
        database: false,
        queue: false,
      },
    };
  }
};

const notificationsApi = {
  sendSignatureRequest,
  sendSignatureComplete,
  sendSignatureReminder,
  getNotificationStatus,
  checkSMSOptOut,
  testNotificationSystem,
};

export default notificationsApi; 