# Post-MVP Financial Calculator Requirements

## Overview

The Financial Calculator Widget needs to be transformed into a comprehensive multi-party tax calculator that serves four different user types (Lender/Lessor, Borrower, Broker, and Vendor), each with their own unique perspective on the same transaction.

## Current Status

- **Location**: `src/components/common/FinancialCalculatorWidget.tsx`
- **Status**: Hidden for MVP (commented out in App.tsx)
- **Issue**: Component was causing rendering issues, needs to be refactored after MVP

## Business Requirements

### User Types & Perspectives

1. **Lender/Lessor**

   - Focus on loan/lease structuring
   - Interest income calculations
   - Risk assessment metrics

2. **Borrower**

   - Tax benefit calculations
   - Section 179 deductions
   - Bonus depreciation (100% for 2025-2029)
   - Interest deduction limitations

3. **Broker**

   - Commission calculations
   - Volume bonuses
   - Tax implications of commission income

4. **Vendor**
   - Profit margin analysis
   - Customer benefit talking points
   - Markup and cost analysis

### Key Features to Implement

#### 1. Enhanced State Structure

```javascript
// User type tracking
const [activeTab, setActiveTab] = useState('lender');

// Common equipment details
const [common, setCommon] = useState({
  equipmentCost: 500000,
  equipmentType: 'manufacturing',
  transactionDate: '2025-06-01',
  state: 'federal',
});

// Broker-specific state
const [broker, setBroker] = useState({
  commissionPercent: 2.0,
  volumeBonus: 0,
  quarterlyDeals: 15,
  averageDealSize: 500000,
  brokerTaxRate: 35,
});

// Vendor-specific state
const [vendor, setVendor] = useState({
  costOfGoods: 350000,
  markupPercent: 42.86,
  installationCost: 25000,
  warrantyRevenue: 15000,
  vendorTaxRate: 21,
});
```

#### 2. Tax Calculations (2025 Tax Law)

##### Section 179 Calculation

- Max deduction: $2,500,000
- Phase-out threshold: $4,000,000
- Phase-out reduces dollar-for-dollar

##### Bonus Depreciation

- 100% bonus depreciation for 2025-2029
- Applies to remaining basis after Section 179

##### Interest Deduction Limitations

- Small business exception: No limit for businesses < $27M revenue
- Larger businesses: Limited to 30% of EBITDA

#### 3. Tab Navigation System

- Four tabs: Lender/Lessor, Borrower, Broker, Vendor
- Each tab shows relevant fields and calculations
- Common fields shared across all views

#### 4. Comprehensive Calculations

##### Borrower Tax Benefits

```javascript
const calculateBorrowerTaxBenefits = () => {
  const section179 = calculateSection179();
  const bonusDepreciation = calculateBonusDepreciation();
  const macrsDepreciation = calculateMACRSDepreciation();
  const totalDepreciation = section179 + bonusDepreciation + macrsDepreciation;

  // Interest expense calculations
  const annualInterest = (lender.loanAmount * lender.interestRate) / 100;
  const totalBusinessInterest = borrower.existingInterestExpense + annualInterest;
  const interestDeductionLimit = calculateInterestDeductionLimit();
  const deductibleInterest = Math.min(totalBusinessInterest, interestDeductionLimit);

  // Tax savings
  const depreciationTaxSavings = totalDepreciation * (borrower.businessTaxRate / 100);
  const interestTaxSavings = deductibleInterest * (borrower.businessTaxRate / 100);

  return {
    section179,
    bonusDepreciation,
    macrsDepreciation,
    totalDepreciation,
    depreciationTaxSavings,
    deductibleInterest,
    interestTaxSavings,
    totalFirstYearTaxSavings: depreciationTaxSavings + interestTaxSavings,
    effectiveCostReduction: (totalFirstYearTaxSavings / common.equipmentCost) * 100,
  };
};
```

### Implementation Strategy

1. **Phase 1**: Fix rendering issues

   - Debug why calculator wasn't appearing
   - Ensure proper state management
   - Fix any infinite loop issues

2. **Phase 2**: Refactor existing calculator

   - Keep existing functionality
   - Add tab navigation
   - Implement user type switching

3. **Phase 3**: Add new calculations

   - Implement 2025 tax law calculations
   - Add Section 179 with phase-out logic
   - Implement bonus depreciation
   - Add interest deduction limitations

4. **Phase 4**: Create user-specific views

   - Lender/Lessor view with yield calculations
   - Borrower view with comprehensive tax benefits
   - Broker view with commission analysis
   - Vendor view with profit margins and talking points

5. **Phase 5**: Add summary dashboard
   - Key metrics for all user types
   - 2025 tax law highlights
   - Quick reference guide

### Design Considerations

1. **Preserve Existing Functionality**: Don't remove current calculations, enhance them
2. **Test Incrementally**: Update one section at a time
3. **Validate Edge Cases**: Handle Section 179 phase-out correctly
4. **User Flow**: Enter data once, see impact for all parties
5. **Performance**: Use `useMemo` for complex calculations

### UI/UX Requirements

- Clean, professional interface
- Clear labeling of tax benefits
- Visual indicators for savings
- Responsive design for all screen sizes
- Print-friendly summary view
- Export functionality for reports

### Technical Notes

- Component location: `src/components/common/FinancialCalculatorWidget.tsx`
- Uses Tailwind CSS for styling
- Integrates with existing financial utilities
- Should maintain existing draggable/minimizable functionality

### Post-MVP Priority

This calculator is a key differentiator for the EVA platform, providing unique value by showing all parties in a transaction how they benefit from the 2025 tax law changes. It should be prioritized immediately after MVP launch.
