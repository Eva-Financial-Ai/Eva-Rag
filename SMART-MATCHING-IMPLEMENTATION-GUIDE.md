# Smart Matching Implementation Guide

## Overview

The Smart Matching system is a sophisticated lender-borrower matching platform integrated into the EVA customer retention system. It allows lenders and brokers to define dynamic underwriting preferences and risk parameters that automatically match them with qualified borrowers based on 60+ financial and business criteria.

## Key Features

- **Dynamic Instrument Management**: Create and manage multiple financing instruments (Equipment, Real Estate, General Credit)
- **60+ Matching Variables**: Comprehensive borrower-lender matching across financial, credit, and business criteria
- **Deal Killer Filters**: Hard requirements that eliminate non-qualified borrowers immediately
- **Second Stage Scoring**: Nuanced credit score requirements by loan amount
- **Risk Weight Customization**: Configurable weights for different risk factors
- **Live EVA Integration**: Real-time updates to the EVA underwriting decision model
- **Performance Analytics**: Track matching success rates and optimize instruments over time
- **Role-Based Access**: Only visible to lender and broker user types

## Architecture

### Database Fields Structure

The Smart Matching system manages 60 database fields organized into these categories:

#### Deal Killer Matching Variables (11 fields)

Hard requirements that must be met for any match:

1. `financialInstrumentTypes` - Loan types (Equipment, Real Estate, General)
2. `collateralTypes` - Types of collateral accepted
3. `garagingLocationRequirement` - Where equipment can be stored
4. `minimumFleetRequirement` - Minimum fleet size required
5. `geographicLendingCoverage` - States where lending is offered
6. `restrictedAssetSellerTypes` - Seller types not accepted
7. `restrictedIndustryCodes` - Industries not served
8. `minimumBusinessAge` - Minimum business age in months
9. `minimumBusinessRevenue` - Minimum annual revenue
10. `debtServiceCoverageRatio` - DSCR requirements
11. `bankruptcyAcceptance` - Bankruptcy history acceptance

#### Second Stage Matching Variables (15 fields)

Credit score requirements by loan amount:

12. `equifaxMinScores` - Minimum Equifax scores by loan amount
13. `experianMinScores` - Minimum Experian scores by loan amount
14. `transunionMinScores` - Minimum TransUnion scores by loan amount
15. `businessIntelscoreMin` - Minimum business credit scores by amount
16. `paynetMasterscoreMin` - Minimum PayNet scores by amount
17. `equifaxOneScoreMin` - Minimum Equifax business scores by amount
18. `lexisNexisScoreMin` - Minimum LexisNexis scores by amount
19. `dunnPaydexScoreMin` - Minimum Dun & Bradstreet scores by amount
20. `preferredIndustryCodes` - Preferred industry sectors
21. `minimumTermMonths` - Minimum loan term length
22. `maximumTermMonths` - Maximum loan term length
23. `minimumTransactionAmount` - Minimum loan amount
24. `maximumTransactionAmount` - Maximum loan amount
25. `riskToleranceLevel` - Risk appetite (high, medium, low)
26. `averageTimeToClose` - Average days to close loans

#### Risk Score Customization (6 fields)

Lender preference weights (must sum to 100%):

51. `creditWorthinessWeight` - Weight for credit factors
52. `financialRatioWeight` - Weight for financial ratios
53. `cashFlowWeight` - Weight for cash flow factors
54. `complianceWeight` - Weight for compliance factors
55. `equipmentWeight` - Weight for equipment factors (equipment loans)
56. `propertyWeight` - Weight for property factors (real estate loans)

[Additional fields documented in types/SmartMatchingTypes.ts]

## Implementation Components

### 1. Type Definitions

**File**: `src/types/SmartMatchingTypes.ts`

- Comprehensive TypeScript interfaces for all 60 database fields
- Enums for standardized values (InstrumentType, CollateralType, etc.)
- Validation constants and default instrument templates
- Full type safety for the matching system

### 2. Smart Matching Dashboard

**File**: `src/pages/customerRetention/SmartMatchingDashboard.tsx`

- Main interface for lenders and brokers
- Overview of all instruments with performance metrics
- Quick actions to create new instruments
- Real-time activity feed

### 3. Instrument Form

**File**: `src/pages/customerRetention/SmartMatchingInstrumentForm.tsx`

- Create and edit Smart Matching instruments
- Tabbed interface for different field categories
- Real-time validation and error handling
- Support for all instrument types

### 4. Analytics Dashboard

**File**: `src/pages/customerRetention/SmartMatchingAnalytics.tsx`

- Performance metrics for individual instruments
- Success rate trends and industry analysis
- Credit score distribution visualization
- Recent matching activity

### 5. Service Layer

**File**: `src/services/smartMatchingService.ts`

- API integration for all Smart Matching operations
- Validation functions for instrument data
- Integration with EVA underwriting model
- Bulk operations and data export/import

## User Access Control

### Role-Based Permissions

- **Visible Only To**: Lender and Broker user types
- **Permission Level**: `smartMatch` with `MODIFY` access
- **Hidden From**: Vendors and Borrowers (they cannot see this feature)

### Navigation Integration

Smart Matching appears in the Customer Retention menu only for authorized users:

```typescript
// Automatic permission check in navigation
const hasSmartMatchAccess =
  ['lender', 'broker'].includes(userType) && hasPermission('smartMatch', 'MODIFY');
```

## Default Instrument Templates

The system provides three pre-configured templates:

### Equipment Financing Template

```typescript
const DEFAULT_EQUIPMENT_INSTRUMENT = {
  instrumentType: InstrumentType.EQUIPMENT,
  dealKillers: {
    minimumBusinessAge: 12,
    minimumBusinessRevenue: 100000,
    debtServiceCoverageRatio: 1.25,
    bankruptcyAcceptance: false,
  },
  riskWeights: {
    creditWorthinessWeight: 30,
    financialRatioWeight: 25,
    cashFlowWeight: 20,
    complianceWeight: 15,
    equipmentWeight: 10,
    propertyWeight: 0,
  },
};
```

### Real Estate Template

```typescript
const DEFAULT_REAL_ESTATE_INSTRUMENT = {
  instrumentType: InstrumentType.REAL_ESTATE,
  dealKillers: {
    minimumBusinessAge: 24,
    minimumBusinessRevenue: 500000,
    debtServiceCoverageRatio: 1.35,
    bankruptcyAcceptance: false,
  },
  riskWeights: {
    creditWorthinessWeight: 25,
    financialRatioWeight: 30,
    cashFlowWeight: 20,
    complianceWeight: 15,
    equipmentWeight: 0,
    propertyWeight: 10,
  },
};
```

### General Credit Template

```typescript
const DEFAULT_GENERAL_INSTRUMENT = {
  instrumentType: InstrumentType.GENERAL,
  dealKillers: {
    minimumBusinessAge: 6,
    minimumBusinessRevenue: 50000,
    debtServiceCoverageRatio: 1.2,
    bankruptcyAcceptance: true,
  },
  riskWeights: {
    creditWorthinessWeight: 35,
    financialRatioWeight: 30,
    cashFlowWeight: 25,
    complianceWeight: 10,
    equipmentWeight: 0,
    propertyWeight: 0,
  },
};
```

## API Integration

### Key Endpoints

```typescript
// Customer Profile Management
GET    /api/smart-matching/profile
PUT    /api/smart-matching/profile

// Instrument CRUD Operations
GET    /api/smart-matching/instruments
POST   /api/smart-matching/instruments
PUT    /api/smart-matching/instruments/:id
DELETE /api/smart-matching/instruments/:id
PATCH  /api/smart-matching/instruments/:id/toggle

// Matching Operations
POST   /api/smart-matching/match
GET    /api/smart-matching/instruments/:id/matches

// EVA Integration
POST   /api/smart-matching/instruments/:id/push-to-eva
POST   /api/smart-matching/sync-to-eva
GET    /api/smart-matching/eva-status

// Analytics
GET    /api/smart-matching/instruments/:id/analytics
GET    /api/smart-matching/analytics
GET    /api/smart-matching/trends
```

### Real-time Updates

The system integrates with the live EVA underwriting model:

1. **Instrument Changes**: Automatically push to EVA when instruments are updated
2. **Live Model Updates**: Changes reflect immediately in underwriting decisions
3. **Performance Tracking**: Monitor how changes affect matching success rates
4. **Audit Trail**: Complete history of all changes with timestamps and user tracking

## Financial Compliance

### Data Security

- **PII Encryption**: All sensitive financial data encrypted at rest and in transit
- **Audit Trails**: Complete logging of all instrument changes and matches
- **Role-Based Access**: Strict permission controls prevent unauthorized access
- **GDPR/CCPA Compliance**: Data handling follows privacy regulations

### Financial Validation

- **2-Decimal Precision**: All financial calculations use proper decimal precision
- **Range Validation**: Loan amounts, revenues, and scores validated against industry standards
- **Business Rules**: Compliance checks at every data validation step
- **Error Handling**: Comprehensive error handling for API failures and data issues

## Testing

### Unit Tests

**File**: `src/types/__tests__/SmartMatchingTypes.test.ts`

Comprehensive test coverage for:

- Type definitions and enums
- Validation constants
- Default instrument templates
- Risk weight calculations
- Type safety enforcement

### Integration Tests

- API endpoint testing
- Permission validation
- Data flow verification
- EVA model integration

## Development Workflow

### 1. Creating New Instruments

```typescript
// Navigate to Smart Matching Dashboard
/customer-retention/amrst - matching;

// Click "Create New Instrument"
// Select instrument type (Equipment/Real Estate/General)
// Configure deal killers, credit scores, and risk weights
// Save and push to EVA model
```

### 2. Managing Existing Instruments

```typescript
// View performance metrics
// Edit instrument parameters
// Toggle active/inactive status
// View analytics and trends
// Export/import instrument configurations
```

### 3. Monitoring Performance

```typescript
// Track success rates by instrument
// Analyze industry matching patterns
// Monitor credit score distributions
// Review recent matching activity
// Optimize risk weights based on performance
```

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**: AI-powered optimization of risk weights
2. **Advanced Analytics**: Predictive modeling for matching success
3. **Batch Processing**: Bulk borrower matching operations
4. **White-label Customization**: Custom branding for different lenders
5. **Mobile Interface**: Native mobile app for on-the-go management

### API Expansions

1. **Webhook Integration**: Real-time notifications for matches
2. **Third-party Integrations**: Connect with external credit bureaus
3. **Document Processing**: Automated extraction of financial data
4. **Portfolio Management**: Integration with loan servicing systems

## Troubleshooting

### Common Issues

1. **Permission Denied**

   - Verify user has lender or broker role
   - Check `smartMatch` permission is granted
   - Ensure user is not borrower or vendor type

2. **Risk Weights Don't Sum to 100%**

   - Check all weight fields add up to exactly 100
   - Use the weight summary display for verification
   - Adjust individual weights to reach total

3. **Instrument Not Appearing in EVA**

   - Verify instrument is active
   - Check EVA sync status
   - Manually trigger sync if needed

4. **No Matches Found**
   - Review deal killer criteria (may be too strict)
   - Check geographic lending coverage
   - Verify credit score requirements are reasonable

### Debug Tools

- Browser console for client-side errors
- API response logging for server issues
- EVA model status endpoint for integration problems
- Analytics dashboard for performance insights

## Support and Documentation

### Additional Resources

- [EVA Platform Documentation](./README.md)
- [Customer Retention Guide](./CUSTOMER-RETENTION-IMPLEMENTATION.md)
- [API Schema Documentation](./docs/api-schemas/)
- [Financial Compliance Guidelines](./PRICING-MODEL-GUIDELINES.md)

### Contact Information

- **Development Team**: eva-dev-team@company.com
- **Financial Compliance**: compliance@company.com
- **Technical Support**: support@company.com

---

**Note**: This Smart Matching system is a critical component of the EVA platform's underwriting capabilities. All changes should be thoroughly tested and comply with financial regulations before deployment to production.
