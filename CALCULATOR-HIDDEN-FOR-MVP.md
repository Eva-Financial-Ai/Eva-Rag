# Financial Calculator Hidden for MVP

## Date: May 27, 2025

## Action Taken

- Commented out the Financial Calculator Widget in `src/App.tsx`
- Component still exists at `src/components/common/FinancialCalculatorWidget.tsx`
- All functionality preserved for post-MVP implementation

## Reason

The calculator was experiencing rendering issues that were preventing the app from loading properly. Rather than delay MVP, the decision was made to temporarily disable it.

## Previous Issues

1. Infinite loop in `RoleBasedDashboard.tsx` was preventing calculator from rendering
2. The loop was fixed, but calculator still wasn't appearing reliably
3. Decision made to focus on core MVP features first

## Post-MVP Plan

1. Full requirements documented in `POST-MVP-CALCULATOR-REQUIREMENTS.md`
2. Calculator will be transformed into comprehensive multi-party tax calculator
3. Will serve 4 user types with 2025 tax law calculations
4. High priority for immediate post-MVP development

## To Re-enable

Simply uncomment line ~165 in `src/App.tsx`:

```jsx
// Change from:
{
  /* <FinancialCalculatorWidget initialVisible={true} /> */
}

// To:
<FinancialCalculatorWidget initialVisible={true} />;
```
