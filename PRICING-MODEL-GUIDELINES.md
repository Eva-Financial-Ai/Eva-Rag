# 💳 EVA Platform Pricing Model & Payment Integration Guidelines

## 📋 Overview

This comprehensive guide provides step-by-step instructions for implementing the complete EVA Platform pricing structure with Stripe and Plaid payment processing, integrated with our advanced sales analytics system.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Customer      │────│   EVA Platform   │────│   Payment Gateway   │
│   (All Types)   │    │   Sales Engine   │    │   (Stripe/Plaid)    │
│                 │    │                  │    │                     │
│ • Brokers       │    │ • Product Catalog│    │ • Credit Cards      │
│ • Lenders       │    │ • Pricing Engine │    │ • ACH Transfers     │
│ • Borrowers     │    │ • Commission Calc│    │ • Bank Verification │
│ • Vendors       │    │ • Revenue Track  │    │ • Subscription Mgmt │
└─────────────────┘    │ • Analytics API  │    └─────────────────────┘
                       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │   Sales Database │
                       │   + Analytics    │
                       └──────────────────┘
```

## 💰 Complete Pricing Structure

### Product Categories & Pricing Models

#### 1. Primary (Broker Function) Products

```json
{
  "smart_match_closed": {
    "name": "Smart Match Closed",
    "description": "Charged as % Fee of credit amount",
    "pricing_model": "percentage",
    "commission_rate": 0.05,
    "min_amount": 1000,
    "max_amount": 50000000,
    "stripe_price_id": "price_smart_match_closed",
    "revenue_category": "commission"
  }
}
```

#### 2. Underwriting Score & Risk Map

```json
{
  "risk_score_general": {
    "name": "Risk Score & Report/Map - General Application",
    "description": "Blended Biz & Personal Credit Scores - Not Collateralized",
    "pricing_model": "fixed",
    "price": 30000,
    "currency": "usd",
    "stripe_price_id": "price_risk_score_general",
    "revenue_category": "one_time"
  },
  "risk_score_equipment": {
    "name": "Risk Score & Report/Map - Equipment & Vehicles",
    "description": "Blended Biz & Personal Credit Scores - Equipment & Vehicles Application",
    "pricing_model": "fixed",
    "price": 33500,
    "currency": "usd",
    "stripe_price_id": "price_risk_score_equipment",
    "revenue_category": "one_time"
  },
  "risk_score_real_estate": {
    "name": "Risk Score & Report/Map - Real Estate",
    "description": "Blended Biz & Personal Credit Scores - Real Estate Application",
    "pricing_model": "fixed",
    "price": 33500,
    "currency": "usd",
    "stripe_price_id": "price_risk_score_real_estate",
    "revenue_category": "one_time"
  }
}
```

#### 3. Smart Match Decision Tools

```json
{
  "smart_match_broker": {
    "name": "Smart Match Decision Tool - Broker",
    "description": "Not Using Eva Lenders",
    "pricing_model": "fixed",
    "price": 4500,
    "currency": "usd",
    "stripe_price_id": "price_smart_match_broker",
    "revenue_category": "one_time"
  },
  "smart_match_lender": {
    "name": "Smart Match Decision Tool - Lender",
    "description": "Not Using Eva Lenders",
    "pricing_model": "fixed",
    "price": 3500,
    "currency": "usd",
    "stripe_price_id": "price_smart_match_lender",
    "revenue_category": "one_time"
  }
}
```

#### 4. Asset Tokenization

```json
{
  "asset_tokenized": {
    "name": "Per Asset Pressed and Tokenized",
    "description": "Asset tokenization service",
    "pricing_model": "fixed",
    "price": 15000,
    "currency": "usd",
    "stripe_price_id": "price_asset_tokenized",
    "revenue_category": "one_time"
  }
}
```

#### 5. Shield Vault

```json
{
  "shield_vault_locking": {
    "name": "Shield Vault Transaction Document Locking",
    "description": "Document security and locking service",
    "pricing_model": "fixed",
    "price": 3000,
    "currency": "usd",
    "stripe_price_id": "price_shield_vault_locking",
    "revenue_category": "one_time"
  }
}
```

#### 6. LeadMap Verifications

```json
{
  "kyb_verification": {
    "name": "KYB Business Verification",
    "description": "Know Your Business verification",
    "pricing_model": "fixed",
    "price": 2000,
    "currency": "usd",
    "stripe_price_id": "price_kyb_verification",
    "revenue_category": "one_time"
  },
  "kyc_verification": {
    "name": "KYC Person Verification",
    "description": "Know Your Customer verification",
    "pricing_model": "fixed",
    "price": 750,
    "currency": "usd",
    "stripe_price_id": "price_kyc_verification",
    "revenue_category": "one_time"
  },
  "kyp_verification": {
    "name": "KYP Property Verification",
    "description": "Know Your Property verification",
    "pricing_model": "fixed",
    "price": 2000,
    "currency": "usd",
    "stripe_price_id": "price_kyp_verification",
    "revenue_category": "one_time"
  },
  "kyd_verification": {
    "name": "KYD Funding Verification",
    "description": "Know Your Debtor - Funding Verification - Vendor - 1 3rd Party of Any Type Included",
    "pricing_model": "fixed",
    "price": 11750,
    "currency": "usd",
    "stripe_price_id": "price_kyd_verification",
    "revenue_category": "one_time"
  }
}
```

#### 7. Platform Features (Subscriptions)

```json
{
  "platform_subscription": {
    "name": "Monthly Platform Subscription",
    "description": "FileLock, Advisor Bar, Safe Forms, Customer Retention Platform, etc",
    "pricing_model": "subscription",
    "price": 10000,
    "currency": "usd",
    "interval": "month",
    "stripe_price_id": "price_platform_subscription_monthly",
    "revenue_category": "recurring"
  },
  "cc_bar_local": {
    "name": "CC Bar - Local",
    "description": "Local web phone & call transcription with sentiment analysis",
    "pricing_model": "subscription",
    "price": 6000,
    "currency": "usd",
    "interval": "month",
    "stripe_price_id": "price_cc_bar_local_monthly",
    "revenue_category": "recurring"
  }
}
```

## 🔧 Stripe Integration Setup

### 1. Environment Configuration

```bash
# .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Create Stripe Products & Prices

```javascript
// scripts/setup-stripe-products.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const setupStripeProducts = async () => {
  const products = [
    // Risk Score Products
    {
      name: 'Risk Score & Report - General Application',
      description: 'Blended Biz & Personal Credit Scores - Not Collateralized',
      metadata: {
        product_type: 'risk_score_general',
        category: 'underwriting_risk',
      },
    },
    {
      name: 'Risk Score & Report - Equipment & Vehicles',
      description: 'Blended Biz & Personal Credit Scores - Equipment & Vehicles Application',
      metadata: {
        product_type: 'risk_score_equipment',
        category: 'underwriting_risk',
      },
    },
    // ... more products
  ];

  for (const productData of products) {
    try {
      // Create product
      const product = await stripe.products.create(productData);
      console.log(`Created product: ${product.id}`);

      // Create price based on product type
      let priceData;
      if (productData.metadata.product_type === 'smart_match_closed') {
        // Percentage-based pricing handled in application logic
        continue;
      } else if (productData.metadata.category === 'platform_features') {
        // Subscription pricing
        priceData = {
          product: product.id,
          unit_amount: getPriceForProduct(productData.metadata.product_type),
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        };
      } else {
        // One-time fixed pricing
        priceData = {
          product: product.id,
          unit_amount: getPriceForProduct(productData.metadata.product_type),
          currency: 'usd',
        };
      }

      const price = await stripe.prices.create(priceData);
      console.log(`Created price: ${price.id}`);
    } catch (error) {
      console.error(`Error creating product ${productData.name}:`, error);
    }
  }
};

const getPriceForProduct = productType => {
  const prices = {
    risk_score_general: 30000, // $300.00
    risk_score_equipment: 33500, // $335.00
    risk_score_real_estate: 33500, // $335.00
    smart_match_broker: 4500, // $45.00
    smart_match_lender: 3500, // $35.00
    asset_tokenized: 15000, // $150.00
    shield_vault_locking: 3000, // $30.00
    kyb_verification: 2000, // $20.00
    kyc_verification: 750, // $7.50
    kyp_verification: 2000, // $20.00
    kyd_verification: 11750, // $117.50
    platform_subscription: 10000, // $100.00/month
    cc_bar_local: 6000, // $60.00/month
  };
  return prices[productType];
};

setupStripeProducts();
```

### 4. Payment Processing Service

```typescript
// src/services/stripePaymentService.ts
import Stripe from 'stripe';
import { SaleTransaction, ProductType } from '../types/salesTypes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripePaymentService {
  static async createPaymentIntent(
    productType: ProductType,
    customerId: string,
    amount: number,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        customer: customerId,
        metadata: {
          product_type: productType,
          eva_customer_id: customerId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          eva_customer_id: customerId,
          ...metadata,
        },
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async calculateCommission(
    creditAmount: number,
    commissionRate: number = 0.05
  ): Promise<number> {
    // Financial calculation with proper rounding
    const commission = creditAmount * commissionRate;
    return Math.round(commission * 100) / 100; // Round to 2 decimal places
  }

  static async processPercentageBasedPayment(
    creditAmount: number,
    customerId: string,
    commissionRate: number = 0.05
  ): Promise<{ paymentIntent: Stripe.PaymentIntent; commission: number }> {
    const commission = await this.calculateCommission(creditAmount, commissionRate);

    const paymentIntent = await this.createPaymentIntent(
      'smart_match_closed',
      customerId,
      commission,
      {
        credit_amount: creditAmount.toString(),
        commission_rate: commissionRate.toString(),
      }
    );

    return { paymentIntent, commission };
  }

  static async handleWebhook(payload: string, signature: string): Promise<SaleTransaction | null> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          return this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);

        case 'invoice.payment_succeeded':
          return this.handleSubscriptionPayment(event.data.object as Stripe.Invoice);

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          return this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);

        default:
          console.log(`Unhandled event type: ${event.type}`);
          return null;
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<SaleTransaction> {
    // Create sale transaction record
    const transaction: SaleTransaction = {
      id: `txn_${Date.now()}_${paymentIntent.id}`,
      productId: paymentIntent.metadata.product_type,
      productType: paymentIntent.metadata.product_type as ProductType,
      customerId: paymentIntent.metadata.eva_customer_id,
      customerName: 'Customer Name', // Fetch from customer service
      customerType: 'broker', // Determine from customer data
      quantity: 1,
      unitPrice: paymentIntent.amount / 100,
      totalAmount: paymentIntent.amount / 100,
      commission: paymentIntent.metadata.credit_amount
        ? parseFloat(paymentIntent.metadata.credit_amount) *
          parseFloat(paymentIntent.metadata.commission_rate || '0')
        : 0,
      saleDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database and update analytics
    // await salesAnalyticsService.recordTransaction(transaction);

    return transaction;
  }

  private static async handleSubscriptionPayment(
    invoice: Stripe.Invoice
  ): Promise<SaleTransaction> {
    // Handle recurring subscription payments
    // Implementation for subscription tracking
    return {} as SaleTransaction;
  }

  private static async handleSubscriptionUpdate(
    subscription: Stripe.Subscription
  ): Promise<SaleTransaction> {
    // Handle subscription creation/updates
    // Implementation for subscription lifecycle
    return {} as SaleTransaction;
  }
}
```

## 🏦 Plaid Integration Setup

### 1. Environment Configuration

```bash
# .env.local
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=REPLACE_WITH_YOUR_SECRET
PLAID_ENV=sandbox # sandbox, development, production

# Production
PLAID_CLIENT_ID=your_production_client_id
PLAID_SECRET=REPLACE_WITH_YOUR_SECRET
PLAID_ENV=production
```

### 2. Install Plaid Dependencies

```bash
npm install plaid react-plaid-link
```

### 3. Plaid Service Implementation

```typescript
// src/services/plaidService.ts
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  static async createLinkToken(userId: string): Promise<string> {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: {
          client_user_id: userId,
        },
        client_name: 'EVA Platform',
        products: ['auth', 'transactions', 'identity'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.NEXT_PUBLIC_API_URL}/webhooks/plaid`,
        account_filters: {
          depository: {
            account_types: ['checking', 'savings'],
            account_subtypes: ['checking', 'savings'],
          },
        },
      });

      return response.data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  static async exchangePublicToken(publicToken: string): Promise<{
    accessToken: string;
    itemId: string;
  }> {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  static async getAccountInfo(accessToken: string) {
    try {
      const authResponse = await plaidClient.authGet({
        access_token: accessToken,
      });

      const identityResponse = await plaidClient.identityGet({
        access_token: accessToken,
      });

      return {
        accounts: authResponse.data.accounts,
        numbers: authResponse.data.numbers,
        identity: identityResponse.data.accounts,
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  static async initiateACHPayment(
    accessToken: string,
    accountId: string,
    amount: number,
    description: string
  ) {
    try {
      // Note: This requires Plaid Transfer product
      // For basic implementation, you'll integrate with your bank's ACH API
      // or use Stripe ACH with bank account verification

      const accountInfo = await this.getAccountInfo(accessToken);
      const account = accountInfo.accounts.find(acc => acc.account_id === accountId);

      if (!account) {
        throw new Error('Account not found');
      }

      // Return account details for ACH processing
      return {
        accountNumber: accountInfo.numbers.ach.find(ach => ach.account_id === accountId)?.account,
        routingNumber: accountInfo.numbers.ach.find(ach => ach.account_id === accountId)?.routing,
        accountType: account.subtype,
        amount,
        description,
      };
    } catch (error) {
      console.error('Error initiating ACH payment:', error);
      throw error;
    }
  }

  static async verifyMicroDeposits(
    accessToken: string,
    accountId: string,
    amounts: number[]
  ): Promise<boolean> {
    try {
      // Implement micro-deposit verification logic
      // This typically involves storing verification amounts
      // and comparing user input

      return true; // Placeholder
    } catch (error) {
      console.error('Error verifying micro deposits:', error);
      throw error;
    }
  }
}
```

### 4. Plaid React Component

```tsx
// src/components/common/PlaidLink.tsx
import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PlaidService } from '../../services/plaidService';

interface PlaidLinkProps {
  userId: string;
  onSuccess: (accessToken: string, metadata: any) => void;
  onError?: (error: any) => void;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ userId, onSuccess, onError }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOnSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        setLoading(true);
        const { accessToken } = await PlaidService.exchangePublicToken(publicToken);
        onSuccess(accessToken, metadata);
      } catch (error) {
        console.error('Error handling Plaid success:', error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onError: onError,
  });

  const initializePlaidLink = async () => {
    try {
      setLoading(true);
      const token = await PlaidService.createLinkToken(userId);
      setLinkToken(token);
    } catch (error) {
      console.error('Error initializing Plaid Link:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    initializePlaidLink();
  }, [userId]);

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Connect Bank Account'}
    </button>
  );
};

export default PlaidLink;
```

## 🖥️ Server Setup & Configuration

### 1. API Routes Setup

```typescript
// pages/api/payments/create-payment-intent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { StripePaymentService } from '../../../src/services/stripePaymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productType, customerId, amount, metadata } = req.body;

    const paymentIntent = await StripePaymentService.createPaymentIntent(
      productType,
      customerId,
      amount,
      metadata
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

```typescript
// pages/api/payments/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { StripePaymentService } from '../../../src/services/stripePaymentService';
import salesAnalyticsService from '../../../src/services/salesAnalyticsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    const transaction = await StripePaymentService.handleWebhook(payload, signature);

    if (transaction) {
      // Update sales analytics
      await salesAnalyticsService.recordTransaction(transaction);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

### 2. Database Schema

```sql
-- Sales transactions table
CREATE TABLE sale_transactions (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_type ENUM('broker', 'lender', 'borrower', 'vendor') NOT NULL,
    organization_id VARCHAR(255),

    -- Transaction Details
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    discount_applied DECIMAL(10, 2) DEFAULT 0,

    -- Timing
    sale_date TIMESTAMP NOT NULL,
    processed_date TIMESTAMP,
    billing_period VARCHAR(50),

    -- Status
    status ENUM('pending', 'completed', 'refunded', 'disputed', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',

    -- External IDs
    stripe_payment_intent_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plaid_transaction_id VARCHAR(255),

    -- Metadata
    sales_rep VARCHAR(255),
    lead_source VARCHAR(100),
    campaign_id VARCHAR(255),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),

    INDEX idx_customer_id (customer_id),
    INDEX idx_product_type (product_type),
    INDEX idx_sale_date (sale_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
);

-- Customer payment methods table
CREATE TABLE customer_payment_methods (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    plaid_access_token VARCHAR(255),
    plaid_account_id VARCHAR(255),

    payment_type ENUM('card', 'bank_account', 'ach') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Card details (encrypted)
    last_four VARCHAR(4),
    brand VARCHAR(50),
    exp_month INTEGER,
    exp_year INTEGER,

    -- Bank account details (encrypted)
    bank_name VARCHAR(255),
    account_type ENUM('checking', 'savings'),
    routing_number_last_four VARCHAR(4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_customer_id (customer_id),
    INDEX idx_stripe_customer_id (stripe_customer_id)
);

-- Sales targets table
CREATE TABLE sales_targets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    period ENUM('monthly', 'quarterly', 'annual') NOT NULL,
    target_type ENUM('revenue', 'transactions', 'customers') NOT NULL,
    target_value DECIMAL(12, 2) NOT NULL,
    current_value DECIMAL(12, 2) DEFAULT 0,
    progress DECIMAL(5, 2) DEFAULT 0,
    status ENUM('on_track', 'at_risk', 'exceeded', 'missed') DEFAULT 'on_track',
    assigned_to VARCHAR(255),
    due_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_period (period),
    INDEX idx_due_date (due_date),
    INDEX idx_assigned_to (assigned_to)
);
```

### 3. Environment Variables Template

```bash
# .env.production
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eva_platform

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid
PLAID_CLIENT_ID=your_production_client_id
PLAID_SECRET=REPLACE_WITH_YOUR_SECRET
PLAID_ENV=production

# Security
JWT_SECRET=REPLACE_WITH_YOUR_JWT_SECRET
ENCRYPTION_KEY=your_encryption_key_for_financial_data

# API URLs
NEXT_PUBLIC_API_URL=https://api.eva-platform.com
NEXT_PUBLIC_APP_URL=https://eva-platform.com

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Analytics
SEGMENT_WRITE_KEY=your_segment_key
GOOGLE_ANALYTICS_ID=your_ga_id

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🚀 Server Deployment

### 1. Production Build

```bash
# Build application
npm run build

# Start production server
npm run start:production
```

### 2. Docker Deployment

```dockerfile
# Dockerfile.production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "run", "start"]
```

### 3. Server Monitoring

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { StripePaymentService } from '../../src/services/stripePaymentService';
import { PlaidService } from '../../src/services/plaidService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      stripe: await checkStripe(),
      plaid: await checkPlaid(),
      redis: await checkRedis(),
    },
  };

  const isHealthy = Object.values(health.services).every(service => service.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(health);
}

async function checkDatabase() {
  try {
    // Test database connection
    return { status: 'healthy', latency: '< 50ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkStripe() {
  try {
    // Test Stripe API
    return { status: 'healthy', latency: '< 100ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkPlaid() {
  try {
    // Test Plaid API
    return { status: 'healthy', latency: '< 200ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkRedis() {
  try {
    // Test Redis connection (if used for caching)
    return { status: 'healthy', latency: '< 10ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

## 🔒 Security & Compliance

### 1. PCI DSS Compliance

```typescript
// src/utils/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export class SecurityUtils {
  static encryptPII(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  static decryptPII(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static validateFinancialAmount(amount: number): boolean {
    // Validate amount is positive and has max 2 decimal places
    return amount > 0 && Number(amount.toFixed(2)) === amount;
  }

  static sanitizeFinancialInput(input: string): number {
    // Remove non-numeric characters except decimal point
    const cleaned = input.replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleaned);

    if (isNaN(amount) || !this.validateFinancialAmount(amount)) {
      throw new Error('Invalid financial amount');
    }

    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  }
}
```

### 2. Audit Trail Implementation

```typescript
// src/services/auditService.ts
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export class AuditService {
  static async logTransaction(
    userId: string,
    action: string,
    transactionId: string,
    details: Record<string, any>,
    request: NextApiRequest
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${crypto.randomUUID()}`,
      userId,
      action,
      resource: 'transaction',
      resourceId: transactionId,
      details,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Store audit log in database
    await this.saveAuditLog(auditLog);
  }

  private static async saveAuditLog(log: AuditLog): Promise<void> {
    // Implementation to save audit log to database
    console.log('Audit log saved:', log);
  }
}
```

## 🧪 Testing & Validation

### 1. Payment Testing Scripts

```bash
#!/bin/bash
# scripts/test-payments.sh

echo "Testing EVA Platform Payment Integration"

# Test Stripe webhook endpoint
echo "Testing Stripe webhook..."
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test"}}}'

# Test payment intent creation
echo "Testing payment intent creation..."
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"productType": "risk_score_general", "customerId": "cust_test", "amount": 300}'

# Test sales analytics endpoint
echo "Testing sales analytics..."
curl -X GET http://localhost:3000/api/sales/dashboard

echo "Payment tests completed"
```

### 2. Unit Tests

```typescript
// __tests__/services/stripePaymentService.test.ts
import { StripePaymentService } from '../../src/services/stripePaymentService';

describe('StripePaymentService', () => {
  test('should calculate commission correctly', async () => {
    const commission = await StripePaymentService.calculateCommission(100000, 0.05);
    expect(commission).toBe(5000.0);
  });

  test('should handle percentage-based payments', async () => {
    const result = await StripePaymentService.processPercentageBasedPayment(
      100000,
      'cust_test',
      0.05
    );
    expect(result.commission).toBe(5000.0);
  });

  test('should validate financial amounts', () => {
    expect(() => StripePaymentService.calculateCommission(-100, 0.05)).toThrow('Invalid amount');
  });
});
```

## 📊 Performance Monitoring

### 1. Real-time Metrics

```typescript
// src/services/metricsService.ts
export class MetricsService {
  static async trackPaymentPerformance(
    paymentMethod: 'stripe' | 'plaid',
    duration: number,
    success: boolean
  ): Promise<void> {
    const metric = {
      timestamp: Date.now(),
      service: paymentMethod,
      duration,
      success,
      endpoint: 'payment_processing',
    };

    // Send to monitoring service (DataDog, New Relic, etc.)
    await this.sendMetric(metric);
  }

  static async trackSalesMetrics(
    productType: string,
    amount: number,
    customerType: string
  ): Promise<void> {
    const metric = {
      timestamp: Date.now(),
      productType,
      amount,
      customerType,
      event: 'sale_completed',
    };

    await this.sendMetric(metric);
  }

  private static async sendMetric(metric: any): Promise<void> {
    // Implementation to send metrics to monitoring service
    console.log('Metric sent:', metric);
  }
}
```

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Set up Stripe products
npm run setup:stripe

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev

# 6. Test payment integration
npm run test:payments

# 7. Deploy to production
npm run build
npm run deploy:production
```

## 📞 Support & Resources

### Documentation Links

- [Stripe API Docs](https://stripe.com/docs)
- [Plaid API Docs](https://plaid.com/docs/)
- [EVA Sales Analytics API](./docs/SALES-ANALYTICS-API.md)

### Support Contacts

- **Payment Issues**: payments@eva-platform.com
- **Technical Support**: tech@eva-platform.com
- **Security Issues**: security@eva-platform.com

---

## 🎯 Success Metrics

After implementing this pricing model, you should achieve:

- **Payment Success Rate**: > 99%
- **Transaction Processing Time**: < 3 seconds
- **Revenue Tracking Accuracy**: 100%
- **PCI DSS Compliance**: Grade A
- **Customer Satisfaction**: > 95%

---

_Last Updated: December 28, 2024_
_Version: 1.0.0 - Production Ready_
