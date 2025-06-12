import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

/**
 * 💳 EVA Platform Stripe Products Setup Script
 *
 * This script creates all the products and prices in Stripe for the EVA Platform
 * pricing structure, including risk scores, verifications, and subscriptions.
 */

require('dotenv').config();
const Stripe = require('stripe');

// Check if we're in test mode
const TEST_MODE = process.argv.includes('--test-mode');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Logging functions
const log = message => debugLog('general', 'log_statement', `${colors.green}✅ ${message}${colors.reset}`)
const warn = message => debugLog('general', 'log_statement', `${colors.yellow}⚠️  ${message}${colors.reset}`)
const error = message => debugLog('general', 'log_statement', `${colors.red}❌ ${message}${colors.reset}`)
const info = message => debugLog('general', 'log_statement', `${colors.blue}ℹ️  ${message}${colors.reset}`)

// Product definitions matching the pricing table
const STRIPE_PRODUCTS = {
  // Underwriting & Risk Products
  risk_score_general: {
    name: 'Risk Score & Report - General Application',
    description: 'Blended Biz & Personal Credit Scores - Not Collateralized',
    price: 30000, // $300.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'underwriting',
  },
  risk_score_equipment: {
    name: 'Risk Score & Report - Equipment & Vehicles',
    description: 'Equipment & Vehicles Application Risk Assessment',
    price: 33500, // $335.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'underwriting',
  },
  risk_score_real_estate: {
    name: 'Risk Score & Report - Real Estate',
    description: 'Real Estate Application Risk Assessment',
    price: 33500, // $335.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'underwriting',
  },

  // Smart Match Tools
  smart_match_broker: {
    name: 'Smart Match Decision Tool - Broker',
    description: 'Intelligent broker decision support and matching tool',
    price: 4500, // $45.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'smart_match',
  },
  smart_match_lender: {
    name: 'Smart Match Decision Tool - Lender',
    description: 'Intelligent lender decision support and matching tool',
    price: 3500, // $35.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'smart_match',
  },

  // Percentage-based (Smart Match Closed)
  smart_match_closed: {
    name: 'Smart Match Closed Commission',
    description: 'Commission-based on closed credit amount (5% of loan)',
    commission_rate: 0.05, // 5%
    min_amount: 1000,
    max_amount: 50000000,
    type: 'percentage',
    category: 'smart_match',
  },

  // Asset Services
  asset_tokenized: {
    name: 'Per Asset Pressed and Tokenized',
    description: 'Digital asset tokenization and blockchain registration service',
    price: 15000, // $150.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'asset_services',
  },

  // Security Services
  shield_vault_locking: {
    name: 'Shield Vault Transaction Document Locking',
    description: 'Secure document locking and encryption service',
    price: 3000, // $30.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'security',
  },

  // Verification Services
  kyb_verification: {
    name: 'KYB Business Verification',
    description: 'Know Your Business comprehensive verification service',
    price: 2000, // $20.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'verification',
  },
  kyc_verification: {
    name: 'KYC Person Verification',
    description: 'Know Your Customer identity verification service',
    price: 750, // $7.50 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'verification',
  },
  kyp_verification: {
    name: 'KYP Property Verification',
    description: 'Know Your Property comprehensive verification service',
    price: 2000, // $20.00 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'verification',
  },
  kyd_verification: {
    name: 'KYD Funding Verification',
    description: 'Know Your Debtor verification with 3rd party validation',
    price: 11750, // $117.50 in cents
    currency: 'usd',
    type: 'one_time',
    category: 'verification',
  },

  // Platform Subscriptions
  platform_subscription: {
    name: 'Monthly Platform Subscription',
    description: 'Complete platform access: FileLock, Advisor Bar, Safe Forms, Customer Retention',
    price: 10000, // $100.00 in cents
    currency: 'usd',
    interval: 'month',
    type: 'subscription',
    category: 'platform',
  },
  cc_bar_local: {
    name: 'CC Bar - Local Web Phone Service',
    description: 'Local web phone & call transcription with AI sentiment analysis',
    price: 6000, // $60.00 in cents
    currency: 'usd',
    interval: 'month',
    type: 'subscription',
    category: 'communication',
  },
};

// Track created products and prices
const createdItems = {
  products: [],
  prices: [],
  errors: [],
};

/**
 * Check if Stripe is properly configured
 */
async function validateStripeConfig() {
  try {
    info('Validating Stripe configuration...');

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    if (TEST_MODE) {
      if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        warn('Not using test key in test mode - this will create real products!');
      }
    } else {
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        warn('Using test key in production mode');
      }
    }

    // Test Stripe connection
    await stripe.balance.retrieve();
    log('Stripe connection validated successfully');

    return true;
  } catch (err) {
    error(`Stripe configuration validation failed: ${err.message}`);
    return false;
  }
}

/**
 * Check if a product already exists
 */
async function productExists(productName) {
  try {
    const products = await stripe.products.list({
      limit: 100,
    });

    return products.data.find(
      product => product.name === productName || product.metadata?.eva_product_key
    );
  } catch (err) {
    if (VERBOSE) warn(`Error checking product existence: ${err.message}`);
    return null;
  }
}

/**
 * Create a single product in Stripe
 */
async function createProduct(productKey, productData) {
  try {
    info(`Creating product: ${productData.name}`);

    // Check if product already exists
    const existing = await productExists(productData.name);
    if (existing && !TEST_MODE) {
      warn(`Product already exists: ${productData.name} (${existing.id})`);
      return existing;
    }

    // Create the product
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      metadata: {
        eva_product_key: productKey,
        eva_product_type: productData.type,
        eva_category: productData.category,
        created_by: 'eva_setup_script',
        created_at: new Date().toISOString(),
      },
    });

    log(`Product created: ${product.id} - ${productData.name}`);
    createdItems.products.push({
      key: productKey,
      id: product.id,
      name: productData.name,
    });

    return product;
  } catch (err) {
    error(`Failed to create product ${productKey}: ${err.message}`);
    createdItems.errors.push({
      type: 'product',
      key: productKey,
      error: err.message,
    });
    return null;
  }
}

/**
 * Create a price for a product
 */
async function createPrice(product, productKey, productData) {
  try {
    // Skip percentage-based products (handled dynamically)
    if (productData.type === 'percentage') {
      info(`Skipping price creation for percentage-based product: ${productKey}`);
      return null;
    }

    info(`Creating price for: ${productData.name}`);

    let priceData = {
      product: product.id,
      unit_amount: productData.price,
      currency: productData.currency,
      metadata: {
        eva_product_key: productKey,
        eva_category: productData.category,
        created_by: 'eva_setup_script',
      },
    };

    // Add recurring interval for subscriptions
    if (productData.type === 'subscription') {
      priceData.recurring = {
        interval: productData.interval,
        interval_count: 1,
      };
    }

    const price = await stripe.prices.create(priceData);

    log(`Price created: ${price.id} - $${(productData.price / 100).toFixed(2)}`);
    createdItems.prices.push({
      key: productKey,
      id: price.id,
      amount: productData.price,
      type: productData.type,
    });

    return price;
  } catch (err) {
    error(`Failed to create price for ${productKey}: ${err.message}`);
    createdItems.errors.push({
      type: 'price',
      key: productKey,
      error: err.message,
    });
    return null;
  }
}

/**
 * Generate environment variable suggestions
 */
function generateEnvVars() {
  debugLog('general', 'log_statement', 
    `\n${colors.cyan}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}║                Environment Variables                          ║${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`
  )

  debugLog('general', 'log_statement', `\n${colors.yellow}Add these to your .env.production file:${colors.reset}\n`)

  createdItems.prices.forEach(item => {
    const envVar = `STRIPE_PRICE_${item.key.toUpperCase()}=${item.id}`;
    debugLog('general', 'log_statement', `${envVar}`)
  });

  // Add percentage-based product info
  const percentageProduct = createdItems.products.find(p => p.key === 'smart_match_closed');
  if (percentageProduct) {
    debugLog('general', 'log_statement', `STRIPE_PRODUCT_SMART_MATCH_CLOSED=${percentageProduct.id}`)
  }
}

/**
 * Display setup summary
 */
function displaySummary() {
  debugLog('general', 'log_statement', 
    `\n${colors.magenta}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.magenta}║                    Setup Summary                              ║${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.magenta}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`
  )

  debugLog('general', 'log_statement', `\n📊 Products Created: ${createdItems.products.length}`)
  debugLog('general', 'log_statement', `💰 Prices Created: ${createdItems.prices.length}`)
  debugLog('general', 'log_statement', `❌ Errors: ${createdItems.errors.length}`)

  if (createdItems.errors.length > 0) {
    debugLog('general', 'log_statement', `\n${colors.red}Errors encountered:${colors.reset}`)
    createdItems.errors.forEach(error => {
      debugLog('general', 'log_statement', `  • ${error.key}: ${error.error}`)
    });
  }

  // Summary by category
  const categories = {};
  createdItems.products.forEach(product => {
    const productData = STRIPE_PRODUCTS[product.key];
    const category = productData.category;
    if (!categories[category]) categories[category] = [];
    categories[category].push(product);
  });

  debugLog('general', 'log_statement', `\n📂 Products by Category:`)
  Object.entries(categories).forEach(([category, products]) => {
    debugLog('general', 'log_statement', `  ${category}: ${products.length} products`)
  });

  // Pricing breakdown
  let totalOneTime = 0;
  let totalMonthlyRecurring = 0;

  createdItems.prices.forEach(price => {
    const productData = STRIPE_PRODUCTS[price.key];
    if (productData.type === 'subscription') {
      totalMonthlyRecurring += price.amount;
    } else if (productData.type === 'one_time') {
      totalOneTime += price.amount;
    }
  });

  debugLog('general', 'log_statement', `\n💵 Pricing Summary:`)
  debugLog('general', 'log_statement', `  One-time products total: ${(totalOneTime / 100).toFixed(2)}`);
  debugLog('general', 'log_statement', `  Monthly recurring total: ${(totalMonthlyRecurring / 100).toFixed(2)}`);

  // Next steps
  debugLog('general', 'log_statement', `\n${colors.blue}Next Steps:${colors.reset}`)
  debugLog('general', 'log_statement', `1. Update your environment variables (see above)`);
  debugLog('general', 'log_statement', `2. Test payment flows with test cards`)
  debugLog('general', 'log_statement', `3. Configure webhooks in Stripe dashboard`)
  debugLog('general', 'log_statement', `4. Set up tax settings if applicable`)
  debugLog('general', 'log_statement', `5. Review products in Stripe dashboard`)
}

/**
 * Main setup function
 */
async function main() {
  debugLog('general', 'log_statement', 
    `${colors.cyan}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}║              EVA Platform Stripe Products Setup              ║${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}║                                                               ║${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}║  Creating products for comprehensive sales tracking system   ║${colors.reset}`
  )
  debugLog('general', 'log_statement', 
    `${colors.cyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`
  )

  if (TEST_MODE) {
    warn('Running in TEST MODE - will create test products');
  } else {
    info('Running in PRODUCTION MODE');
  }

  // Validate Stripe configuration
  if (!(await validateStripeConfig())) {
    process.exit(1);
  }

  // Create products and prices
  let successCount = 0;
  const totalProducts = Object.keys(STRIPE_PRODUCTS).length;

  for (const [productKey, productData] of Object.entries(STRIPE_PRODUCTS)) {
    try {
      info(`\n[${successCount + 1}/${totalProducts}] Processing: ${productData.name}`);

      // Create product
      const product = await createProduct(productKey, productData);
      if (!product) continue;

      // Create price (if applicable)
      const price = await createPrice(product, productKey, productData);

      successCount++;

      // Add delay to avoid rate limits
      if (!TEST_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      error(`Unexpected error processing ${productKey}: ${err.message}`);
      createdItems.errors.push({
        type: 'unexpected',
        key: productKey,
        error: err.message,
      });
    }
  }

  // Display results
  displaySummary();
  generateEnvVars();

  if (createdItems.errors.length === 0) {
    log(`\n🎉 All products and prices created successfully!`);

    debugLog('general', 'log_statement', 
      `\n${colors.green}Stripe dashboard: https://dashboard.stripe.com/products${colors.reset}`
    )
    process.exit(0);
  } else {
    warn(`\n⚠️  Setup completed with ${createdItems.errors.length} errors`);
    debugLog('general', 'log_statement', `\nCheck the errors above and re-run the script if needed.`)
    process.exit(1);
  }
}

/**
 * Handle script interruption
 */
process.on('SIGINT', () => {
  warn('\nScript interrupted by user');
  debugLog('general', 'log_statement', '\nPartially created products may exist in your Stripe account.')
  debugLog('general', 'log_statement', 'Check your Stripe dashboard and clean up if necessary.')
  process.exit(130);
});

/**
 * Handle unhandled errors
 */
process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  debugLog('general', 'log_statement', `
EVA Platform Stripe Products Setup Script

Usage: node scripts/setup-stripe-products.js [options]

Options:
  --test-mode     Run in test mode (safer for development)
  --verbose, -v   Show verbose output
  --help, -h      Show this help message

Environment Variables:
  STRIPE_SECRET_KEY   Your Stripe secret key (required)

Examples:
  node scripts/setup-stripe-products.js --test-mode
  node scripts/setup-stripe-products.js --verbose
  node scripts/setup-stripe-products.js

This script creates all EVA Platform products in Stripe:
• Risk score and reports ($300-335)
• Smart match tools ($35-45)
• Verification services ($7.50-117.50)
• Platform subscriptions ($60-100/month)
• Asset tokenization ($150)
• Security services ($30)

The script will output environment variables to add to your .env file.
`);
  process.exit(0);
}

// Run the setup
main().catch(err => {
  error(`Fatal error: ${err.message}`);
  if (VERBOSE) {
    console.error(err.stack);
  }
  process.exit(1);
});
