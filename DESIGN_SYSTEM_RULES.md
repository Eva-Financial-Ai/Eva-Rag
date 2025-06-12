# 🎨 EVA Platform Design System Rules

**Version:** 1.0.0 | **Updated:** January 20, 2025  
**Purpose:** Strict design guidelines for enterprise-grade professional interface

## 🚨 **CRITICAL DESIGN RULES**

### **Rule #1: Blue Background Typography**

**STRICT REQUIREMENT:** Blue backgrounds ALWAYS use white fonts, never red

```css
/* ✅ CORRECT */
.bg-blue-600 {
  color: white;
}
.from-blue-600.to-blue-700 {
  color: white;
}

/* ❌ FORBIDDEN */
.bg-blue-600 {
  color: red;
}
.bg-blue-600 .text-red-500 {
  /* Never allowed */
}
```

**Enforcement:**

- CSS rules automatically override red text on blue backgrounds
- Global styles enforce white text on all blue gradient backgrounds
- Borrower theme specifically enforces blue + white combination

### **Rule #2: Role-Based Color Themes**

Each user type has designated theme colors:

| Role        | Theme Color      | Text Color | Usage                      |
| ----------- | ---------------- | ---------- | -------------------------- |
| 👤 Borrower | Blue (#2563eb)   | White      | Headers, buttons, accents  |
| 🏦 Lender   | Green (#16a34a)  | White/Dark | Portfolio, approval states |
| 🤝 Broker   | Purple (#9333ea) | White      | Transaction, commission    |
| 🛠️ Vendor   | Orange (#ea580c) | White/Dark | Service, billing           |
| ⚙️ Admin    | Gray (#4b5563)   | White      | System, management         |

### **Rule #3: Accessibility Standards**

- **Contrast Ratio**: Minimum 4.5:1 for normal text
- **Color Blindness**: Never rely on color alone for information
- **Focus States**: Visible focus indicators on all interactive elements
- **Text Size**: Minimum 14px for body text, 16px preferred

## 🔧 **Development Environment Rules**

### **Dev/Staging Redundancy (Current Issue)**

**Problem**: Two role selectors exist temporarily:

- **Top-left corner**: Primary dev/staging selector (Vendor/Sales Representative)
- **Dashboard top-right**: Secondary testing selector

**Resolution Plan:**

1. **Phase 1**: Document redundancy (current)
2. **Phase 2**: Consolidate to single selector
3. **Phase 3**: Remove all selectors for production

**Production**: Role determined by user signup - no manual selectors

### **Prototype Functionality**

Current complex logic demonstrates full system capabilities:

- Multiple role switching mechanisms
- Complete user type coverage
- Comprehensive feature testing
- Real-time theme switching

## 📐 **Layout Standards**

### **Dashboard Headers**

```tsx
// ✅ CORRECT - Blue theme with white text
<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
  <h1 className="text-3xl font-bold text-white">Welcome back, {name}</h1>
</div>

// ❌ INCORRECT - Blue theme with red text
<div className="bg-gradient-to-r from-blue-600 to-blue-700">
  <h1 className="text-3xl font-bold text-red-500">Welcome back, {name}</h1>
</div>
```

### **Button Standards**

- **Primary**: Blue background, white text
- **Secondary**: White background, blue border/text
- **Destructive**: Red background, white text
- **Disabled**: Gray background, gray text

### **Status Indicators**

- **Success**: Green (#16a34a)
- **Warning**: Yellow (#ca8a04)
- **Error**: Red (#dc2626)
- **Info**: Blue (#2563eb)
- **Neutral**: Gray (#6b7280)

## 🎯 **Component Guidelines**

### **Role-Based Dashboard**

- Theme colors must match user role
- Loading states with appropriate theme colors
- Statistics cards use theme-appropriate backgrounds
- Feature cards maintain consistent spacing and typography

### **Navigation Elements**

- Left sidebar maintains neutral colors
- Top navigation adapts to current page context
- Breadcrumbs use consistent gray tones
- Active states use appropriate theme colors

### **Forms and Inputs**

- Input borders: Gray (#d1d5db) default, blue (#2563eb) focus
- Labels: Dark gray (#374151) for readability
- Error states: Red (#dc2626) border and text
- Success states: Green (#16a34a) border and text

## 🛡️ **Implementation Enforcement**

### **CSS Classes Available**

```css
/* Theme enforcement classes */
.borrower-theme     /* Blue + White enforced */
.lender-theme       /* Green theme */
.broker-theme       /* Purple theme */
.vendor-theme       /* Orange theme */
.admin-theme        /* Gray theme */

/* Typography enforcement */
.blue-bg-white-text /* Forces white text on blue */
.no-red-on-blue     /* Prevents red text on blue */
```

### **React Components**

```tsx
// Use theme-aware components
<ThemeProvider theme={userRole}>
  <Dashboard />
</ThemeProvider>

// Enforce color rules
<BlueBackground className="text-white">
  <Content />
</BlueBackground>
```

## 🧪 **Testing Requirements**

### **Visual Regression Testing**

- [ ] All role themes display correctly
- [ ] Blue backgrounds always show white text
- [ ] No red text appears on blue backgrounds
- [ ] Contrast ratios meet accessibility standards

### **Role Switching Testing**

- [ ] Theme colors update immediately
- [ ] Typography follows theme rules
- [ ] Loading states maintain theme consistency
- [ ] Error states don't break color rules

### **Accessibility Testing**

- [ ] Screen reader compatibility
- [ ] Keyboard navigation functionality
- [ ] Color contrast validation
- [ ] Focus indicator visibility

## 📝 **Documentation Requirements**

### **Code Comments**

```tsx
// DESIGN RULE: Blue backgrounds must use white text
const BorrowerHeader = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
    {/* White text enforced by design system */}
    <h1 className="text-white">Dashboard</h1>
  </div>
);
```

### **PR Requirements**

- [ ] Design system compliance verified
- [ ] Color contrast tested
- [ ] Accessibility standards met
- [ ] Cross-browser compatibility confirmed

---

**Enforcement Level:** STRICT  
**Violations:** Block deployment  
**Contact:** Design System Team

**Remember:** Professional, enterprise-grade interfaces require consistent, accessible design patterns. These rules ensure EVA maintains the highest visual standards across all user types and environments.
