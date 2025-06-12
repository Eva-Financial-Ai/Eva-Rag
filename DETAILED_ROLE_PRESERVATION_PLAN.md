# 🛡️ DETAILED ROLE PRESERVATION & SYNC FIX PLAN

## 🎯 OBJECTIVE: Fix Selector Issues While Preserving ALL Role Types

**CRITICAL**: We will **PRESERVE ALL ROLE TYPES** and their unique user experiences. The issue is **TYPE SYSTEM CONFLICTS**, not too many roles.

---

## 📋 CURRENT ROLE INVENTORY (DO NOT DELETE)

### **✅ PRESERVE ALL THESE ROLES:**

#### **Core User Types** (Different UX/Permissions)

- `borrower` → Business owners applying for loans
- `lender` → Banks/financial institutions underwriting
- `broker` → Intermediaries connecting borrowers/lenders
- `vendor` → Equipment/service providers
- `admin` → System administrators
- `developer` → Platform developers

#### **Specialized Sub-Roles** (Granular Permissions)

- `sales_manager` → Core sales team
- `loan_processor` → Loan processing staff
- `credit_underwriter` → Credit analysis specialists
- `credit_committee` → Credit decision makers
- `portfolio_manager` → Portfolio management team
- `finance_manager` → Financial operations

#### **Specific Role Variants** (Industry-Specific)

- `business_owner`, `cfo`, `controller` → Borrower sub-types
- `account_executive`, `relationship_manager` → Lender sub-types
- `commercial_broker`, `equipment_finance_broker` → Broker sub-types
- `sales_rep`, `account_manager` → Vendor sub-types

**TOTAL: 20+ Role Types = KEEP ALL** ✅

---

## 🔍 ROOT CAUSE ANALYSIS

### **Problem: 3 Type Systems Defining SAME Roles Differently**

```typescript
// SYSTEM 1: src/types/user.ts (String Union)
export type UserRoleTypeString = 'borrower' | 'lender' | 'broker';

// SYSTEM 2: src/types/UserTypes.ts (Enum)
export enum UserType {
  BUSINESS = 'BUSINESS', // ← 'borrower' vs 'BUSINESS'
  BROKERAGE = 'BROKERAGE', // ← 'broker' vs 'BROKERAGE'
}

// SYSTEM 3: src/types/UserTypes.ts (Type Alias)
export type UserRoleType = 'borrower' | 'lender' | 'broker';
```

**Result**: TopNavbar uses System 1, UserTypeContext uses System 2, others use System 3 → **NO SYNC!**

---

## 🚀 PHASE 1: TYPE SYSTEM UNIFICATION (30 minutes)

### **Step 1.1: Create Master Type Definition**

**File**: `src/types/UnifiedRoles.ts` (NEW FILE)

```typescript
/**
 * MASTER ROLE DEFINITIONS - Single Source of Truth
 * ALL components must use these types
 */

// Primary user categories (main UX differences)
export type PrimaryUserRole =
  | 'borrower' // Business owners seeking financing
  | 'lender' // Financial institutions providing loans
  | 'broker' // Intermediaries facilitating deals
  | 'vendor' // Equipment/service providers
  | 'admin' // System administrators
  | 'developer'; // Platform developers

// Specialized staff roles (internal operations)
export type CoreStaffRole =
  | 'sales_manager'
  | 'loan_processor'
  | 'credit_underwriter'
  | 'credit_committee'
  | 'portfolio_manager'
  | 'finance_manager';

// Specific sub-roles (granular permissions)
export type SpecificSubRole =
  // Borrower sub-roles
  | 'business_owner'
  | 'cfo'
  | 'controller'
  | 'legal_counsel'
  // Lender sub-roles
  | 'account_executive'
  | 'underwriter'
  | 'relationship_manager'
  // Broker sub-roles
  | 'commercial_broker'
  | 'equipment_finance_broker'
  | 'team_lead'
  // Vendor sub-roles
  | 'sales_rep'
  | 'account_manager'
  | 'finance_specialist'
  // Legacy compatibility
  | 'default_role'
  | 'owners'
  | 'employees';

// Master unified type (ALL possible roles)
export type UnifiedUserRole = PrimaryUserRole | CoreStaffRole | SpecificSubRole;

// Role hierarchy mapping (for permissions)
export const PRIMARY_ROLE_MAP: Record<UnifiedUserRole, PrimaryUserRole> = {
  // Direct mappings
  borrower: 'borrower',
  lender: 'lender',
  broker: 'broker',
  vendor: 'vendor',
  admin: 'admin',
  developer: 'developer',

  // Staff roles → map to primary category
  sales_manager: 'admin',
  loan_processor: 'lender',
  credit_underwriter: 'lender',
  credit_committee: 'lender',
  portfolio_manager: 'lender',
  finance_manager: 'admin',

  // Sub-roles → map to primary category
  business_owner: 'borrower',
  cfo: 'borrower',
  controller: 'borrower',
  legal_counsel: 'borrower',
  account_executive: 'lender',
  underwriter: 'lender',
  relationship_manager: 'lender',
  commercial_broker: 'broker',
  equipment_finance_broker: 'broker',
  team_lead: 'broker',
  sales_rep: 'vendor',
  account_manager: 'vendor',
  finance_specialist: 'vendor',
  default_role: 'borrower',
  owners: 'borrower',
  employees: 'borrower',
};

// Display names for UI
export const ROLE_DISPLAY_NAMES: Record<UnifiedUserRole, string> = {
  borrower: 'Business Owner',
  lender: 'Lender',
  broker: 'Broker',
  vendor: 'Vendor',
  admin: 'Administrator',
  developer: 'Developer',
  sales_manager: 'Sales Manager',
  loan_processor: 'Loan Processor',
  credit_underwriter: 'Credit Underwriter',
  credit_committee: 'Credit Committee',
  portfolio_manager: 'Portfolio Manager',
  finance_manager: 'Finance Manager',
  business_owner: 'Business Owner',
  cfo: 'Chief Financial Officer',
  controller: 'Controller',
  legal_counsel: 'Legal Counsel',
  account_executive: 'Account Executive',
  underwriter: 'Underwriter',
  relationship_manager: 'Relationship Manager',
  commercial_broker: 'Commercial Broker',
  equipment_finance_broker: 'Equipment Finance Broker',
  team_lead: 'Team Lead',
  sales_rep: 'Sales Representative',
  account_manager: 'Account Manager',
  finance_specialist: 'Finance Specialist',
  default_role: 'Default Role',
  owners: 'Owner',
  employees: 'Employee',
};

// Available sub-roles for each primary role
export const AVAILABLE_SUB_ROLES: Record<PrimaryUserRole, SpecificSubRole[]> = {
  borrower: [
    'business_owner',
    'cfo',
    'controller',
    'legal_counsel',
    'default_role',
    'owners',
    'employees',
  ],
  lender: ['account_executive', 'underwriter', 'relationship_manager'],
  broker: ['commercial_broker', 'equipment_finance_broker', 'team_lead'],
  vendor: ['sales_rep', 'account_manager', 'finance_specialist'],
  admin: ['default_role'],
  developer: ['default_role'],
};
```

### **Step 1.2: Verification Checklist**

**✅ VERIFY BEFORE PROCEEDING:**

- [ ] All 20+ existing roles are included in `UnifiedUserRole`
- [ ] `PRIMARY_ROLE_MAP` maps every role to a primary category
- [ ] `ROLE_DISPLAY_NAMES` has entries for every role
- [ ] `AVAILABLE_SUB_ROLES` correctly groups sub-roles
- [ ] No roles are missing or incorrectly categorized

---

## 🔄 PHASE 2: GRADUAL MIGRATION (45 minutes)

### **Step 2.1: Update UserTypeContext (15 minutes)**

**File**: `src/contexts/UserTypeContext.tsx`

**BEFORE:**

```typescript
import { UserType } from '../types/UserTypes';
const [userType, setUserType] = useState<UserType>(UserType.BUSINESS);
```

**AFTER:**

```typescript
import { UnifiedUserRole, PrimaryUserRole, PRIMARY_ROLE_MAP } from '../types/UnifiedRoles';

const [currentRole, setCurrentRole] = useState<UnifiedUserRole>('borrower');
const [specificRole, setSpecificRole] = useState<UnifiedUserRole>('default_role');

// Helper to get primary category
const getPrimaryRole = (): PrimaryUserRole => PRIMARY_ROLE_MAP[currentRole];
```

### **Step 2.2: Update TopNavbar (15 minutes)**

**File**: `src/components/layout/TopNavbar.tsx`

**BEFORE:**

```typescript
const [currentUserType, setCurrentUserType] = useState<UserRoleTypeString>('borrower');
```

**AFTER:**

```typescript
import { UnifiedUserRole } from '../../types/UnifiedRoles';
import { useUserType } from '../../contexts/UserTypeContext';

// REMOVE local state, use context instead
const { currentRole, setCurrentRole, specificRole, setSpecificRole } = useUserType();
```

### **Step 2.3: localStorage Key Standardization (15 minutes)**

**File**: `src/utils/roleStorage.ts` (NEW FILE)

```typescript
/**
 * Centralized localStorage management for roles
 * Prevents key conflicts across components
 */

import { UnifiedUserRole } from '../types/UnifiedRoles';

// Standardized keys
const STORAGE_KEYS = {
  PRIMARY_ROLE: 'eva_primary_role',
  SPECIFIC_ROLE: 'eva_specific_role',
  TRANSACTION_ID: 'eva_current_transaction',
} as const;

export class RoleStorage {
  static savePrimaryRole(role: UnifiedUserRole): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY_ROLE, role);
    } catch (error) {
      console.warn('Failed to save primary role:', error);
    }
  }

  static loadPrimaryRole(): UnifiedUserRole {
    try {
      return (localStorage.getItem(STORAGE_KEYS.PRIMARY_ROLE) as UnifiedUserRole) || 'borrower';
    } catch (error) {
      console.warn('Failed to load primary role:', error);
      return 'borrower';
    }
  }

  static saveSpecificRole(role: UnifiedUserRole): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SPECIFIC_ROLE, role);
    } catch (error) {
      console.warn('Failed to save specific role:', error);
    }
  }

  static loadSpecificRole(): UnifiedUserRole {
    try {
      return (
        (localStorage.getItem(STORAGE_KEYS.SPECIFIC_ROLE) as UnifiedUserRole) || 'default_role'
      );
    } catch (error) {
      console.warn('Failed to load specific role:', error);
      return 'default_role';
    }
  }

  // Migration helper - converts old keys to new format
  static migrateOldKeys(): void {
    const oldUserType = localStorage.getItem('currentUserType') || localStorage.getItem('userRole');
    const oldSpecificRole =
      localStorage.getItem('currentSpecificRole') || localStorage.getItem('specificRole');

    if (oldUserType && !localStorage.getItem(STORAGE_KEYS.PRIMARY_ROLE)) {
      this.savePrimaryRole(oldUserType as UnifiedUserRole);
    }

    if (oldSpecificRole && !localStorage.getItem(STORAGE_KEYS.SPECIFIC_ROLE)) {
      this.saveSpecificRole(oldSpecificRole as UnifiedUserRole);
    }
  }
}
```

---

## 🔧 PHASE 3: CONTEXT RE-RENDER FIX (30 minutes)

### **Step 3.1: Fix Context Resetting (Production Issue)**

Based on [Next.js Discussion #76419](https://github.com/vercel/next.js/discussions/76419), context resets in production due to layout re-rendering.

**File**: `src/contexts/StableUserTypeContext.tsx` (NEW FILE)

```typescript
/**
 * Production-stable UserType context
 * Prevents context reset issues in production builds
 */

import React, { createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { UnifiedUserRole, PrimaryUserRole, PRIMARY_ROLE_MAP } from '../types/UnifiedRoles';
import { RoleStorage } from '../utils/roleStorage';

interface UserTypeContextValue {
  currentRole: UnifiedUserRole;
  specificRole: UnifiedUserRole;
  primaryRole: PrimaryUserRole;
  setCurrentRole: (role: UnifiedUserRole) => void;
  setSpecificRole: (role: UnifiedUserRole) => void;
  isLoading: boolean;
}

const UserTypeContext = createContext<UserTypeContextValue | null>(null);

export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use refs to prevent context reset in production
  const currentRoleRef = useRef<UnifiedUserRole>('borrower');
  const specificRoleRef = useRef<UnifiedUserRole>('default_role');
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize from localStorage on mount
  React.useEffect(() => {
    RoleStorage.migrateOldKeys(); // Handle old localStorage keys
    currentRoleRef.current = RoleStorage.loadPrimaryRole();
    specificRoleRef.current = RoleStorage.loadSpecificRole();
    setIsLoading(false);
  }, []);

  // Stable setters using useCallback
  const setCurrentRole = useCallback((role: UnifiedUserRole) => {
    currentRoleRef.current = role;
    RoleStorage.savePrimaryRole(role);

    // Dispatch custom event for components that need updates
    window.dispatchEvent(new CustomEvent('eva-role-changed', {
      detail: { currentRole: role, specificRole: specificRoleRef.current }
    }));
  }, []);

  const setSpecificRole = useCallback((role: UnifiedUserRole) => {
    specificRoleRef.current = role;
    RoleStorage.saveSpecificRole(role);

    window.dispatchEvent(new CustomEvent('eva-role-changed', {
      detail: { currentRole: currentRoleRef.current, specificRole: role }
    }));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentRole: currentRoleRef.current,
    specificRole: specificRoleRef.current,
    primaryRole: PRIMARY_ROLE_MAP[currentRoleRef.current],
    setCurrentRole,
    setSpecificRole,
    isLoading
  }), [setCurrentRole, setSpecificRole, isLoading]);

  return (
    <UserTypeContext.Provider value={contextValue}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = (): UserTypeContextValue => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within UserTypeProvider');
  }
  return context;
};
```

### **Step 3.2: Optimize Component Re-renders**

Following [React Context performance best practices](https://www.tenxdeveloper.com/blog/optimizing-react-context-performance):

**File**: `src/components/layout/OptimizedTopNavbar.tsx`

```typescript
/**
 * Optimized TopNavbar with minimal re-renders
 * Uses React.memo and selector pattern
 */

import React, { memo, useCallback } from 'react';
import { useUserType } from '../../contexts/StableUserTypeContext';
import { ROLE_DISPLAY_NAMES, AVAILABLE_SUB_ROLES } from '../../types/UnifiedRoles';

// Memoized role selector to prevent unnecessary re-renders
const RoleSelector = memo(() => {
  const { currentRole, setCurrentRole, primaryRole } = useUserType();

  const handleRoleChange = useCallback((newRole: UnifiedUserRole) => {
    setCurrentRole(newRole);
  }, [setCurrentRole]);

  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value as UnifiedUserRole)}
      className="role-selector"
    >
      {Object.entries(ROLE_DISPLAY_NAMES).map(([role, display]) => (
        <option key={role} value={role}>{display}</option>
      ))}
    </select>
  );
});

// Memoized sub-role selector
const SubRoleSelector = memo(() => {
  const { specificRole, setSpecificRole, primaryRole } = useUserType();
  const availableRoles = AVAILABLE_SUB_ROLES[primaryRole] || [];

  const handleSubRoleChange = useCallback((newRole: UnifiedUserRole) => {
    setSpecificRole(newRole);
  }, [setSpecificRole]);

  if (availableRoles.length <= 1) return null;

  return (
    <select
      value={specificRole}
      onChange={(e) => handleSubRoleChange(e.target.value as UnifiedUserRole)}
      className="sub-role-selector"
    >
      {availableRoles.map(role => (
        <option key={role} value={role}>{ROLE_DISPLAY_NAMES[role]}</option>
      ))}
    </select>
  );
});

// Main component using memoized selectors
const OptimizedTopNavbar = memo(() => {
  const { currentRole, primaryRole } = useUserType();

  return (
    <nav className="top-navbar">
      <div className="role-controls">
        <span>Role: {ROLE_DISPLAY_NAMES[currentRole]}</span>
        <RoleSelector />
        <SubRoleSelector />
      </div>
    </nav>
  );
});

export default OptimizedTopNavbar;
```

---

## 🧪 PHASE 4: TESTING & VERIFICATION (30 minutes)

### **Step 4.1: Role Preservation Test**

```typescript
// tests/rolePreservation.test.ts

describe('Role Preservation Tests', () => {
  test('All original roles are preserved', () => {
    const originalRoles = [
      'borrower',
      'lender',
      'broker',
      'vendor',
      'admin',
      'developer',
      'sales_manager',
      'loan_processor',
      'credit_underwriter',
      'business_owner',
      'cfo',
      'account_executive',
      'commercial_broker',
      // ... add all roles
    ];

    originalRoles.forEach(role => {
      expect(ROLE_DISPLAY_NAMES[role]).toBeDefined();
      expect(PRIMARY_ROLE_MAP[role]).toBeDefined();
    });
  });

  test('User experiences remain unique per role', () => {
    // Test that each primary role has different permissions/UX
    expect(PRIMARY_ROLE_MAP['borrower']).toBe('borrower');
    expect(PRIMARY_ROLE_MAP['lender']).toBe('lender');
    expect(PRIMARY_ROLE_MAP['business_owner']).toBe('borrower'); // Sub-role mapping
  });
});
```

### **Step 4.2: Selector Toggle Test**

```typescript
// tests/selectorToggle.test.ts

describe('Selector Toggle Functionality', () => {
  test('Role selector updates context', async () => {
    const { result } = renderHook(() => useUserType(), {
      wrapper: UserTypeProvider,
    });

    act(() => {
      result.current.setCurrentRole('lender');
    });

    expect(result.current.currentRole).toBe('lender');
    expect(result.current.primaryRole).toBe('lender');
  });

  test('Changes persist in localStorage', () => {
    RoleStorage.savePrimaryRole('broker');
    expect(RoleStorage.loadPrimaryRole()).toBe('broker');
  });
});
```

---

## 🛡️ ROLLBACK PLAN

### **If Something Goes Wrong:**

1. **Immediate Rollback**: Keep all original files as `.backup`
2. **Revert commits**: `git revert <commit-hash>`
3. **Emergency fallback**: Use original TopNavbar with local state

### **Backup Commands:**

```bash
# Before starting, backup critical files
cp src/types/user.ts src/types/user.ts.backup
cp src/types/UserTypes.ts src/types/UserTypes.ts.backup
cp src/contexts/UserTypeContext.tsx src/contexts/UserTypeContext.tsx.backup
cp src/components/layout/TopNavbar.tsx src/components/layout/TopNavbar.tsx.backup
```

---

## ✅ SUCCESS CRITERIA

### **✅ Phase 1 Success:**

- [ ] All roles preserved in `UnifiedUserRole` type
- [ ] No compilation errors
- [ ] Display names work for all roles

### **✅ Phase 2 Success:**

- [ ] UserTypeContext uses unified types
- [ ] TopNavbar connects to context (no local state)
- [ ] localStorage keys standardized

### **✅ Phase 3 Success:**

- [ ] Context doesn't reset in production
- [ ] Role selector toggles work smoothly
- [ ] No unnecessary re-renders

### **✅ Phase 4 Success:**

- [ ] All original functionality preserved
- [ ] Each role type has unique UX
- [ ] Selector changes persist across navigation

---

## 🚀 EXECUTION TIMELINE

**Total Time: 2.5 hours**

- Phase 1: 30 minutes (Type unification)
- Phase 2: 45 minutes (Context migration)
- Phase 3: 30 minutes (Re-render optimization)
- Phase 4: 30 minutes (Testing)
- Buffer: 15 minutes (Troubleshooting)

This plan preserves ALL your role types while fixing the sync issues that prevent your selectors from working properly!
