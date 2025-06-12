/**
 * Feature Flags Configuration
 *
 * This file controls the visibility of various features in the application.
 * Set flags to false to hide features from the UI.
 */

export interface FeatureFlags {
  auth0: {
    enabled: boolean;
    showLoginButton: boolean;
    showUserMenu: boolean;
  };
  teamManagement: {
    enabled: boolean;
    showInNavigation: boolean;
    showInProfileSettings: boolean;
  };

}

// Default feature flags configuration
export const featureFlags: FeatureFlags = {
  auth0: {
    enabled: false, // Set to true to enable Auth0 authentication
    showLoginButton: false,
    showUserMenu: false,
  },
  teamManagement: {
    enabled: false, // Set to true to enable team management features
    showInNavigation: false,
    showInProfileSettings: false,
  },

};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature]?.enabled ?? false;
};

// Helper function to get feature configuration
export const getFeatureConfig = <K extends keyof FeatureFlags>(feature: K): FeatureFlags[K] => {
  return featureFlags[feature];
};
