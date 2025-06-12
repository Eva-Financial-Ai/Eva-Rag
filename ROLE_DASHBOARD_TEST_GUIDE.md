# 📊 Analytics Dashboard Testing Guide

**Version:** 1.2.0 | **Updated:** January 20, 2025  
**Purpose:** Verify the main Analytics Dashboard role-based functionality and dynamic content

## 🎯 **Overview**

The Analytics Dashboard is EVA's main dashboard that provides personalized interfaces based on user type. In production, the user type is determined by the signup process. In dev/staging, a role selector allows testing all user types.

## 🚀 Quick Test Instructions

### 1. Start Development Server

```bash
npm start
# Server starts at http://localhost:3002
```

### 2. Navigate to Analytics Dashboard

```bash
# Multiple ways to access the main Analytics Dashboard:
http://localhost:3002/dashboard        # Primary route (nav links point here)
http://localhost:3002/analytics        # Alternative route
http://localhost:3002/                 # Root redirects to dashboard

# Dev/staging direct access:
http://localhost:3002/role-dashboard
```

### 3. Test User Type Switching (Dev/Staging Only)

**⚠️ REDUNDANCY NOTICE**: Two role selectors currently exist:

- **Top-left corner**: Primary selector (Vendor/Sales Representative dropdown)
- **Dashboard top-right**: Secondary selector ("🛠️ Dev/Staging: Role Selector")

**Both work for testing** - choose either one:

- **Borrower** (Blue theme + white fonts)
- **Lender** (Green theme)
- **Broker** (Purple theme)
- **Vendor** (Orange theme)
- **Admin** (Gray theme)

**Production Note**: Neither selector will exist - user type determined by signup process.
**Design Rule**: Blue backgrounds always use white fonts (never red).

## 🎯 What Should Change When Switching Roles

### 🔄 Visual Changes (Immediate)

- **Header Color**: Background gradient changes per role
- **User Name**: Updates to role-specific name
- **Dashboard Title**: "Borrower Dashboard", "Lender Dashboard", etc.
- **Loading Indicator**: 🔄 emoji appears briefly during switch

### 📊 Quick Stats Changes (300ms delay)

Each role shows completely different metrics:

#### 👤 Borrower Stats

- Active Applications: 3
- Approved Loans: 1
- Pending Reviews: 2
- Total Funding: $750,000

#### 🏦 Lender Stats

- Total Applications: 47
- Approved Loans: 28
- Portfolio Value: $12.5M
- Average Risk Score: 78

#### 🤝 Broker Stats

- Active Clients: 23
- Completed Deals: 15
- Total Commissions: $45,230
- This Month: $12,500

#### 🛠️ Vendor Stats

- Active Contracts: 12
- Monthly Revenue: $89,450
- Client Count: 8
- Services Offered: 5

#### ⚙️ Admin Stats

- Total Users: 156
- Active Sessions: 23
- System Health: 98%
- Daily Transactions: 89

### 🎨 Feature Grid Changes

Different features appear for each role:

#### 👤 Borrower Features (4 features)

- 📋 Credit Application
- 📁 Document Center
- 📊 Application Status
- 🏢 Business Profile

#### 🏦 Lender Features (4 features)

- 💼 Loan Portfolio
- ⚖️ Risk Assessment
- 🔍 Underwriting Center
- 📈 Performance Analytics

#### 🤝 Broker Features (4 features)

- 👥 Client Management
- 🔄 Transaction Hub
- 💰 Commission Tracker
- 🌐 Lender Network

#### 🛠️ Vendor Features (3 features)

- 🛠️ Service Management
- 💳 Billing & Invoicing
- 🎯 Client Portal

#### ⚙️ Admin Features (All features + admin-only)

- 🔐 Access Control (Coming Soon)
- 👁️ Audit & Monitoring (Coming Soon)

### 📋 Workflow Section Changes

The bottom workflow section shows role-specific processes:

#### 👤 Borrower Workflow: "Your Lending Journey"

1. **Apply** (Blue) - Complete credit application
2. **Documents** (Yellow) - Upload required documents
3. **Approval** (Green) - Track status and funding

#### 🏦 Lender Workflow: "Lending Workflow"

1. **Review** (Blue) - Review incoming applications
2. **Assess** (Yellow) - Use EVA Risk Assessment
3. **Decide** (Green) - Make lending decisions

#### 🤝 Broker Workflow: "Transaction Management"

1. **Connect** (Blue) - Match borrowers with lenders
2. **Facilitate** (Yellow) - Manage documentation
3. **Close** (Green) - Complete transactions

#### 🛠️ Vendor Workflow: "Service Management"

1. **Services** (Blue) - Provide specialized services
2. **Contracts** (Yellow) - Manage agreements
3. **Billing** (Green) - Track payments

#### ⚙️ Admin Workflow: "Admin Dashboard"

1. **Monitor** (Blue) - System health monitoring
2. **Manage** (Yellow) - User roles and configuration
3. **Analytics** (Green) - Platform insights

## 🧪 Debugging & Console Logs

### Expected Console Output

When switching roles, you should see:

```javascript
🔄 Role switching from borrower to lender
📊 Generating stats for role: lender
✅ Features loaded for role: lender Feature count: 4
```

### Toast Notifications

- Success: "🎯 Switched to [Role] Dashboard"
- Feature clicks: "Navigating to [Feature Name]"
- Coming Soon: "[Feature] is coming soon! Expected after July 15th, 2025"

## 🐛 Troubleshooting

### Issue: Role Not Switching

**Symptoms:** Dropdown changes but content stays the same
**Check:** Browser console for error messages
**Fix:** Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: Loading States Stuck

**Symptoms:** 🔄 indicator never disappears
**Check:** Network tab for failed requests
**Fix:** Restart development server

### Issue: Features Not Updating

**Symptoms:** Same features show for all roles
**Check:** Component key prop updates in React DevTools
**Fix:** Clear browser cache and localStorage

### Issue: Missing Features

**Symptoms:** Empty feature grid
**Check:** Console for filtering errors
**Debug:** Role permissions and allowedRoles array

## 📱 Mobile Testing

### Responsive Breakpoints

- **Mobile**: < 640px (features in 1 column)
- **Tablet**: 640px - 1024px (features in 2 columns)
- **Desktop**: > 1024px (features in 3-4 columns)

### Mobile-Specific Tests

- [ ] Role switcher dropdown works on touch
- [ ] Stats grid responsive (2x2 on mobile)
- [ ] Feature cards stack properly
- [ ] Workflow cards stack vertically
- [ ] Chat integration doesn't interfere

## ✅ Complete Test Checklist

### Basic Functionality

- [ ] Page loads without errors
- [ ] Role dropdown populates correctly
- [ ] All 5 roles selectable

### Role Switching

- [ ] Header color changes immediately
- [ ] User name updates
- [ ] Loading state appears briefly
- [ ] Toast notification shows

### Dynamic Content

- [ ] Quick stats update with role-specific data
- [ ] Feature grid filters by role
- [ ] Workflow section shows role-specific steps
- [ ] Coming Soon badges work

### Performance

- [ ] Role switch completes in < 500ms
- [ ] No console errors
- [ ] Animations smooth
- [ ] Loading states don't hang

### Mobile Experience

- [ ] Responsive layout works
- [ ] Touch interactions functional
- [ ] Text readable at all sizes
- [ ] Navigation remains accessible

## 🎉 Success Criteria

**✅ Test Passes If:**

1. All 5 roles show different content
2. Switching happens smoothly with loading states
3. Console shows expected debugging logs
4. Toast notifications appear
5. No JavaScript errors in console
6. Mobile responsive design works
7. Features filter correctly by role
8. Statistics update appropriately

## 🔧 Development Tools

### Browser DevTools

```javascript
// Check current role state
window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
// Look for RoleBasedDashboard component state
```

### React DevTools

- Components tab → RoleBasedDashboard
- Check `activeUser.role` state
- Verify `availableFeatures` array updates
- Monitor `quickStats` object changes

---

**📝 Notes:**

- Testing should be done in Chrome, Firefox, Safari, and Edge
- Check both light and dark mode if implemented
- Verify accessibility with screen readers
- Test keyboard navigation (Tab, Enter, Escape)

**🎯 Expected Result:**
Dynamic, role-aware dashboard that provides users with personalized content based on their role in the lending ecosystem.
