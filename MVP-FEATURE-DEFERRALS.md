# MVP Feature Deferrals - Quick Action Plan

## Immediate Actions Required (May 27, 2025)

### Features to Defer NOW

#### 1. Financial Calculator Widget ✅ DONE

- **Status**: Already commented out in App.tsx
- **Reason**: Rendering issues, complex tax calculations
- **Impact**: Saves debugging time, reduces bundle by 11.51KB
- **Post-MVP**: Priority 1 feature

#### 2. Blockchain Components 🔴 ACTION NEEDED

- **Components to disable**:
  - BlockchainWidget
  - BlockchainVerification
  - UniCurrency
  - AssetVerificationDashboard
- **Reason**: Not critical for loan processing MVP
- **Impact**: Reduces complexity, saves 2 weeks of integration
- **How**: Add feature flag or comment out routes

#### 3. Advanced AI Features 🔴 ACTION NEEDED

- **Components to simplify**:
  - CreateCustomAIAgent.tsx
  - AIAgentCustomizationOptions.tsx
  - AI Lifecycle Assistant (keep basic version)
- **Reason**: Basic AI chat is sufficient for MVP
- **Impact**: Saves 1 week of testing/debugging
- **How**: Hide advanced options, keep core chat

#### 4. Biometric KYC 🔴 ACTION NEEDED

- **Component**: BiometricKYC.tsx
- **Reason**: Standard KYC is sufficient for MVP
- **Impact**: Avoids complex hardware integration
- **How**: Use standard document upload only

#### 5. Demo/Training Mode 🔴 ACTION NEEDED

- **Components**:
  - DemoMode.tsx
  - DemoModeSwitcherPanel.tsx
  - All demo pages
- **Reason**: Focus on real functionality
- **Impact**: Simplifies testing and QA
- **How**: Remove demo mode toggle

### Implementation Steps

#### Today (May 27):

1. Comment out blockchain routes in router
2. Add feature flags for deferred features
3. Remove demo mode from navigation
4. Simplify AI assistant to basic chat

#### Tomorrow (May 28):

1. Remove biometric options from KYC flow
2. Hide advanced AI customization
3. Update documentation
4. Communicate changes to team

### Code Changes Needed

#### 1. In LoadableRouter.tsx:

```jsx
// Comment out these routes:
// <Route path="/blockchain/*" element={<BlockchainFeatures />} />
// <Route path="/demo/*" element={<DemoMode />} />
// <Route path="/ai/custom-agents" element={<CreateCustomAIAgent />} />
```

#### 2. In KYCVerificationFlow.tsx:

```jsx
// Remove biometric option:
const verificationMethods = [
  'document', // Keep only document upload
  // 'biometric', // Defer to post-MVP
];
```

#### 3. Create feature-flags.ts:

```typescript
export const FEATURE_FLAGS = {
  BLOCKCHAIN_ENABLED: false, // Enable post-MVP
  CUSTOM_AI_AGENTS: false, // Enable post-MVP
  BIOMETRIC_KYC: false, // Enable post-MVP
  DEMO_MODE: false, // Enable post-MVP
  ADVANCED_ANALYTICS: false, // Enable post-MVP
};
```

### Communication Template

**Subject: MVP Feature Deferrals - Action Required**

Team,

To ensure we hit our June 15 MVP deadline, we're deferring the following features:

1. **Financial Calculator** - Already hidden, needs post-MVP fixes
2. **Blockchain Integration** - Not critical for core lending flow
3. **Custom AI Agents** - Basic chat is sufficient
4. **Biometric KYC** - Standard document upload works fine
5. **Demo Mode** - Focus on real features

These features are documented in `POST-MVP-FEATURE-PRIORITIZATION.md` and will be our immediate priority after launch.

Please implement the changes in `MVP-FEATURE-DEFERRALS.md` by EOD May 28.

Questions? Let's discuss in standup.

### Expected Benefits

1. **Time Savings**: ~3 weeks of development/testing
2. **Reduced Complexity**: Fewer integration points
3. **Bundle Size**: Smaller, faster loading app
4. **Testing Focus**: Can test core features thoroughly
5. **Clear MVP**: Focused product for launch

### Success Criteria

By May 28 EOD:

- [ ] All deferred features are behind feature flags
- [ ] Routes to deferred features are disabled
- [ ] Team is aligned on MVP scope
- [ ] Documentation is updated
- [ ] No references to deferred features in UI

### Remember

**Better to launch a solid MVP than to delay for nice-to-have features!**
