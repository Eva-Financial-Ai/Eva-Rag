# Typography Migration Guide

## Overview
This guide helps migrate EVA AI components to the new unified typography system with Helvetica Neue primary font, Inter backup, and 12% size increase.

## ✅ What's Already Done
- ✅ Unified typography system created (`unified-typography-system.css`)
- ✅ Typography overrides implemented (`typography-overrides.css`)
- ✅ Font stack: Helvetica Neue → Inter → System fonts
- ✅ 12% font size increase applied globally
- ✅ Financial-specific styling for currency/data
- ✅ Accessibility and responsive considerations

## 🎯 Migration Strategy

### Phase 1: Global Override (COMPLETED)
All components now automatically use the unified system via CSS overrides.

### Phase 2: Component-by-Component Refinement
Update individual components to use utility classes for better maintainability.

### Phase 3: Clean Up Legacy CSS
Remove old font declarations and conflicting styles.

## 📋 Component Classes Reference

### Font Families
```css
.font-primary    /* Helvetica Neue, Inter, system */
.font-secondary  /* Inter, Helvetica Neue, system */
.font-mono       /* SF Mono, Monaco, Cascadia Code */
.font-display    /* For headlines and display text */
```

### Font Sizes (12% increase applied)
```css
.text-xs         /* 13px - small labels */
.text-sm         /* 16px - secondary text */
.text-base       /* 18px - body text (was 16px) */
.text-lg         /* 20px - emphasized text */
.text-xl         /* 22px - section headers */
.text-2xl        /* 27px - page headers */
.text-3xl        /* 34px - major titles */
.text-4xl        /* 40px - hero text */
```

### Font Weights
```css
.font-light      /* 300 */
.font-normal     /* 400 */
.font-medium     /* 500 */
.font-semibold   /* 600 */
.font-bold       /* 700 */
.font-extrabold  /* 800 */
```

### Financial-Specific Classes
```css
.currency        /* For monetary values */
.amount         /* For financial amounts */
.data-table     /* For financial data tables */
```

## 🔄 Component Migration Examples

### Before: Legacy Dashboard Component
```jsx
<div className="dashboard-card" style={{fontSize: '14px'}}>
  <h3 style={{fontFamily: 'Roboto', fontSize: '16px'}}>Total Applications</h3>
  <div className="metric-value">$1,234,567</div>
</div>
```

### After: Unified Typography
```jsx
<div className="dashboard-card">
  <h3 className="text-xl font-semibold">Total Applications</h3>
  <div className="currency text-3xl">$1,234,567</div>
</div>
```

### Before: Legacy Form Component
```jsx
<form style={{fontFamily: 'Arial'}}>
  <label style={{fontSize: '12px', fontWeight: 'bold'}}>
    Loan Amount
  </label>
  <input type="text" style={{fontSize: '14px'}} />
  <button style={{fontSize: '16px', fontFamily: 'Helvetica'}}>
    Submit
  </button>
</form>
```

### After: Unified Typography
```jsx
<form className="font-primary">
  <label className="text-sm font-medium">
    Loan Amount
  </label>
  <input type="text" className="text-base" />
  <button className="text-base font-medium">
    Submit
  </button>
</form>
```

## 📊 Typography Hierarchy for Financial Apps

### 1. Page Titles
```jsx
<h1 className="text-4xl font-bold">Loan Dashboard</h1>
```

### 2. Section Headers
```jsx
<h2 className="text-3xl font-semibold">Application Summary</h2>
```

### 3. Card Titles
```jsx
<h3 className="text-xl font-semibold">Monthly Metrics</h3>
```

### 4. Data Labels
```jsx
<label className="text-sm font-medium tracking-wide uppercase">
  Interest Rate
</label>
```

### 5. Financial Values
```jsx
<span className="currency text-2xl">$125,000.00</span>
```

### 6. Body Text
```jsx
<p className="text-base leading-relaxed">
  This loan application requires additional documentation...
</p>
```

### 7. Small Text/Captions
```jsx
<small className="text-sm text-gray-600">
  * Subject to credit approval
</small>
```

## 🎨 Component-Specific Guidelines

### Dashboard Metrics
```jsx
<div className="metric-card">
  <div className="text-sm font-medium uppercase tracking-wide text-gray-500">
    Total Applications
  </div>
  <div className="text-3xl font-bold text-gray-900">
    1,247
  </div>
  <div className="text-sm text-green-600">
    +12% from last month
  </div>
</div>
```

### Data Tables
```jsx
<table className="data-table">
  <thead>
    <tr>
      <th className="text-sm font-semibold uppercase tracking-wide">
        Application ID
      </th>
      <th className="text-sm font-semibold uppercase tracking-wide">
        Amount
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="text-base">APP-2024-001</td>
      <td className="currency">$75,000</td>
    </tr>
  </tbody>
</table>
```

### Forms
```jsx
<div className="form-group">
  <label className="text-sm font-medium text-gray-700">
    Loan Amount
  </label>
  <input 
    type="text" 
    className="text-base font-normal"
    placeholder="Enter amount"
  />
  <p className="text-sm text-gray-500 mt-1">
    Minimum amount: $10,000
  </p>
</div>
```

### Buttons
```jsx
<button className="btn-primary text-base font-medium">
  Submit Application
</button>

<button className="btn-secondary text-sm font-normal">
  Cancel
</button>
```

### Navigation
```jsx
<nav className="sidebar">
  <div className="text-lg font-semibold text-gray-900">
    EVA AI
  </div>
  <ul className="nav-links">
    <li>
      <a href="/dashboard" className="text-base font-normal">
        Dashboard
      </a>
    </li>
    <li>
      <a href="/applications" className="text-base font-normal">
        Applications
      </a>
    </li>
  </ul>
</nav>
```

## 🧹 Cleanup Checklist

### Remove These Legacy Patterns:
- [ ] `style={{fontSize: '...'}}`
- [ ] `style={{fontFamily: '...'}}`
- [ ] `style={{fontWeight: '...'}}`
- [ ] Component-specific font CSS
- [ ] Hardcoded font sizes
- [ ] Multiple font family declarations

### Replace With:
- [ ] Utility classes (`text-*`, `font-*`)
- [ ] CSS variables (`var(--font-size-*)`)
- [ ] Semantic class names
- [ ] Consistent spacing and hierarchy

## 🔍 Testing Your Migration

### Visual Checks:
1. All text uses Helvetica Neue (falls back to Inter)
2. Font sizes are noticeably larger (12% increase)
3. Consistent spacing and hierarchy
4. Financial values use monospace font
5. Responsive behavior works on mobile

### Browser Testing:
```bash
# Check font loading in DevTools
1. Open browser DevTools
2. Go to Network tab
3. Filter by "Fonts"
4. Verify Inter loads from Google Fonts
5. Check Computed styles show correct font-family
```

### Accessibility Testing:
```bash
# Minimum font sizes
- Mobile: Never below 16px for form inputs
- Desktop: 18px base size
- Headers: Proper size hierarchy maintained
```

## 🚀 Implementation Steps

1. **Immediate Effect**: Typography overrides are already active
2. **Verify Changes**: Check your app - fonts should already be updated
3. **Component Updates**: Gradually replace inline styles with utility classes
4. **Testing**: Verify readability and hierarchy
5. **Cleanup**: Remove old CSS files and conflicting declarations

## 📱 Mobile Considerations

The system automatically adjusts for mobile:
- Base font size: 16px minimum (iOS/Android requirement)
- Heading sizes scale down appropriately
- Touch targets maintain adequate size
- Form inputs never trigger zoom

## 🎯 Success Metrics

After migration, you should see:
- ✅ Consistent Helvetica Neue/Inter across all components
- ✅ 12% larger text for better readability
- ✅ Proper hierarchy and spacing
- ✅ Financial data in monospace font
- ✅ Responsive typography on all devices
- ✅ Improved accessibility scores

## 🔧 Troubleshooting

### Font Not Loading?
Check browser DevTools Network tab for Inter font loading errors.

### Styles Not Applying?
Typography overrides use `!important` and should override everything. Check CSS import order.

### Mobile Issues?
Verify viewport meta tag and responsive breakpoints.

### Financial Data Hard to Read?
Use `.currency` or `.font-mono` classes for monetary values.

---

**Next Steps**: Once you provide the target UI reference, we can create specific component templates to match your desired design! 