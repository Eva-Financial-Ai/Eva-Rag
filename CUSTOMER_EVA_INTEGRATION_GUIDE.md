# EVA Customer Integration Setup Guide

## 🎯 Overview
This guide explains how to set up and use the new customer-context EVA integration feature that connects the customer selector in the top navigation directly to EVA chat interface.

## 🚀 Quick Setup

### 1. Verify Installation
Ensure you have the latest version with customer integration:
```bash
# Check if customer context components exist
ls src/contexts/EVACustomerContext.tsx
ls src/components/EVACustomerSelector.tsx
ls src/components/EVAAssistantWithCustomerContext.tsx
```

### 2. Start Development Server
```bash
npm run start:no-lint
# or
npm start
```

### 3. Access the Feature
1. Navigate to the application in your browser
2. Look for the customer selector in the top-right navigation
3. Click on "Select Customer" dropdown
4. Choose a customer from the list
5. Click the EVA chat button (🧠) to open chat interface

## 🧠 Customer-EVA Conversation Protocol

### Phase 1: Customer Selection
When you select a customer from the top navigation:
- EVA receives full customer profile automatically
- Customer financial data, credit score, and transaction history are loaded
- User type is detected for response style adaptation

### Phase 2: Goal Setting
EVA will ask: **"What's the end goal of this conversation?"**

Example responses:
- "Review loan application for approval"
- "Assess risk factors for this customer"
- "Help customer understand loan options"
- "Evaluate portfolio performance"

### Phase 3: Resource Assessment
EVA will ask: **"What resources are available to achieve this goal?"**

Example responses:
- "I have access to credit reports, tax returns, and bank statements"
- "Internal underwriting tools and risk models are available"
- "Customer provided financial documents yesterday"
- "I need this completed within 2 business days"

### Phase 4: Summary & Confirmation
EVA provides a complete summary including:
- Customer context and financial profile
- Your stated goal
- Available resources
- Planned approach and response style

Respond with:
- **"Yes"** to continue with the plan
- **"No, [corrections]"** to modify the approach

### Phase 5: Active Chat
Once confirmed, EVA provides:
- Customer-specific recommendations
- Role-appropriate guidance
- Contextual tool suggestions
- Compliance-aware responses

## 👥 Customer Data Structure

### Available Customer Information
```typescript
// Basic Profile
customer.display_name        // "John Smith"
customer.type               // "individual" | "business"
customer.email              // "john@email.com"

// Financial Metadata
customer.metadata.credit_score      // 720
customer.metadata.annual_income     // 85000
customer.metadata.risk_level        // "low" | "medium" | "high"
customer.metadata.industry          // "Technology"

// Employment Details
customer.profile.employer           // "Tech Solutions Inc"
customer.profile.job_title          // "Senior Developer"
customer.profile.years_at_job      // 5

// Loan History
customer.metadata.loan_history      // Array of previous loans
customer.metadata.assets            // Property, vehicles, etc.
customer.metadata.liabilities       // Debts, mortgages, etc.
```

### Mock Customers Available
1. **John Smith** (Individual)
   - Credit Score: 720, Risk: Low
   - Senior Developer, 5 years experience
   - Primary residence + vehicle assets

2. **Smith Manufacturing LLC** (Business)
   - Credit Score: 680, Risk: Medium
   - 8 years in business, 45 employees
   - Manufacturing equipment + facility

3. **Johnson Properties LLC** (Asset Seller)
   - Credit Score: 750, Risk: Low
   - Real estate industry
   - Property portfolio assets

## 🛠️ User Type Response Styles

EVA adapts its response style based on your user type:

### Broker
- **Style**: Professional broker-focused
- **Focus**: Loan origination, client matching
- **Language**: Sales-oriented, opportunity identification

### Underwriter
- **Style**: Analytical underwriter-focused
- **Focus**: Risk assessment, credit analysis
- **Language**: Technical, risk-focused, compliance-aware

### Portfolio Manager
- **Style**: Strategic portfolio management-focused
- **Focus**: Performance analytics, diversification
- **Language**: Investment-oriented, strategic planning

### Servicer
- **Style**: Operational servicing-focused
- **Focus**: Payment processing, customer service
- **Language**: Process-oriented, customer relationship

### Borrower
- **Style**: Supportive customer-focused
- **Focus**: Loan options, application guidance
- **Language**: Educational, supportive, clear explanations

## 🎨 Interface Features

### Customer Selector (Top Navigation)
- **Location**: Top-right navigation bar
- **Display**: Customer name + risk level badge
- **Dropdown**: Full customer list with details
- **Integration**: Direct connection to EVA chat

### EVA Chat Interface
- **Size**: 1755px × 1277px (33% larger interface)
- **Header**: Shows selected customer context
- **Status**: Displays conversation phase
- **Styling**: Color-coded message types
  - Amber: Protocol/setup messages
  - Purple: Summary messages
  - Green: Confirmation messages
  - Blue: User messages
  - Gray: Regular EVA responses

## 🔧 Development & Testing

### Testing the Integration
1. **Select Customer**: Choose different customer types
2. **Conversation Flow**: Complete full protocol
3. **Context Verification**: Check EVA receives customer data
4. **Response Style**: Verify adaptation to user type
5. **Tool Integration**: Test customer-specific recommendations

### Debugging Commands
```javascript
// In browser console
// Check customer context
useEVACustomer().getCustomerContext()

// View conversation state
// (Available in React DevTools)

// Customer summary
useEVACustomer().getCustomerSummary()
```

### Development Shortcuts
- **Customer Switching**: Change customer mid-conversation to test adaptation
- **User Type Testing**: Change user type to see response style differences
- **Protocol Reset**: Refresh to restart conversation protocol

## 🚨 Common Issues & Solutions

### Issue: Customer selector not showing
**Solution**: Verify EVACustomerProvider is wrapping the app in App.tsx

### Issue: EVA not receiving customer data
**Solution**: Check customer context is passed to EVAAssistantWithCustomerContext

### Issue: Conversation protocol not starting
**Solution**: Ensure customer is selected before opening EVA chat

### Issue: Response style not adapting
**Solution**: Verify userType is set in UserContext

### Issue: Customer data not loading
**Solution**: Check mock customer data in EVACustomerContext.tsx

## 📊 Business Value

### For Lenders
- **Faster Decisions**: Customer context accelerates underwriting
- **Better Risk Assessment**: Complete customer view reduces blind spots
- **Improved Compliance**: Audit trails for all customer interactions

### For Customers
- **Personalized Service**: EVA knows their history and preferences
- **Faster Processing**: No need to repeat information
- **Better Guidance**: Context-aware recommendations

### For Operations
- **Efficiency Gains**: Reduced manual data entry
- **Quality Improvement**: Consistent, informed responses
- **Training Support**: New staff get expert-level guidance

## 🔮 Future Enhancements

### Planned Features
- Real-time customer data sync
- Advanced risk modeling integration
- Multi-customer conversation support
- Voice-to-text for customer calls
- Document analysis integration

### Integration Opportunities
- CRM system connections
- Credit bureau real-time data
- Market intelligence feeds
- Regulatory compliance monitoring

---

**Ready to transform customer interactions with AI-powered context awareness!** 🚀 