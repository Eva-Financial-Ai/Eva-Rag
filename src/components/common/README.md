# 🧩 Common Components Library

This directory contains reusable UI components that are shared across the EVA Financial Platform. These components provide consistent design patterns and functionality throughout the application.

## 🌟 Featured Components

### 📋 WorkflowStepper
**New in v1.1.0** - Comprehensive workflow visualization component with user-type customization.

```typescript
import WorkflowStepper from './WorkflowStepper';

<WorkflowStepper 
  currentStage="smart_matching_decision"
  showOnlyCurrentAndPrevious={true}
  className="mb-6"
/>
```

**Features:**
- ✅ Dynamic step display with customizable visibility
- ✅ User-type adaptation (Lender, Broker, Business specific content)
- ✅ Progress tracking with visual progress bar
- ✅ Status indicators (completed, current, upcoming)
- ✅ Responsive design
- ✅ Full test coverage (22/22 tests passing)

**Props:**
- `currentStage`: Current workflow stage
- `showOnlyCurrentAndPrevious`: Boolean to control step visibility
- `className`: Additional CSS classes

### 🎯 EnhancedUserTypeSelector
**Enhanced in v1.1.0** - Advanced role switching with dashboard previews.

```typescript
import EnhancedUserTypeSelector from './EnhancedUserTypeSelector';

<EnhancedUserTypeSelector 
  mode="compact" // or "full"
  showPermissions={true}
  onUserTypeChange={handleUserTypeChange}
/>
```

**Features:**
- ✅ Role switching with dashboard previews
- ✅ Permission summaries and feature availability
- ✅ Compact and full display modes
- ✅ Visual feedback and user experience enhancements
- ✅ Integration with role-based dashboard system

### 💰 TransactionSelector
**Enhanced in v1.1.0** - Central transaction context broadcasting.

```typescript
import TransactionSelector from './TransactionSelector';

<TransactionSelector 
  fixedPosition={true}
  selectedCustomerId="customer-001"
  onTransactionChange={handleTransactionChange}
/>
```

**Features:**
- ✅ Context-aware transaction selection
- ✅ Customer filtering integration
- ✅ Real-time context broadcasting
- ✅ Enhanced dropdown with transaction details
- ✅ Risk report and smart match integration

## 📁 Component Categories

### 🎨 UI Elements
- **Button**: Standardized button component with variants
- **Modal**: Reusable modal dialogs
- **Toast**: Notification system
- **Badge**: Status and category indicators
- **Avatar**: User profile images

### 📝 Form Components
- **Checkbox**: Custom checkbox with styling
- **Select**: Enhanced dropdown selection
- **SelectField**: Form field with select dropdown
- **StateDropdown**: US state selection component
- **FormFieldWithOther**: Select field with "Other" option

### 📊 Data Display
- **LoadingSpinner**: Activity indicators
- **Loader**: Content loading states
- **StepProgress**: Progress visualization
- **OptimizedList**: Performance-optimized lists

### 🛡️ Error Handling
- **ErrorBoundary**: Component error boundaries
- **GlobalErrorBoundary**: Application-level error handling
- **ProductionErrorBoundary**: Production error management
- **ChunkLoadErrorBoundary**: Code splitting error handling

### 🔧 Utilities
- **AccessibilityControls**: Accessibility features
- **ThemePreferences**: Theme management
- **LanguageSelector**: Internationalization support
- **PWAInstallPrompt**: Progressive web app installation

## 🧪 Testing

### WorkflowStepper Tests
**Comprehensive test suite** with 22 passing tests covering:

```bash
npm test -- --testPathPattern=WorkflowStepper.test.tsx
```

**Test Categories:**
- ✅ Step visibility logic
- ✅ User-type customization
- ✅ Progress indicators
- ✅ Status indicators
- ✅ Accessibility features
- ✅ Edge case handling
- ✅ Responsive design

### Running All Common Component Tests
```bash
npm test src/components/common/
```

## 🎨 Design System Integration

All components follow the EVA Financial Platform design system:

### Color Schemes
- **Primary**: Blue (`bg-primary-600`)
- **Secondary**: Gray (`bg-gray-100`)
- **Success**: Green (`bg-green-600`)
- **Warning**: Yellow (`bg-yellow-600`)
- **Error**: Red (`bg-red-600`)

### Typography
- **Headings**: `font-semibold` with responsive sizing
- **Body**: `text-sm` or `text-base` for readability
- **Captions**: `text-xs` for secondary information

### Spacing
- **Consistent Padding**: `p-3`, `p-4`, `p-6` patterns
- **Margins**: `mb-2`, `mb-4`, `mb-6` for vertical rhythm
- **Component Spacing**: `space-x-2`, `space-y-2` for internal spacing

## 📱 Responsive Design

Components are built with mobile-first responsive design:

### Breakpoints
- **Mobile**: Default styles
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)

### Mobile Optimizations
- Touch-friendly interactive elements
- Optimized spacing for mobile screens
- Responsive typography scaling
- Mobile-specific component variants

## 🔒 Security Considerations

### Input Validation
- All form components include built-in validation
- XSS prevention through proper escaping
- CSRF protection for form submissions

### Data Handling
- Sensitive data is never stored in component state
- Proper cleanup of sensitive information
- Secure transmission of user data

## 🚀 Performance

### Optimization Strategies
- **React.memo**: Applied to expensive render components
- **useCallback**: Memoized event handlers
- **useMemo**: Cached expensive calculations
- **Code Splitting**: Lazy loading for heavy components

### Bundle Size
- Tree-shakable exports through `index.ts`
- Optimized imports to reduce bundle size
- Dynamic imports for optional features

## 🔄 Context Integration

### Context Providers
Components integrate with application contexts:
- **UserTypeContext**: Role-based rendering
- **WorkflowContext**: Transaction workflow state
- **TransactionContext**: Transaction-aware components
- **RoleDashboardContext**: Dashboard configuration

### Context Usage Example
```typescript
import { useUserType } from '../../contexts/UserTypeContext';
import { useWorkflow } from '../../contexts/WorkflowContext';

const MyComponent = () => {
  const { userType, hasPermission } = useUserType();
  const { currentTransaction } = useWorkflow();
  
  return (
    <div>
      {hasPermission('feature', 2) && (
        <FeatureComponent transaction={currentTransaction} />
      )}
    </div>
  );
};
```

## 📚 Documentation

### Component Documentation
Each component includes:
- TypeScript interfaces for props
- JSDoc comments for public methods
- Usage examples in README files
- Storybook stories (where applicable)

### API Reference
For detailed prop definitions and method signatures, refer to the TypeScript interfaces in each component file.

---

**Version**: 1.1.0  
**Last Updated**: January 15, 2025  
**Components**: 50+ reusable components  
**Test Coverage**: 90%+ with comprehensive test suites 