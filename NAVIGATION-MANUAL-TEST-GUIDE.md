# Navigation Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing every navigation item and sub-item in the EVA Platform left sidebar navigation.

## Pre-Testing Setup

### 1. Environment Preparation

- [ ] Ensure the application is running (`npm start`)
- [ ] Open browser developer tools (F12)
- [ ] Clear browser cache and cookies
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different screen sizes (Desktop, Tablet, Mobile)

### 2. Test Data Setup

- [ ] Ensure you have appropriate user permissions
- [ ] Check feature flags are configured correctly
- [ ] Verify you're in the correct environment (development/staging)

## Navigation Testing Checklist

### Level 1: Main Navigation Items

#### 1. Dashboard ✅

- **Path**: `/dashboard`
- **Test Steps**:
  - [ ] Click on "Dashboard" in sidebar
  - [ ] Verify navigation to dashboard page
  - [ ] Check active state highlighting
  - [ ] Verify URL changes to `/dashboard`
- **Expected Result**: Dashboard page loads with proper content
- **Notes**: Should be the default landing page

#### 2. Eva AI Assistant ✅

- **Path**: `/ai-assistant`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Click on "Eva AI Assistant" in sidebar
  - [ ] Verify navigation to AI assistant page
  - [ ] Check "New" badge is visible
  - [ ] Verify URL changes to `/ai-assistant`
- **Expected Result**: AI Assistant interface loads
- **Notes**: New feature, should have prominent badge

#### 3. Credit Application ✅ (Expandable)

- **Path**: `/credit-application`
- **Test Steps**:
  - [ ] Click on "Credit Application" main item
  - [ ] Verify submenu expands/collapses
  - [ ] Check expansion arrow rotates
  - [ ] Test direct navigation to main path
  - [ ] Verify all 3 sub-items are visible when expanded

##### 3.1 Auto Originations ✅

- **Path**: `/auto-originations`
- **Test Steps**:
  - [ ] Expand Credit Application menu
  - [ ] Click on "Auto Originations"
  - [ ] Verify navigation to auto originations page
  - [ ] Check parent menu stays expanded
- **Expected Result**: Auto originations page loads

##### 3.2 Transaction Summary ✅

- **Path**: `/transaction-summary`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Expand Credit Application menu
  - [ ] Click on "Transaction Summary"
  - [ ] Verify navigation to transaction summary page
  - [ ] Check "New" badge is visible
- **Expected Result**: Transaction summary page loads with data

##### 3.3 New Origination ✅ (Modal)

- **Path**: `#new-origination`
- **Test Steps**:
  - [ ] Expand Credit Application menu
  - [ ] Click on "New Origination"
  - [ ] Verify modal opens (APPLICATION_TYPE modal)
  - [ ] Check URL doesn't change
  - [ ] Test modal close functionality
- **Expected Result**: Application type selection modal opens

#### 4. Customer Retention ✅ (Complex Nested)

- **Path**: `/customer-retention`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Click on "Customer Retention" main item
  - [ ] Verify submenu expands with 5 sub-items
  - [ ] Check "New" badge is visible
  - [ ] Test navigation to main customer retention page

##### 4.1 Customers ✅ (Nested Expandable)

- **Path**: `/customer-retention/customers`
- **Test Steps**:
  - [ ] Expand Customer Retention menu
  - [ ] Click on "Customers" item
  - [ ] Verify it has its own submenu with 5 items
  - [ ] Test expansion/collapse of nested menu
  - [ ] Verify navigation to customers page

###### 4.1.1 Businesses ✅

- **Path**: `/customer-retention/customers?type=businesses`
- **Test Steps**:
  - [ ] Expand Customers submenu
  - [ ] Click on "Businesses"
  - [ ] Verify URL includes `?type=businesses`
  - [ ] Check page content filters to businesses
- **Expected Result**: Customer list filtered to businesses

###### 4.1.2 Business Owners ✅

- **Path**: `/customer-retention/customers?type=business-owners`
- **Test Steps**:
  - [ ] Expand Customers submenu
  - [ ] Click on "Business Owners"
  - [ ] Verify URL includes `?type=business-owners`
  - [ ] Check page content filters to business owners
- **Expected Result**: Customer list filtered to business owners

###### 4.1.3 Asset Sellers ✅

- **Path**: `/customer-retention/customers?type=asset-sellers`
- **Test Steps**:
  - [ ] Expand Customers submenu
  - [ ] Click on "Asset Sellers"
  - [ ] Verify URL includes `?type=asset-sellers`
  - [ ] Check page content filters to asset sellers
- **Expected Result**: Customer list filtered to asset sellers

###### 4.1.4 Brokers & Originators ✅

- **Path**: `/customer-retention/customers?type=brokers-originators`
- **Test Steps**:
  - [ ] Expand Customers submenu
  - [ ] Click on "Brokers & Originators"
  - [ ] Verify URL includes `?type=brokers-originators`
  - [ ] Check page content filters to brokers & originators
- **Expected Result**: Customer list filtered to brokers & originators

###### 4.1.5 Service Providers ✅

- **Path**: `/customer-retention/customers?type=service-providers`
- **Test Steps**:
  - [ ] Expand Customers submenu
  - [ ] Click on "Service Providers"
  - [ ] Verify URL includes `?type=service-providers`
  - [ ] Check page content filters to service providers
- **Expected Result**: Customer list filtered to service providers

##### 4.2 Contacts ✅

- **Path**: `/customer-retention/contacts`
- **Test Steps**:
  - [ ] Expand Customer Retention menu
  - [ ] Click on "Contacts"
  - [ ] Verify navigation to contacts page
  - [ ] Check contact management interface loads
- **Expected Result**: Contacts management page loads

##### 4.3 Commitments ✅

- **Path**: `/customer-retention/commitments`
- **Test Steps**:
  - [ ] Expand Customer Retention menu
  - [ ] Click on "Commitments"
  - [ ] Verify navigation to commitments page
  - [ ] Check commitments interface loads
- **Expected Result**: Commitments management page loads

##### 4.4 Calendar Integration ✅

- **Path**: `/calendar-integration`
- **Test Steps**:
  - [ ] Expand Customer Retention menu
  - [ ] Click on "Calendar Integration"
  - [ ] Verify navigation to calendar integration page
  - [ ] Check calendar interface loads
- **Expected Result**: Calendar integration page loads

##### 4.5 Post Closing Customers ✅

- **Path**: `/post-closing`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Expand Customer Retention menu
  - [ ] Click on "Post Closing Customers"
  - [ ] Verify navigation to post-closing page
  - [ ] Check "New" badge is visible
- **Expected Result**: Post-closing customers page loads

#### 5. Filelock Drive ✅ (Expandable)

- **Path**: `/documents`
- **Test Steps**:
  - [ ] Click on "Filelock Drive" main item
  - [ ] Verify submenu expands with 3 sub-items
  - [ ] Test navigation to main documents page

##### 5.1 Document Management ✅

- **Path**: `/documents`
- **Test Steps**:
  - [ ] Expand Filelock Drive menu
  - [ ] Click on "Document Management"
  - [ ] Verify navigation to documents page
  - [ ] Check document management interface loads
- **Expected Result**: Document management page loads

##### 5.2 Shield Vault ✅

- **Path**: `/shield-vault`
- **Test Steps**:
  - [ ] Expand Filelock Drive menu
  - [ ] Click on "Shield Vault"
  - [ ] Verify navigation to shield vault page
  - [ ] Check secure vault interface loads
- **Expected Result**: Shield Vault secure interface loads

##### 5.3 Safe Forms ✅

- **Path**: `/forms`
- **Test Steps**:
  - [ ] Expand Filelock Drive menu
  - [ ] Click on "Safe Forms"
  - [ ] Verify navigation to forms page
  - [ ] Check forms interface loads
- **Expected Result**: Safe Forms page loads

#### 6. Risk Map Navigator ✅ (Expandable)

- **Path**: `/risk-assessment`
- **Test Steps**:
  - [ ] Click on "Risk Map Navigator" main item
  - [ ] Verify submenu expands with 2 sub-items
  - [ ] Test navigation to main risk assessment page

##### 6.1 EVA Risk Report & Score ✅

- **Path**: `/risk-assessment/eva-report`
- **Test Steps**:
  - [ ] Expand Risk Map Navigator menu
  - [ ] Click on "EVA Risk Report & Score"
  - [ ] Verify navigation to EVA report page
  - [ ] Check risk report interface loads
- **Expected Result**: EVA Risk Report page loads with scoring interface

##### 6.2 RiskLab ✅

- **Path**: `/risk-assessment/lab`
- **Test Steps**:
  - [ ] Expand Risk Map Navigator menu
  - [ ] Click on "RiskLab"
  - [ ] Verify navigation to risk lab page
  - [ ] Check lab interface loads with `?tab=lab`
- **Expected Result**: RiskLab page loads with laboratory interface

#### 7. Deal Structuring ✅ (Expandable)

- **Path**: `/deal-structuring`
- **Test Steps**:
  - [ ] Click on "Deal Structuring" main item
  - [ ] Verify submenu expands with 3 sub-items
  - [ ] Test navigation to main deal structuring page

##### 7.1 Structure Editor ✅

- **Path**: `/deal-structuring`
- **Test Steps**:
  - [ ] Expand Deal Structuring menu
  - [ ] Click on "Structure Editor"
  - [ ] Verify navigation to structure editor page
  - [ ] Check editor interface loads
- **Expected Result**: Deal structure editor loads

##### 7.2 Smart Match ✅

- **Path**: `/deal-structuring/smart-match`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Expand Deal Structuring menu
  - [ ] Click on "Smart Match"
  - [ ] Verify navigation to smart match page
  - [ ] Check "New" badge is visible
- **Expected Result**: Smart Match interface loads

##### 7.3 Transaction Execution ✅

- **Path**: `/transaction-execution`
- **Badge**: "New"
- **Test Steps**:
  - [ ] Expand Deal Structuring menu
  - [ ] Click on "Transaction Execution"
  - [ ] Verify navigation to transaction execution page
  - [ ] Check "New" badge is visible
- **Expected Result**: Transaction execution interface loads

#### 8. Asset Press ✅ (Expandable)

- **Path**: `/asset-press`
- **Badge**: "Beta"
- **Test Steps**:
  - [ ] Click on "Asset Press" main item
  - [ ] Verify submenu expands with 2 sub-items
  - [ ] Check "Beta" badge is visible
  - [ ] Test navigation to main asset press page

##### 8.1 Asset Press ✅

- **Path**: `/asset-press`
- **Test Steps**:
  - [ ] Expand Asset Press menu
  - [ ] Click on "Asset Press" sub-item
  - [ ] Verify navigation to asset press page
  - [ ] Check asset press interface loads
- **Expected Result**: Asset Press main interface loads

##### 8.2 Asset Marketplace ✅

- **Path**: `/commercial-market`
- **Test Steps**:
  - [ ] Expand Asset Press menu
  - [ ] Click on "Asset Marketplace"
  - [ ] Verify navigation to commercial market page
  - [ ] Check marketplace interface loads
- **Expected Result**: Asset Marketplace interface loads

#### 9. Portfolio Navigator ✅ (Expandable)

- **Path**: `/portfolio-wallet`
- **Badge**: "Beta"
- **Test Steps**:
  - [ ] Click on "Portfolio Navigator" main item
  - [ ] Verify submenu expands with 2 sub-items
  - [ ] Check "Beta" badge is visible
  - [ ] Test navigation to main portfolio page

##### 9.1 Portfolio Wallet ✅

- **Path**: `/portfolio-wallet`
- **Test Steps**:
  - [ ] Expand Portfolio Navigator menu
  - [ ] Click on "Portfolio Wallet"
  - [ ] Verify navigation to portfolio wallet page
  - [ ] Check wallet interface loads
- **Expected Result**: Portfolio Wallet interface loads

##### 9.2 Asset Portfolio ✅

- **Path**: `/asset-portfolio`
- **Test Steps**:
  - [ ] Expand Portfolio Navigator menu
  - [ ] Click on "Asset Portfolio"
  - [ ] Verify navigation to asset portfolio page
  - [ ] Check portfolio interface loads
- **Expected Result**: Asset Portfolio interface loads

#### 10. Demo Mode ⚠️ (Conditional)

- **Path**: `/demo-mode`
- **Badge**: "Development"
- **Test Steps**:
  - [ ] Check if item is visible (development environment only)
  - [ ] If visible, click on "Demo Mode"
  - [ ] Verify navigation to demo mode page
  - [ ] Check "Development" badge is visible
- **Expected Result**: Demo mode interface loads (if feature enabled)
- **Notes**: Only visible in development environment

#### 11. Team Management ⚠️ (Conditional)

- **Path**: `/team-management`
- **Badge**: "Auth0"
- **Test Steps**:
  - [ ] Check if item is visible (feature flag dependent)
  - [ ] If visible, click on "Team Management"
  - [ ] Verify navigation to team management page
  - [ ] Check "Auth0" badge is visible
- **Expected Result**: Team management interface loads (if feature enabled)
- **Notes**: Depends on feature flag configuration

## Sidebar Functionality Testing

### Sidebar Toggle

- **Test Steps**:
  - [ ] Click sidebar toggle button (hamburger/arrow icon)
  - [ ] Verify sidebar collapses/expands
  - [ ] Check icons remain visible when collapsed
  - [ ] Test tooltips appear on hover when collapsed
  - [ ] Verify toggle button changes icon appropriately

### Mobile Responsiveness

- **Test Steps**:
  - [ ] Resize browser to mobile width (< 768px)
  - [ ] Verify sidebar becomes overlay
  - [ ] Test mobile menu toggle
  - [ ] Check touch interactions work
  - [ ] Verify sidebar closes after navigation on mobile

### Keyboard Navigation

- **Test Steps**:
  - [ ] Use Tab key to navigate through items
  - [ ] Test Enter/Space to activate items
  - [ ] Use arrow keys for submenu navigation
  - [ ] Test Escape key to close expanded menus
  - [ ] Verify focus indicators are visible

### Accessibility Testing

- **Test Steps**:
  - [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
  - [ ] Verify ARIA labels are announced correctly
  - [ ] Check color contrast meets WCAG standards
  - [ ] Test high contrast mode compatibility
  - [ ] Verify keyboard-only navigation works

## Browser-Specific Testing

### Chrome

- [ ] All navigation items work
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Performance is acceptable

### Firefox

- [ ] All navigation items work
- [ ] CSS compatibility verified
- [ ] No console errors
- [ ] Touch events work on touch devices

### Safari

- [ ] All navigation items work
- [ ] iOS compatibility verified
- [ ] Touch gestures work properly
- [ ] No webkit-specific issues

### Edge

- [ ] All navigation items work
- [ ] Legacy compatibility if needed
- [ ] No console errors
- [ ] Performance is acceptable

## Performance Testing

### Load Time

- [ ] Sidebar renders quickly on page load
- [ ] Navigation items appear without delay
- [ ] Icons load properly
- [ ] No layout shift during load

### Interaction Performance

- [ ] Menu expansion is smooth (< 300ms)
- [ ] Navigation transitions are fluid
- [ ] No lag on hover effects
- [ ] Responsive to user input

## Error Scenarios

### Network Issues

- [ ] Test navigation with slow network
- [ ] Verify graceful handling of failed requests
- [ ] Check offline behavior if applicable

### Invalid Routes

- [ ] Test navigation to non-existent routes
- [ ] Verify error handling for broken links
- [ ] Check fallback behavior

### Permission Issues

- [ ] Test navigation with insufficient permissions
- [ ] Verify restricted items are hidden/disabled
- [ ] Check error messages for unauthorized access

## Reporting Issues

### Issue Template

```
**Navigation Item**: [Item Name]
**Path**: [URL Path]
**Browser**: [Browser Name and Version]
**Device**: [Desktop/Mobile/Tablet]
**Issue Description**: [Detailed description]
**Steps to Reproduce**: [Step-by-step instructions]
**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Screenshots**: [If applicable]
**Console Errors**: [Any JavaScript errors]
```

### Severity Levels

- **Critical**: Navigation completely broken, blocks user workflow
- **High**: Major functionality missing, significant UX impact
- **Medium**: Minor functionality issues, workarounds available
- **Low**: Cosmetic issues, no functional impact

## Test Completion Checklist

- [ ] All 35+ navigation items tested
- [ ] All expansion/collapse functionality verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Error scenarios handled gracefully
- [ ] Documentation updated with findings

## Automated Testing Integration

After manual testing, run the automated audit:

```javascript
// In browser console
navigationAudit.runAudit();
```

Or use the test script:

```bash
node navigation-audit-test.js
```

---

**Testing Completed By**: [Tester Name]
**Date**: [Test Date]
**Environment**: [Development/Staging/Production]
**Overall Status**: [Pass/Fail/Needs Review]
