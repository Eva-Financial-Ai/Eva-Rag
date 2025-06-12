# Auth0 Setup Guide for EVA Platform

## Overview

The EVA Platform now uses Auth0 for secure authentication, replacing the previous PQC (Post-Quantum Cryptography) system. This guide will help you set up Auth0 for your environment.

**Important Update**: As of the end of staging, the manual user type selector (EnhancedUserTypeSelector) will be removed. User types are now determined automatically during the Auth0 authentication process, eliminating the need for users to manually select their type.

## Prerequisites

- An Auth0 account (sign up at https://auth0.com)
- Node.js and npm installed
- Access to the EVA Platform codebase

## Setup Steps

### 1. Create an Auth0 Application

1. Log in to your Auth0 Dashboard
2. Navigate to Applications > Create Application
3. Choose "Single Page Web Applications"
4. Name it "EVA Platform"

### 2. Configure Application Settings

In your Auth0 application settings:

#### Allowed Callback URLs:

```
http://localhost:3000
http://localhost:3001
https://your-production-domain.com
```

#### Allowed Logout URLs:

```
http://localhost:3000
http://localhost:3001
https://your-production-domain.com
```

#### Allowed Web Origins:

```
http://localhost:3000
http://localhost:3001
https://your-production-domain.com
```

### 3. Set Up User Roles

1. Go to User Management > Roles
2. Create the following roles:
   - `eva-admin` - Full system access (assigned by system administrators only)
   - `eva-lender` - Lender access (auto-assigned based on email domain or manually by admin)
   - `eva-borrower` - Borrower access (default role for new users)
   - `eva-broker` - Broker access (auto-assigned based on email domain or manually by admin)
   - `eva-vendor` - Vendor access (assigned by system administrators)

#### Role Assignment Methods:

1. **Automatic Assignment**: Based on email domain rules (see step 5)
2. **Manual Assignment**: System administrators can assign/change roles through Auth0 dashboard
3. **Organization-Based**: Users joining through organization invites get org-specific roles
4. **Default Assignment**: All new users without specific rules get 'eva-borrower' role

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://your-api-identifier

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Environment
REACT_APP_ENVIRONMENT=development

# Encryption key (generate a secure random key)
REACT_APP_ENCRYPTION_KEY=your-secure-encryption-key-here
```

### 5. Set Up Rules (Optional)

To automatically assign roles based on email domain:

1. Go to Auth Pipeline > Rules
2. Create a new rule:

```javascript
function (user, context, callback) {
  // Assign roles based on email domain and organization
  const email = user.email || '';
  const organization = context.organization || {};
  let role = 'eva-borrower'; // default role
  let userType = 'borrower'; // default user type

  // Check organization-specific roles first
  if (organization.name) {
    const orgRoles = {
      'Lender Partners': { role: 'eva-lender', type: 'lender' },
      'Broker Network': { role: 'eva-broker', type: 'broker' },
      'Vendor Services': { role: 'eva-vendor', type: 'vendor' }
    };
    
    if (orgRoles[organization.name]) {
      role = orgRoles[organization.name].role;
      userType = orgRoles[organization.name].type;
    }
  }
  
  // Email domain rules (if not set by organization)
  if (role === 'eva-borrower') {
    const domainRules = [
      { domain: '@lender.com', role: 'eva-lender', type: 'lender' },
      { domain: '@broker.com', role: 'eva-broker', type: 'broker' },
      { domain: '@evafi.ai', role: 'eva-admin', type: 'admin' },
      // Add more domain mappings as needed
    ];
    
    for (const rule of domainRules) {
      if (email.endsWith(rule.domain)) {
        role = rule.role;
        userType = rule.type;
        break;
      }
    }
  }

  // Add role and user type to app_metadata
  user.app_metadata = user.app_metadata || {};
  user.app_metadata.roles = [role];
  user.app_metadata.userType = userType;

  // Add custom claims to tokens
  const namespace = 'https://eva-platform.com/';
  context.idToken[namespace + 'roles'] = [role];
  context.idToken[namespace + 'userType'] = userType;
  context.accessToken[namespace + 'roles'] = [role];
  context.accessToken[namespace + 'userType'] = userType;

  callback(null, user, context);
}
```

### 6. Enable Social Connections (Optional)

1. Go to Authentication > Social
2. Enable desired social providers:
   - Google
   - Microsoft
   - LinkedIn

### 7. Customize Login Page (Optional)

1. Go to Branding > Universal Login
2. Customize the login page to match EVA Platform branding

## Testing the Integration

1. Start the development server:

   ```bash
   npm start
   ```

2. Navigate to http://localhost:3000

3. Click "Sign in with Auth0"

4. You should be redirected to Auth0 for authentication

5. After successful login, you'll be redirected back to the EVA Platform

## Security Best Practices

1. **Enable MFA**: Go to Security > Multi-factor Auth and enable MFA for all users

2. **Set Password Policy**: Go to Authentication > Database > Password Policy and set strong requirements

3. **Enable Anomaly Detection**: Go to Security > Attack Protection and enable:

   - Brute Force Protection
   - Suspicious IP Throttling
   - Breached Password Detection

4. **Regular Token Rotation**: Enable refresh token rotation in your application settings

5. **Monitor Logs**: Regularly review Auth0 logs for suspicious activity

## Troubleshooting

### Common Issues

1. **"Callback URL mismatch" error**

   - Ensure your callback URLs in Auth0 match exactly (including trailing slashes)

2. **"CORS error" when calling API**

   - Add your frontend URL to the API's CORS configuration
   - Ensure the Auth0 audience is correctly configured

3. **User roles not appearing**
   - Check that the namespace in your rules matches the one in the code
   - Ensure rules are enabled and in the correct order

### Debug Mode

To enable debug logging:

```javascript
// In your browser console
localStorage.setItem('auth0:debug', 'true');
```

## Migration from Old Auth System

The old authentication system files have been removed:

- `src/contexts/AuthContext.tsx` (replaced with `Auth0Context.tsx`)
- `src/components/security/PQCLogin.tsx`
- `src/components/security/PQCryptographyProvider.tsx`
- `src/pages/Login.tsx` (replaced with `Auth0Login.tsx`)

**Upcoming Removal**:
- `src/components/common/EnhancedUserTypeSelector.tsx` (will be removed at end of staging)
- User type selection UI components
- Manual role switching functionality

User data is now managed by Auth0. To migrate existing users:

1. Export user data from your old system
2. Map user types to Auth0 roles
3. Use Auth0's bulk import feature with role assignments
4. Send password reset emails to users

## System Administrator Guide

### Managing User Roles

1. **View User Roles**:
   - Navigate to Auth0 Dashboard > User Management > Users
   - Click on a user to view their assigned roles

2. **Change User Roles**:
   - In the user details page, go to the "Roles" tab
   - Remove existing roles if needed
   - Add new roles based on business requirements

3. **Bulk Role Updates**:
   - Use Auth0 Management API for bulk operations
   - Example script for bulk role assignment:

```javascript
const ManagementClient = require('auth0').ManagementClient;

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'update:users update:users_app_metadata'
});

// Assign role to multiple users
async function assignRoleToUsers(userIds, roleId) {
  for (const userId of userIds) {
    await management.assignRolestoUser(
      { id: userId },
      { roles: [roleId] }
    );
  }
}
```

4. **Role Change Notifications**:
   - Users will need to log out and log back in for role changes to take effect
   - Consider implementing a webhook to notify users of role changes

## Support

For Auth0-specific issues:

- Auth0 Documentation: https://auth0.com/docs
- Auth0 Community: https://community.auth0.com

For EVA Platform integration issues:

- Contact the EVA Platform development team
