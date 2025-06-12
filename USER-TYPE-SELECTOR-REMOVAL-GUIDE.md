# User Type Selector Removal Guide

## Overview

This guide documents the removal of the manual user type selector from the EVA Platform and the transition to Auth0-based automatic user type determination.

## Timeline

- **Current State (Staging)**: User type selector is still visible for testing purposes
- **End of Staging**: User type selector will be removed from all UI components
- **Production**: Only Auth0-based authentication with automatic role assignment

## Components to be Removed

### 1. User Type Selector Component
- **File**: `src/components/common/EnhancedUserTypeSelector.tsx`
- **Usage**: Currently used in navigation bars and initial setup flows
- **Action**: Remove component and all imports

### 2. User Type Context Updates
- **File**: `src/contexts/UserContext.tsx` or `src/contexts/UserTypeContext.tsx`
- **Changes**: Remove manual userType state management
- **New Approach**: Read userType from Auth0 token claims

### 3. Navigation Components
- **Files**: 
  - `src/components/layout/EnhancedTopNavigation.tsx`
  - `src/components/layout/TopNavbar.tsx`
  - `src/components/layout/Sidebar.tsx`
- **Changes**: Remove UserTypeSelector imports and components

## New Authentication Flow

### 1. User Registration/Login
```typescript
// User logs in via Auth0
const loginWithAuth0 = () => {
  loginWithRedirect({
    appState: { returnTo: window.location.pathname }
  });
};
```

### 2. Token Claims Processing
```typescript
// Extract user type from Auth0 token
const getUserTypeFromToken = (user: Auth0User) => {
  const namespace = 'https://eva-platform.com/';
  const userType = user[namespace + 'userType'] || 'borrower';
  const roles = user[namespace + 'roles'] || ['eva-borrower'];
  
  return { userType, roles };
};
```

### 3. Role-Based UI Rendering
```typescript
// Use Auth0 hook to get user info
const { user, isAuthenticated } = useAuth0();
const { userType, roles } = getUserTypeFromToken(user);

// Render UI based on user type
return (
  <Dashboard userType={userType} roles={roles} />
);
```

## Code Changes Required

### 1. Update Auth Hook
```typescript
// src/hooks/useAuth.ts
import { useAuth0 } from '@auth0/nextjs-auth0/client';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  
  const userType = useMemo(() => {
    if (!user) return null;
    const namespace = 'https://eva-platform.com/';
    return user[namespace + 'userType'] || 'borrower';
  }, [user]);
  
  const roles = useMemo(() => {
    if (!user) return [];
    const namespace = 'https://eva-platform.com/';
    return user[namespace + 'roles'] || ['eva-borrower'];
  }, [user]);
  
  return {
    user,
    userType,
    roles,
    isAuthenticated,
    isLoading
  };
};
```

### 2. Update Navigation Components
```typescript
// Before (with selector)
<EnhancedUserTypeSelector 
  currentUserType={userType}
  onUserTypeChange={handleUserTypeChange}
/>

// After (no selector)
<UserInfo userType={userType} /> // Display only, no selection
```

### 3. Update Dashboard Routing
```typescript
// src/pages/Dashboard.tsx
const Dashboard = () => {
  const { userType } = useAuth();
  
  // Route to appropriate dashboard based on Auth0 role
  switch (userType) {
    case 'lender':
      return <LenderDashboard />;
    case 'borrower':
      return <BorrowerDashboard />;
    case 'broker':
      return <BrokerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <BorrowerDashboard />;
  }
};
```

## Testing Checklist

Before removing the user type selector:

- [ ] Verify Auth0 rules correctly assign user types
- [ ] Test login flow for each user type
- [ ] Confirm dashboards load correctly based on Auth0 roles
- [ ] Test role changes by system admin
- [ ] Verify all navigation works without selector
- [ ] Check mobile responsiveness without selector
- [ ] Test edge cases (no role assigned, multiple roles)

## Rollback Plan

If issues arise after removal:

1. **Feature Flag**: Use feature flag to toggle selector visibility
```typescript
const SHOW_USER_TYPE_SELECTOR = process.env.REACT_APP_SHOW_USER_SELECTOR === 'true';
```

2. **Conditional Rendering**: Keep component but conditionally render
```typescript
{SHOW_USER_TYPE_SELECTOR && <EnhancedUserTypeSelector />}
```

## Benefits of Removal

1. **Security**: User types cannot be arbitrarily changed by users
2. **Simplicity**: Cleaner UI without role selection
3. **Consistency**: Single source of truth (Auth0) for user roles
4. **Compliance**: Better audit trail for role assignments
5. **User Experience**: Fewer clicks, automatic role detection

## Support and Troubleshooting

### Common Issues

1. **User sees wrong dashboard**
   - Check Auth0 user profile for correct role assignment
   - Verify Auth0 rules are executing properly
   - Clear browser cache and re-authenticate

2. **Role changes not reflected**
   - User must log out and log back in
   - Check Auth0 logs for rule execution
   - Verify token refresh is working

3. **New users get wrong default role**
   - Review Auth0 rule logic
   - Check email domain mappings
   - Verify organization settings

### Contact Information

- **Technical Issues**: dev-team@evafi.ai
- **Auth0 Support**: support@auth0.com
- **Role Assignment Requests**: admin@evafi.ai