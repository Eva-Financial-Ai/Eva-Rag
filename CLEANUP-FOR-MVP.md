# Cleanup Tasks for MVP

## Files to Remove Before Launch

### Test/Example Components

- [ ] `src/components/ButtonExample.tsx` - Example component
- [ ] `src/components/TestSignature.tsx` - Test component
- [ ] `src/pages/examples/MigrationExample.tsx` - Example page
- [ ] `src/pages/examples/LayoutSystemExample.tsx` - Example page
- [ ] `src/pages/ComponentSandbox.tsx` - Development only
- [ ] `src/pages/ComponentTest.tsx` - Test page
- [ ] `src/pages/DashboardTest.tsx` - Test page
- [ ] `src/pages/DashboardTestHelper.tsx` - Test helper

### Demo Pages (if demo mode is deferred)

- [ ] `src/pages/DemoMode.tsx`
- [ ] `src/pages/KYCVerificationDemo.tsx`
- [ ] `src/pages/TransactionRiskMapDemo.tsx`
- [ ] `src/pages/RiskCategoryDemoPage.tsx`
- [ ] `src/pages/CustomerTransactionDemo.tsx`
- [ ] `src/pages/eva-conversation-demo.tsx`
- [ ] `src/pages/customer-chat-demo.tsx`
- [ ] `src/components/DemoModeSwitcherPanel.tsx`

### Temporary/Debug Files

- [ ] All `.cleanup-backups/` directory
- [ ] All `test-*.js` files in root
- [ ] All `test-*.html` files in root
- [ ] Temporary markdown files from debugging

## Code Cleanup Tasks

### Remove Console Logs

**Current count: 522 console.log statements** ⚠️

```bash
# Find all console.log statements
grep -r "console.log" src/ --include="*.tsx" --include="*.ts" | wc -l

# Find files with most console.logs
grep -r "console.log" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -nr | head -10
```

### Remove Commented Code

- [ ] Search for large blocks of commented code
- [ ] Remove TODO comments that won't be addressed in MVP
- [ ] Clean up debugging comments

### Optimize Imports

- [ ] Remove unused imports
- [ ] Consolidate duplicate imports
- [ ] Order imports consistently

### Bundle Size Optimization

Current main bundle: 238.39 kB
Target: < 200 kB

Actions:

- [ ] Remove unused dependencies
- [ ] Lazy load non-critical routes
- [ ] Optimize image assets
- [ ] Remove unused CSS

## Routes to Disable

Add these to LoadableRouter.tsx with feature flags:

```typescript
// Blockchain routes
{isFeatureEnabled('BLOCKCHAIN_ENABLED') && (
  <Route path="/blockchain/*" element={<BlockchainRoutes />} />
)}

// Demo routes
{isFeatureEnabled('DEMO_MODE') && (
  <Route path="/demo/*" element={<DemoRoutes />} />
)}

// Custom AI routes
{isFeatureEnabled('CUSTOM_AI_AGENTS') && (
  <Route path="/ai/custom-agents" element={<CreateCustomAIAgent />} />
)}
```

## Navigation Items to Hide

Update SideNavigation.tsx to hide deferred features:

```typescript
const navigationItems = [
  // ... existing items

  // Conditionally show blockchain
  ...(isFeatureEnabled('BLOCKCHAIN_ENABLED')
    ? [
        {
          name: 'Blockchain',
          href: '/blockchain',
          icon: BlockchainIcon,
        },
      ]
    : []),

  // Hide demo mode
  // Remove demo navigation item completely
];
```

## Component Simplifications

### KYCVerificationFlow.tsx

- Remove biometric option
- Keep only document upload
- Simplify verification steps

### EVAAssistantManager.tsx

- Hide custom agent creation
- Keep basic chat functionality
- Remove advanced customization

### CalendarIntegration.tsx

- Disable Auth0 sync for MVP
- Keep basic calendar view
- Remove meeting scheduling

## Performance Optimizations

### Before MVP Launch:

1. Run bundle analyzer
2. Remove unused chunks
3. Enable production optimizations
4. Minify all assets
5. Enable gzip compression

### Commands to Run:

```bash
# Analyze bundle
npm run analyze

# Find unused dependencies
npm run find-unused

# Clean and rebuild
rm -rf node_modules build
npm install
npm run build
```

## Final Checklist

Before June 15:

- [ ] All test files removed
- [ ] Feature flags implemented
- [ ] Routes properly guarded
- [ ] Console logs removed
- [ ] Bundle size < 200KB
- [ ] No references to deferred features in UI
- [ ] Documentation updated
- [ ] Team aligned on scope

## Post-Cleanup Verification

Run these tests after cleanup:

1. Full build succeeds
2. All tests pass
3. No broken links
4. No console errors
5. Performance metrics met
