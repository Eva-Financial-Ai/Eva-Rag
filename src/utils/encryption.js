// Financial Data Encryption Utility
// Implements Tier 1 security requirements for PII protection
// Encrypts SSN, Tax ID, bank account numbers, and other sensitive financial data

import CryptoJS from 'crypto-js';

import { debugLog } from './auditLogger';

class FinancialDataEncryption {
  constructor() {
    // Use environment-specific encryption key
    this.encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || this.generateFallbackKey();
    this.algorithm = 'AES';
    
    // PII field patterns for automatic detection
    this.piiPatterns = {
      ssn: /^\d{3}-?\d{2}-?\d{4}$/,
      taxId: /^\d{2}-?\d{7}$/,
      bankAccount: /^\d{8,17}$/,
      routingNumber: /^\d{9}$/,
      creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/
    };
    
    // Fields that always require encryption
    this.sensitiveFields = [
      'ssn', 'socialSecurityNumber', 'taxId', 'bankAccountNumber',
      'routingNumber', 'creditCardNumber', 'bankAccount', 'accountNumber',
      'drivingLicenseNumber', 'passportNumber', 'mothersMaidenName'
    ];
  }

  generateFallbackKey() {
    // Generate a key from app constants (not recommended for production)
    // Note: Using fallback encryption key - configure REACT_APP_ENCRYPTION_KEY for production
    return CryptoJS.SHA256('evafi-financial-platform-2025').toString();
  }

  /**
   * Encrypt sensitive financial data
   * @param {string} data - The data to encrypt
   * @param {string} fieldName - Name of the field (for audit logging)
   * @returns {object} - Encrypted data with metadata
   */
  encrypt(data, fieldName = 'unknown') {
    if (!data || typeof data !== 'string') {
      return { encrypted: data, isEncrypted: false, error: 'Invalid data type' };
    }

    try {
      // Check if data appears to be PII
      const isPII = this.isPIIData(data, fieldName);
      
      if (!isPII && !this.sensitiveFields.includes(fieldName.toLowerCase())) {
        return { encrypted: data, isEncrypted: false, reason: 'Non-sensitive data' };
      }

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
      
      // Create metadata for audit trail
      const metadata = {
        encrypted: encrypted,
        isEncrypted: true,
        fieldName,
        encryptedAt: new Date().toISOString(),
        algorithm: this.algorithm,
        keyVersion: '1.0' // For key rotation tracking
      };

      // Log encryption event for audit trail
      this.logEncryptionEvent('ENCRYPT', fieldName, metadata.encryptedAt);

      return metadata;
    } catch (error) {
      // Encryption failed
      return { 
        encrypted: data, 
        isEncrypted: false, 
        error: 'Encryption failed',
        errorDetails: error.message 
      };
    }
  }

  /**
   * Decrypt sensitive financial data
   * @param {string|object} encryptedData - The encrypted data or metadata object
   * @param {string} fieldName - Name of the field (for audit logging)
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedData, fieldName = 'unknown') {
    try {
      // Handle both direct encrypted strings and metadata objects
      const dataToDecrypt = typeof encryptedData === 'object' && encryptedData.encrypted 
        ? encryptedData.encrypted 
        : encryptedData;

      if (!dataToDecrypt || typeof dataToDecrypt !== 'string') {
        return encryptedData;
      }

      // Attempt decryption
      const bytes = CryptoJS.AES.decrypt(dataToDecrypt, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        // Decryption failed - invalid key or corrupted data
        return '[DECRYPTION_FAILED]';
      }

      // Log decryption event for audit trail
      this.logEncryptionEvent('DECRYPT', fieldName, new Date().toISOString());

      return decrypted;
    } catch (error) {
      // Decryption error occurred
      return '[DECRYPTION_ERROR]';
    }
  }

  /**
   * Check if data appears to be PII based on patterns
   * @param {string} data - Data to check
   * @param {string} fieldName - Field name for context
   * @returns {boolean} - True if appears to be PII
   */
  isPIIData(data, fieldName) {
    // Check field name
    if (this.sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    )) {
      return true;
    }

    // Check data patterns
    for (const [type, pattern] of Object.entries(this.piiPatterns)) {
      if (pattern.test(data)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Encrypt an entire object, handling nested PII fields
   * @param {object} obj - Object to encrypt
   * @returns {object} - Object with encrypted PII fields
   */
  encryptObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj };
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const encrypted = this.encrypt(value, key);
        if (encrypted.isEncrypted) {
          result[key] = encrypted;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.encryptObject(value);
      }
    }

    return result;
  }

  /**
   * Decrypt an entire object, handling nested encrypted fields
   * @param {object} obj - Object to decrypt
   * @returns {object} - Object with decrypted fields
   */
  decryptObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj };
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && value.isEncrypted) {
        result[key] = this.decrypt(value, key);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.decryptObject(value);
      }
    }

    return result;
  }

  /**
   * Mask sensitive data for display purposes
   * @param {string} data - Data to mask
   * @param {string} type - Type of data (ssn, bankAccount, etc.)
   * @returns {string} - Masked data
   */
  maskSensitiveData(data, type = 'default') {
    if (!data) return data;

    const masks = {
      ssn: (d) => `***-**-${d.slice(-4)}`,
      bankAccount: (d) => `****${d.slice(-4)}`,
      creditCard: (d) => `****-****-****-${d.slice(-4)}`,
      default: (d) => `${d.slice(0, 2)}***${d.slice(-2)}`
    };

    const maskFunction = masks[type] || masks.default;
    return maskFunction(data);
  }

  /**
   * Log encryption/decryption events for audit trail
   * @param {string} action - ENCRYPT or DECRYPT
   * @param {string} fieldName - Field name
   * @param {string} timestamp - Event timestamp
   */
  logEncryptionEvent(action, fieldName, timestamp) {
    try {
      // In production, send to audit logging service
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/audit/encryption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            fieldName,
            timestamp,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: sessionStorage.getItem('sessionId') || 'unknown'
          })
        }).catch(error => {
          console.error('Failed to log encryption event:', error);
        });
      } else {
        // Development logging
        debugLog('general', 'log_statement', `[ENCRYPTION_AUDIT] ${action} - ${fieldName} at ${timestamp}`)
      }
    } catch (error) {
      console.error('Encryption audit logging failed:', error);
    }
  }

  /**
   * Validate encryption key strength
   * @returns {object} - Validation results
   */
  validateEncryptionKey() {
    const keyLength = this.encryptionKey.length;
    const minLength = 32; // Minimum for AES-256
    
    return {
      isValid: keyLength >= minLength,
      keyLength,
      minLength,
      recommendation: keyLength < minLength 
        ? 'Use a longer encryption key for better security'
        : 'Encryption key meets minimum requirements'
    };
  }
}

// Create singleton instance
export const financialEncryption = new FinancialDataEncryption();

// Export utilities for easy use
export const encryptPII = (data, fieldName) => financialEncryption.encrypt(data, fieldName);
export const decryptPII = (data, fieldName) => financialEncryption.decrypt(data, fieldName);
export const encryptObject = (obj) => financialEncryption.encryptObject(obj);
export const decryptObject = (obj) => financialEncryption.decryptObject(obj);
export const maskSensitiveData = (data, type) => financialEncryption.maskSensitiveData(data, type);

export default financialEncryption; 