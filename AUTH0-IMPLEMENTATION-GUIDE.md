# Auth0 Implementation Guide for EVA Platform

This guide provides instructions for enabling and configuring Auth0 authentication and team management features in the EVA Platform.

## Table of Contents

1. [Overview](#overview)
2. [Feature Flags Configuration](#feature-flags-configuration)
3. [Auth0 Setup](#auth0-setup)
4. [Environment Configuration](#environment-configuration)
5. [Enabling Auth0 Features](#enabling-auth0-features)
6. [Team Management Setup](#team-management-setup)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Overview

The EVA Platform has Auth0 integration built-in but disabled by default. This allows for development without requiring Auth0 credentials while maintaining the ability to enable full authentication and team management features when needed.

## Feature Flags Configuration

All Auth0 and Team Management features are controlled via feature flags located in `src/config/featureFlags.ts`.

### Current Feature Flag Structure

```typescript
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
  demoMode: {
    enabled: boolean;
    showInNavigation: boolean;
  };
}
```

### Default Configuration (Features Disabled)

```typescript
export const featureFlags: FeatureFlags = {
  auth0: {
    enabled: false,
    showLoginButton: false,
    showUserMenu: false,
  },
  teamManagement: {
    enabled: false,
    showInNavigation: false,
    showInProfileSettings: false,
  },
  demoMode: {
    enabled: true,
    showInNavigation: true,
  },
};
```

## Auth0 Setup

### 1. Create Auth0 Account and Application

1. Sign up for an Auth0 account at [https://auth0.com](https://auth0.com)
2. Create a new Single Page Application
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000/callback, https://your-domain.com/callback`
   - **Allowed Logout URLs**: `http://localhost:3000, https://your-domain.com`
   - **Allowed Web Origins**: `http://localhost:3000, https://your-domain.com`
   - **Allowed Origins (CORS)**: `http://localhost:3000, https://your-domain.com`

### 2. Configure Auth0 API

1. Create a new API in Auth0 Dashboard
2. Set the **Identifier** (audience): `https://eva-platform-api`
3. Enable **RBAC** (Role-Based Access Control)
4. Enable **Add Permissions in the Access Token**

### 3. Set Up Roles and Permissions

Create the following roles in Auth0:

#### User Roles

- `borrower` - Business users seeking funding
- `lender` - Financial institutions providing funding
- `broker` - Intermediaries facilitating transactions
- `vendor` - Asset sellers and equipment providers

#### Admin Roles

- `admin` - System administrators
- `developer` - Development team members

#### Core Staff Roles

- `sales_manager` - Sales team managers
- `loan_processor` - Loan processing staff
- `credit_underwriter` - Credit underwriting team
- `credit_committee` - Credit committee members
- `portfolio_manager` - Portfolio management team

### 4. Configure Permissions

For each role, assign appropriate permissions:

```javascript
// Example permissions structure
{
  "borrower": [
    "read:own_applications",
    "create:loan_application",
    "update:own_profile"
  ],
  "lender": [
    "read:all_applications",
    "update:application_status",
    "create:loan_offer"
  ],
  "admin": [
    "read:all_data",
    "create:any",
    "update:any",
    "delete:any"
  ]
}
```

## Environment Configuration

### 1. Create Environment Variables

Create or update your `.env` file with Auth0 credentials:

```bash
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://eva-platform-api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_AUTH0_SCOPE=openid profile email

# Auth0 Management API (for team management)
REACT_APP_AUTH0_MANAGEMENT_API_ID=your-management-api-id
REACT_APP_AUTH0_MANAGEMENT_API_SECRET=your-management-api-secret
```

### 2. Update `.env.example`

Ensure your `.env.example` file includes all Auth0 variables:

```bash
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=
REACT_APP_AUTH0_CLIENT_ID=
REACT_APP_AUTH0_AUDIENCE=
REACT_APP_AUTH0_REDIRECT_URI=
REACT_APP_AUTH0_SCOPE=

# Auth0 Management API
REACT_APP_AUTH0_MANAGEMENT_API_ID=
REACT_APP_AUTH0_MANAGEMENT_API_SECRET=
```

## Enabling Auth0 Features

### 1. Enable Auth0 in Feature Flags

Update `src/config/featureFlags.ts`:

```typescript
export const featureFlags: FeatureFlags = {
  auth0: {
    enabled: true,
    showLoginButton: true,
    showUserMenu: true,
  },
  teamManagement: {
    enabled: true,
    showInNavigation: true,
    showInProfileSettings: true,
  },
  demoMode: {
    enabled: false, // Disable demo mode in production
    showInNavigation: false,
  },
};
```

### 2. Update Auth0 Context

The Auth0 context is already configured in `src/contexts/Auth0Context.tsx`. When Auth0 is enabled via feature flags, it will:

- Initialize Auth0 client with your configuration
- Handle authentication flow
- Manage user sessions
- Provide user profile and permissions

### 3. Protected Routes

Routes are automatically protected when Auth0 is enabled. The routing system checks:

```typescript
// Example from LoadableRouter.tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};
```

## Team Management Setup

### 1. Enable Team Management

When `teamManagement.enabled` is `true`, the following features become available:

- Team member invitation system
- Role assignment and management
- Permission management
- Team hierarchy visualization
- Audit logs for team changes

### 2. Configure Team Management Service

The team management service (`src/services/auth0Service.ts`) provides:

```typescript
// Available methods
auth0Service.getUsers(); // Get all users in organization
auth0Service.getRoles(); // Get all available roles
auth0Service.getUserRoles(userId); // Get roles for specific user
auth0Service.assignRole(userId, roleId); // Assign role to user
auth0Service.removeRole(userId, roleId); // Remove role from user
auth0Service.inviteUser(email, role); // Send invitation
```

### 3. Team Management UI

The Team Management page (`/team-management`) provides:

- User list with search and filters
- Role assignment interface
- Invitation system
- Bulk operations
- Activity logs

## Testing

### 1. Local Development Testing

1. Set up Auth0 development tenant
2. Configure environment variables
3. Enable features in `featureFlags.ts`
4. Run the application:
   ```bash
   npm start
   ```

### 2. Test User Creation

Create test users for each role:

```javascript
// Test users
test-borrower@example.com    // Role: borrower
test-lender@example.com      // Role: lender
test-broker@example.com      // Role: broker
test-vendor@example.com      // Role: vendor
test-admin@example.com       // Role: admin
```

### 3. Integration Tests

Run Auth0 integration tests:

```bash
# Run Auth0-specific tests
npm test -- --testPathPattern=auth0

# Run team management tests
npm test -- --testPathPattern=team-management
```

### 4. E2E Tests with Cypress

```bash
# Set Auth0 test credentials
export CYPRESS_AUTH0_USERNAME=test@example.com
export CYPRESS_AUTH0_PASSWORD=TestPassword123!

# Run E2E tests
npm run cypress:run
```

## Production Deployment

### 1. Production Configuration

Update production environment variables:

```bash
# Production Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-prod-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.your-domain.com
REACT_APP_AUTH0_REDIRECT_URI=https://your-domain.com/callback
```

### 2. Security Considerations

1. **Enable MFA**: Require multi-factor authentication for all users
2. **IP Allowlisting**: Configure IP restrictions for admin roles
3. **Session Management**: Set appropriate session timeouts
4. **Audit Logging**: Enable comprehensive audit logs
5. **Rate Limiting**: Configure rate limits for Auth0 APIs

### 3. Monitoring

Set up monitoring for:

- Failed login attempts
- Unusual access patterns
- API rate limit warnings
- User provisioning errors

### 4. Backup and Recovery

1. Export Auth0 configuration regularly
2. Backup user data and roles
3. Document recovery procedures
4. Test disaster recovery plan

## Troubleshooting

### Common Issues

1. **"Auth0 is not configured" error**

   - Check environment variables
   - Verify Auth0 domain and client ID
   - Ensure feature flags are enabled

2. **"Unauthorized" errors**

   - Verify API audience configuration
   - Check user roles and permissions
   - Validate access token scopes

3. **Team Management not showing**
   - Confirm `teamManagement.enabled` is `true`
   - Check user has admin role
   - Verify Management API credentials

### Debug Mode

Enable debug logging:

```typescript
// In src/index.tsx
if (process.env.NODE_ENV === 'development') {
  window.localStorage.setItem('auth0:debug', 'true');
}
```

## Support

For Auth0-specific issues:

- Auth0 Documentation: https://auth0.com/docs
- Auth0 Community: https://community.auth0.com
- Auth0 Support: https://support.auth0.com

For EVA Platform issues:

- Internal documentation: `/docs/auth0`
- Team Slack: #eva-platform-support
- Email: platform-support@eva.ai
