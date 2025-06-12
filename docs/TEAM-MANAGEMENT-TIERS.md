# EVA Platform - Six-Tier Team Management System

## Overview

The EVA Platform implements a comprehensive six-tier role structure across four organization types: Borrowers, Vendors, Brokers, and Lenders. This system ensures proper authorization, approval chains, and security across all financial operations.

## Organization Types & Tier Structure

### 1. Borrower Teams (Companies Seeking Loans)

| Tier  | Role               | Description                                                             | Monetary Limit | Key Permissions                                          |
| ----- | ------------------ | ----------------------------------------------------------------------- | -------------- | -------------------------------------------------------- |
| **1** | Owner/CEO          | Full control over all loan applications and company financial decisions | Unlimited      | All permissions                                          |
| **2** | CFO                | Financial decisions and loan approvals                                  | Up to $5M      | Loan applications, financial statements, banking changes |
| **3** | Controller         | Create and manage loan drafts                                           | Up to $1M      | Draft creation, document upload, minor corrections       |
| **4** | Accounting Staff   | Support documentation and data entry                                    | $0             | Document upload only, restricted hours (8AM-6PM M-F)     |
| **5** | Operations Manager | View-only access to loan status                                         | $0             | Read-only access to loan status                          |
| **6** | Admin Assistant    | Minimal scheduling access                                               | $0             | Calendar and contact info only (9AM-5PM M-F)             |

### 2. Vendor Teams (Asset Sellers)

| Tier  | Role             | Description                         | Monetary Limit | Key Permissions                                           |
| ----- | ---------------- | ----------------------------------- | -------------- | --------------------------------------------------------- |
| **1** | Owner/President  | Full control over vendor operations | Unlimited      | All pricing, inventory, contracts                         |
| **2** | Sales Director   | Strategic sales management          | Up to $10M     | Pricing changes, major deals, sales team management       |
| **3** | Sales Manager    | Day-to-day sales operations         | Up to $2M      | Standard deals, discounts up to 10%                       |
| **4** | Senior Sales Rep | Complex deals and relationships     | Up to $500K    | Quote generation, standard terms, geographic restrictions |
| **5** | Junior Sales Rep | Basic sales transactions            | Up to $100K    | Information requests only (8AM-6PM M-F)                   |
| **6** | Sales Support    | Data entry and admin                | $0             | Data entry forms only (9AM-5PM M-F)                       |

### 3. Broker Teams (Loan Intermediaries)

| Tier  | Role                | Description                      | Monetary Limit | Key Permissions                                              |
| ----- | ------------------- | -------------------------------- | -------------- | ------------------------------------------------------------ |
| **1** | Principal/Owner     | Full brokerage control           | Unlimited      | All loans, compliance, commission structure                  |
| **2** | Managing Broker     | Office operations oversight      | Up to $20M     | Loan submission, team assignments, commission approval       |
| **3** | Senior Loan Officer | Independent portfolio management | Up to $5M      | Own loan submission, client agreements                       |
| **4** | Loan Officer        | Supervised loan origination      | Up to $2M      | Loan preparation only, requires approval for submission      |
| **5** | Processor           | Documentation handling           | $0             | Document collection, no external communication (8AM-6PM M-F) |
| **6** | Marketing Assistant | Basic admin tasks                | $0             | Marketing materials only (9AM-5PM M-F)                       |

### 4. Lender Teams (Financial Institutions)

| Tier  | Role                 | Description            | Monetary Limit | Key Permissions                                     |
| ----- | -------------------- | ---------------------- | -------------- | --------------------------------------------------- |
| **1** | Chief Credit Officer | All lending decisions  | Unlimited      | All loans, credit policy, risk parameters           |
| **2** | Senior Underwriter   | Complex loan approval  | Up to $10M     | Loan approval, exception requests, team decisions   |
| **3** | Underwriter          | Standard loan approval | Up to $2M      | Loan approval, standard conditions                  |
| **4** | Loan Analyst         | Application processing | $0             | Document verification, initial review (8AM-6PM M-F) |
| **5** | Customer Service     | Basic inquiries        | $0             | Loan status, payment info (8AM-8PM M-F-Sat)         |
| **6** | Data Entry           | Administrative support | $0             | Data entry screens only (9AM-5PM M-F)               |

## Key Features

### 1. Hierarchical Management

- Users can only manage team members below their tier
- Promotions require approval from higher tiers
- Monetary limits cascade down through tiers

### 2. Smart Restrictions

#### Time-Based Access

- Lower tiers (4-6) often have restricted hours
- Business hours enforcement (e.g., 8AM-6PM)
- Weekend restrictions for certain roles

#### Geographic Restrictions

- Sales reps may be limited to assigned territories
- Regional managers have broader access

#### Approval Requirements

- Actions exceeding tier authority require higher approval
- Critical operations need multiple tier approvals

### 3. Permission Categories

#### Data Access Scope

- **All**: Complete data access (Tier 1 only)
- **Financial**: Financial reports and banking
- **Operational**: Day-to-day operations
- **Limited**: Specific screens or reports only

#### Communication Rights

- **All**: Can communicate with anyone
- **External**: Can contact customers/partners
- **Internal**: Team communication only
- **Restricted**: No external communication

#### Approval Authority

- **Monetary**: Transaction approval limits
- **Operational**: Process approvals
- **Personnel**: Team management rights

## Implementation in the UI

### Accessing Team Management

1. Navigate to **Team Management** from the main menu
2. Toggle between "Classic View" and "Tiered View"
3. In Tiered View, select your organization type

### Managing Team Members

1. **Adding Members**

   - Click "Add Team Member" (only visible if you have authority)
   - Select appropriate tier (only tiers below yours are available)
   - Fill in member details and send invitation

2. **Promoting/Demoting**

   - Use arrow buttons next to team members
   - Can only promote to tiers below your own
   - Demotion follows same restrictions

3. **Viewing Permissions**
   - Click on any tier to expand and see members
   - Permission badges show monetary limits and restrictions
   - Lock icon indicates tiers you cannot manage

### Visual Indicators

- **Blue highlight**: Your current tier
- **White background**: Tiers you can manage
- **Gray background**: Tiers above your authority
- **Permission badges**:
  - Green ($): Monetary authority
  - Yellow (🕐): Time restrictions
  - Blue (🌍): Geographic limits

## Business Logic Examples

### Example 1: Loan Application Process (Borrower)

1. **Tier 4** (Accounting) uploads financial statements
2. **Tier 3** (Controller) creates $800K loan application
3. **Tier 2** (CFO) reviews and approves (within $5M limit)
4. **Tier 1** (CEO) provides final signature

### Example 2: Large Equipment Sale (Vendor)

1. **Tier 5** (Junior Sales) identifies opportunity
2. **Tier 4** (Senior Sales) prepares $400K quote
3. **Tier 3** (Sales Manager) approves with 8% discount
4. **Tier 2** (Sales Director) signs off on special terms

### Example 3: Loan Underwriting (Lender)

1. **Tier 4** (Analyst) performs initial review
2. **Tier 3** (Underwriter) approves $1.5M loan
3. For $3M loan: escalates to **Tier 2** (Senior Underwriter)
4. For $15M loan: requires **Tier 1** (CCO) approval

## Security Considerations

### Segregation of Duties

- Document upload separated from approval
- Multiple tiers required for critical operations
- Audit trail for all tier-based decisions

### Access Controls

- Time-based restrictions enforced at API level
- Geographic limits checked on each request
- Monetary limits validated before processing

### Compliance Features

- All role changes logged with timestamp
- Approval chains documented
- Regular access reviews required

## API Integration

### Checking Permissions

```typescript
import { canPerformAction } from '@/types/teamRoles';

// Check if user can approve a $3M loan
const canApprove = canPerformAction(userTier, 'lender', 'loan_approval', 3000000);
```

### Getting Approvers

```typescript
import { getApproversForAction } from '@/types/teamRoles';

// Find who can approve a $5M transaction
const approverTiers = getApproversForAction('borrower', 'loan_application', 5000000);
```

## Best Practices

1. **Regular Reviews**

   - Quarterly tier assignment reviews
   - Annual permission audits
   - Monitor for privilege creep

2. **Onboarding**

   - Start new employees at appropriate tier
   - Gradual promotion based on performance
   - Document all tier changes

3. **Emergency Procedures**
   - Temporary tier elevation process
   - Emergency approval chains
   - Audit all emergency actions

## Troubleshooting

### Common Issues

1. **"Cannot manage this tier"**

   - You're trying to manage someone at or above your tier
   - Solution: Request action from higher tier

2. **"Action requires approval"**

   - Transaction exceeds your monetary limit
   - Solution: Submit for higher tier approval

3. **"Access restricted outside business hours"**
   - Time-based restriction in effect
   - Solution: Wait for allowed hours or request exception

### Support

For questions about tier assignments or permissions:

- Contact your organization's Tier 1 or Tier 2 manager
- Submit a support ticket with your current tier and requested action
- Include business justification for any exception requests
