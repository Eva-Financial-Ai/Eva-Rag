/**
 * Feature Flags Configuration
 *
 * Controls which features are enabled in the application.
 * Set to false to defer features to post-MVP.
 *
 * @created May 27, 2025
 * @updated May 27, 2025
 */

export const FEATURE_FLAGS = {
  // Financial Features
  FINANCIAL_CALCULATOR: false, // Hidden due to rendering issues
  ADVANCED_TAX_CALCULATOR: false, // Post-MVP enhancement

  // Blockchain Features
  BLOCKCHAIN_ENABLED: false, // Defer all blockchain features
  BLOCKCHAIN_WIDGET: false, // Asset verification widget
  BLOCKCHAIN_VERIFICATION: false, // Document verification on chain
  UNICURRENCY: false, // Multi-currency support
  SHIELD_PROTOCOL: false, // Advanced security features

  // AI Features
  CUSTOM_AI_AGENTS: false, // Custom agent creation
  AI_AGENT_CUSTOMIZATION: false, // Advanced AI options
  AI_LIFECYCLE_ASSISTANT: true, // Keep basic version only
  ADVANCED_AI_CHAT: false, // Advanced chat features

  // KYC & Security
  BIOMETRIC_KYC: false, // Biometric verification
  ADVANCED_PLAID_VERIFICATION: true, // Keep basic Plaid

  // Demo & Training
  INTERACTIVE_TUTORIALS: false, // Training walkthroughs
  COMPONENT_SANDBOX: false, // Development sandbox

  // Analytics
  ADVANCED_ANALYTICS: false, // Enhanced analytics dashboard
  ROLE_ANALYTICS_DISPLAY: true, // Keep basic analytics

  // Integration Features
  ADVANCED_QUICKBOOKS: false, // Deep QB integration
  TAX_RETURNS_UPLOAD: true, // Keep basic tax upload
  CALENDAR_SYNC: false, // Auth0 calendar integration

  // Market Features
  COMMERCIAL_MARKET: true, // Keep for MVP
  COMMERCIAL_PAPER: false, // Defer commercial paper

  // Performance
  EDGE_COMPUTING: false, // Edge config features
  PERFORMANCE_MONITORING: false, // Advanced monitoring

  // Mobile
  MOBILE_APP_PREVIEW: false, // Mobile preview in web

  // Developer Tools
  DEV_DIAGNOSTICS: process.env.NODE_ENV === 'development',
  MOCK_WEBSOCKET: process.env.NODE_ENV === 'development',
};

/**
 * Helper function to check if a feature is enabled
 */
export const _isFeatureEnabled = (featureName: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[featureName] ?? false;
};

/**
 * Helper to get all enabled features
 */
export const _getEnabledFeatures = (): string[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
};

/**
 * Helper to get all disabled features
 */
export const _getDisabledFeatures = (): string[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
};
