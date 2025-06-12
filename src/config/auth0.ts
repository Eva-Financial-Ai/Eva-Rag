/**
 * Auth0 Configuration
 * This file contains all Auth0-related configuration
 */

export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'evafi.us.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-client-id',
  redirectUri: window.location.origin,
  audience:
    process.env.REACT_APP_AUTH0_AUDIENCE || 'https://evafi-api',
  scope: 'openid profile email offline_access',
  // Add any custom scopes needed for your API
  customScopes: [
    'read:transactions',
    'write:transactions',
    'read:documents',
    'write:documents',
    'read:analytics',
  ].join(' '),
};

// Helper to get full scope string
export const getAuth0Scope = () => {
  return `${auth0Config.scope} ${auth0Config.customScopes}`;
};

// Role mapping from Auth0 roles to EVA platform roles
export const mapAuth0RoleToEVA = (auth0Roles: string[]): string => {
  // Map Auth0 roles to EVA platform roles
  const roleMapping: Record<string, string> = {
    'eva-admin': 'admin',
    'eva-lender': 'lender',
    'eva-borrower': 'borrower',
    'eva-broker': 'broker',
    'eva-vendor': 'vendor',
  };

  // Find the first matching role
  for (const auth0Role of auth0Roles) {
    if (roleMapping[auth0Role]) {
      return roleMapping[auth0Role];
    }
  }

  // Default to borrower if no role is found
  return 'borrower';
};
