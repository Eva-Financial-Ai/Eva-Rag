import { debugLog } from '../utils/auditLogger';

/**
 * Smart Matching Service
 * Handles all API operations for Smart Matching instruments and lender-borrower matching
 */

import {
  SmartMatchingInstrument,
  CustomerSmartMatchProfile,
  BorrowerMatchingProfile,
  MatchResult,
  MatchingRequest,
  MatchingResponse,
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
  ValidationResult,
  VALIDATION_CONSTANTS,
} from '../types/SmartMatchingTypes';

// API base URL - TODO: Move to environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class SmartMatchingService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication headers
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Customer Profile Management
  async getCustomerProfile(customerId?: string): Promise<CustomerSmartMatchProfile> {
    return this.request<CustomerSmartMatchProfile>(
      `/smart-matching/profile${customerId ? `/${customerId}` : ''}`
    );
  }

  async updateCustomerProfile(
    profile: Partial<CustomerSmartMatchProfile>
  ): Promise<CustomerSmartMatchProfile> {
    return this.request<CustomerSmartMatchProfile>('/smart-matching/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Instrument CRUD Operations
  async getInstruments(customerId?: string): Promise<SmartMatchingInstrument[]> {
    return this.request<SmartMatchingInstrument[]>(
      `/smart-matching/instruments${customerId ? `?customerId=${customerId}` : ''}`
    );
  }

  async getInstrument(instrumentId: string): Promise<SmartMatchingInstrument> {
    return this.request<SmartMatchingInstrument>(`/smart-matching/instruments/${instrumentId}`);
  }

  async createInstrument(
    instrumentData: CreateInstrumentRequest
  ): Promise<SmartMatchingInstrument> {
    return this.request<SmartMatchingInstrument>('/smart-matching/instruments', {
      method: 'POST',
      body: JSON.stringify(instrumentData),
    });
  }

  async updateInstrument(
    instrumentId: string,
    instrumentData: UpdateInstrumentRequest
  ): Promise<SmartMatchingInstrument> {
    return this.request<SmartMatchingInstrument>(`/smart-matching/instruments/${instrumentId}`, {
      method: 'PUT',
      body: JSON.stringify(instrumentData),
    });
  }

  async deleteInstrument(instrumentId: string): Promise<void> {
    return this.request<void>(`/smart-matching/instruments/${instrumentId}`, {
      method: 'DELETE',
    });
  }

  async toggleInstrument(instrumentId: string): Promise<SmartMatchingInstrument> {
    return this.request<SmartMatchingInstrument>(
      `/smart-matching/instruments/${instrumentId}/toggle`,
      {
        method: 'PATCH',
      }
    );
  }

  async duplicateInstrument(
    instrumentId: string,
    newName: string
  ): Promise<SmartMatchingInstrument> {
    return this.request<SmartMatchingInstrument>(
      `/smart-matching/instruments/${instrumentId}/duplicate`,
      {
        method: 'POST',
        body: JSON.stringify({ instrumentName: newName }),
      }
    );
  }

  // Validation Functions
  validateInstrument(instrument: Partial<SmartMatchingInstrument>): ValidationResult {
    const errors: { [field: string]: string } = {};
    const warnings: { [field: string]: string } = {};

    // Basic validation
    if (!instrument.instrumentName?.trim()) {
      errors['instrumentName'] = 'Instrument name is required';
    }

    if (!instrument.instrumentType) {
      errors['instrumentType'] = 'Instrument type is required';
    }

    // Deal killers validation
    if (instrument.dealKillers) {
      const dk = instrument.dealKillers;

      if (
        !dk.minimumBusinessRevenue ||
        dk.minimumBusinessRevenue < VALIDATION_CONSTANTS.MIN_REVENUE
      ) {
        errors['dealKillers.minimumBusinessRevenue'] =
          `Minimum revenue must be at least $${VALIDATION_CONSTANTS.MIN_REVENUE.toLocaleString()}`;
      }

      if (!dk.minimumBusinessAge || dk.minimumBusinessAge < VALIDATION_CONSTANTS.MIN_BUSINESS_AGE) {
        errors['dealKillers.minimumBusinessAge'] = 'Minimum business age is required';
      }

      if (
        !dk.debtServiceCoverageRatio ||
        dk.debtServiceCoverageRatio < VALIDATION_CONSTANTS.MIN_DSCR
      ) {
        errors['dealKillers.debtServiceCoverageRatio'] =
          `DSCR must be at least ${VALIDATION_CONSTANTS.MIN_DSCR}`;
      }

      if (!dk.geographicLendingCoverage || dk.geographicLendingCoverage.length === 0) {
        warnings['dealKillers.geographicLendingCoverage'] =
          'Consider specifying geographic coverage for better matching';
      }
    }

    // Second stage validation
    if (instrument.secondStage) {
      const ss = instrument.secondStage;

      if (
        !ss.minimumTransactionAmount ||
        ss.minimumTransactionAmount < VALIDATION_CONSTANTS.MIN_LOAN_AMOUNT
      ) {
        errors['secondStage.minimumTransactionAmount'] =
          `Minimum loan amount must be at least $${VALIDATION_CONSTANTS.MIN_LOAN_AMOUNT.toLocaleString()}`;
      }

      if (
        !ss.maximumTransactionAmount ||
        ss.maximumTransactionAmount > VALIDATION_CONSTANTS.MAX_LOAN_AMOUNT
      ) {
        errors['secondStage.maximumTransactionAmount'] =
          `Maximum loan amount cannot exceed $${VALIDATION_CONSTANTS.MAX_LOAN_AMOUNT.toLocaleString()}`;
      }

      if (
        ss.minimumTransactionAmount &&
        ss.maximumTransactionAmount &&
        ss.minimumTransactionAmount >= ss.maximumTransactionAmount
      ) {
        errors['secondStage.maximumTransactionAmount'] =
          'Maximum loan amount must be greater than minimum';
      }

      if (!ss.minimumTermMonths || ss.minimumTermMonths < VALIDATION_CONSTANTS.MIN_TERM_MONTHS) {
        errors['secondStage.minimumTermMonths'] = 'Minimum term is required';
      }

      if (!ss.maximumTermMonths || ss.maximumTermMonths > VALIDATION_CONSTANTS.MAX_TERM_MONTHS) {
        errors['secondStage.maximumTermMonths'] =
          `Maximum term cannot exceed ${VALIDATION_CONSTANTS.MAX_TERM_MONTHS} months`;
      }

      if (
        ss.minimumTermMonths &&
        ss.maximumTermMonths &&
        ss.minimumTermMonths >= ss.maximumTermMonths
      ) {
        errors['secondStage.maximumTermMonths'] = 'Maximum term must be greater than minimum';
      }
    }

    // Risk weights validation
    if (instrument.riskWeights) {
      const rw = instrument.riskWeights;
      const weights = [
        rw.creditWorthinessWeight,
        rw.financialRatioWeight,
        rw.cashFlowWeight,
        rw.complianceWeight,
        rw.equipmentWeight,
        rw.propertyWeight,
      ];
      const fieldNames = [
        'creditWorthinessWeight',
        'financialRatioWeight',
        'cashFlowWeight',
        'complianceWeight',
        'equipmentWeight',
        'propertyWeight',
      ];

      const totalWeight = weights.reduce((sum, weight) => sum + (weight || 0), 0);

      if (Math.abs(totalWeight - VALIDATION_CONSTANTS.WEIGHT_TOTAL) > 0.1) {
        errors['riskWeights'] =
          `Risk weights must sum to exactly ${VALIDATION_CONSTANTS.WEIGHT_TOTAL}% (current: ${totalWeight.toFixed(1)}%)`;
      }

      weights.forEach((weight, index) => {
        if (weight !== undefined && (weight < 0 || weight > 100)) {
          errors[`riskWeights.${fieldNames[index]}`] = 'Weight must be between 0 and 100';
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  // Matching Operations
  async performMatching(request: MatchingRequest): Promise<MatchingResponse> {
    return this.request<MatchingResponse>('/smart-matching/match', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getMatchHistory(instrumentId: string, limit: number = 50): Promise<MatchResult[]> {
    return this.request<MatchResult[]>(
      `/smart-matching/instruments/${instrumentId}/matches?limit=${limit}`
    );
  }

  async updateMatchStatus(matchId: string, status: string, notes?: string): Promise<MatchResult> {
    return this.request<MatchResult>(`/smart-matching/matches/${matchId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Analytics and Reporting
  async getInstrumentAnalytics(instrumentId: string, dateRange?: { from: string; to: string }) {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.request(`/smart-matching/instruments/${instrumentId}/analytics?${params}`);
  }

  async getCustomerAnalytics(customerId?: string, dateRange?: { from: string; to: string }) {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.request(`/smart-matching/analytics?${params}`);
  }

  async getMatchingTrends(period: 'week' | 'month' | 'quarter' = 'month') {
    return this.request(`/smart-matching/trends?period=${period}`);
  }

  // Integration with EVA Underwriting Model
  async pushToEVAModel(instrumentId: string): Promise<{ success: boolean; modelVersion: string }> {
    return this.request<{ success: boolean; modelVersion: string }>(
      `/smart-matching/instruments/${instrumentId}/push-to-eva`,
      {
        method: 'POST',
      }
    );
  }

  async syncAllInstrumentsToEVA(
    customerId?: string
  ): Promise<{ synced: number; failed: number; errors: string[] }> {
    return this.request<{ synced: number; failed: number; errors: string[] }>(
      '/smart-matching/sync-to-eva',
      {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      }
    );
  }

  async getEVAModelStatus(): Promise<{
    version: string;
    lastUpdate: string;
    instrumentCount: number;
  }> {
    return this.request<{ version: string; lastUpdate: string; instrumentCount: number }>(
      '/smart-matching/eva-status'
    );
  }

  // Borrower Profile Management
  async getBorrowerProfile(borrowerId: string): Promise<BorrowerMatchingProfile> {
    return this.request<BorrowerMatchingProfile>(`/smart-matching/borrowers/${borrowerId}`);
  }

  async createBorrowerProfile(
    profile: Omit<BorrowerMatchingProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BorrowerMatchingProfile> {
    return this.request<BorrowerMatchingProfile>('/smart-matching/borrowers', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async updateBorrowerProfile(
    borrowerId: string,
    profile: Partial<BorrowerMatchingProfile>
  ): Promise<BorrowerMatchingProfile> {
    return this.request<BorrowerMatchingProfile>(`/smart-matching/borrowers/${borrowerId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Utility Functions
  async getIndustryCodes(search?: string): Promise<{ code: string; description: string }[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return this.request<{ code: string; description: string }[]>(
      `/smart-matching/industry-codes${params.toString() ? `?${params}` : ''}`
    );
  }

  async getStateCodes(): Promise<{ code: string; name: string }[]> {
    return this.request<{ code: string; name: string }[]>('/smart-matching/state-codes');
  }

  async getCollateralTypes(): Promise<{ value: string; label: string; description?: string }[]> {
    return this.request<{ value: string; label: string; description?: string }[]>(
      '/smart-matching/collateral-types'
    );
  }

  // Bulk Operations
  async bulkUpdateInstruments(
    updates: { id: string; changes: Partial<SmartMatchingInstrument> }[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    return this.request<{ success: number; failed: number; errors: string[] }>(
      '/smart-matching/instruments/bulk-update',
      {
        method: 'PATCH',
        body: JSON.stringify({ updates }),
      }
    );
  }

  async exportInstruments(customerId?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);

    const response = await fetch(
      `${API_BASE_URL}/smart-matching/instruments/export${params.toString() ? `?${params}` : ''}`,
      {
        headers: {
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export instruments');
    }

    return response.blob();
  }

  async importInstruments(
    file: File,
    customerId?: string
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    if (customerId) {
      formData.append('customerId', customerId);
    }

    const response = await fetch(`${API_BASE_URL}/smart-matching/instruments/import`, {
      method: 'POST',
      headers: {
        // TODO: Add authentication headers
        // 'Authorization': `Bearer ${getAuthToken()}`,
        // Note: Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Real-time Notifications
  async subscribeToUpdates(
    customerId: string,
    callback: (update: any) => void
  ): Promise<() => void> {
    // TODO: Implement WebSocket or Server-Sent Events for real-time updates
    // For now, return a mock unsubscribe function
    return () => {
      debugLog('general', 'log_statement', `Unsubscribed from updates for customer ${customerId}`)
    };
  }
}

// Export singleton instance
export const smartMatchingService = new SmartMatchingService();
export default smartMatchingService;
