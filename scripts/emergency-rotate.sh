#!/bin/bash

# 🚨 EMERGENCY CREDENTIAL ROTATION SCRIPT
# Run this immediately after security breach detection
# Based on Google Cloud API security best practices

set -e

echo "🚨 EMERGENCY: Rotating ALL secrets across ALL environments..."
echo "⚠️  Make sure you have already revoked the compromised credentials in each service dashboard!"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare. Run: wrangler login"
    exit 1
fi

echo "✅ Wrangler authenticated"
echo ""

# Function to rotate secrets for an environment
rotate_environment_secrets() {
    local env=$1
    echo "🔄 Updating $env environment secrets..."
    
    echo "  📝 Enter NEW credentials (the old ones should already be revoked):"
    
    echo "  🔑 Cloudflare API Token (includes Images permissions):"
    wrangler secret put CLOUDFLARE_API_TOKEN --env $env
    
    echo "  🏦 Plaid Client ID:"
    wrangler secret put PLAID_CLIENT_ID --env $env
    
    echo "  🏦 Plaid Public Key:"
    wrangler secret put PLAID_PUBLIC_KEY --env $env
    
    echo "  📧 SendGrid API Key:"
    wrangler secret put SENDGRID_API_KEY --env $env
    
    echo "  📱 Twilio Account SID:"
    wrangler secret put TWILIO_ACCOUNT_SID --env $env
    
    echo "  📱 Twilio Auth Token:"
    wrangler secret put TWILIO_AUTH_TOKEN --env $env
    
    echo "  🔐 Auth0 Client ID:"
    wrangler secret put AUTH0_CLIENT_ID --env $env
    
    echo "  🔐 Auth0 Client Secret:"
    wrangler secret put AUTH0_CLIENT_SECRET --env $env
    
    echo "  🗺️  Geoapify API Key:"
    wrangler secret put GEOAPIFY_API_KEY --env $env
    
    echo "  🔒 Encryption Key (generate a new 256-bit key):"
    wrangler secret put ENCRYPTION_KEY --env $env
    
    if [ "$env" = "production" ]; then
        echo "  💳 Stripe Secret Key:"
        wrangler secret put STRIPE_SECRET_KEY --env $env
    fi
    
    echo "  ✅ $env environment secrets updated"
    echo ""
}

# Rotate secrets for all environments
echo "🚀 Starting emergency rotation for all environments..."
echo ""

rotate_environment_secrets "development"
rotate_environment_secrets "staging" 
rotate_environment_secrets "production"

echo "🎉 Emergency rotation complete!"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "1. 🌐 Update frontend deployment environment variables in Vercel/Netlify dashboard"
echo "2. 📱 Update mobile app configuration if applicable"
echo "3. 👥 Notify all team members immediately"
echo "4. 📊 Check service dashboards for unauthorized usage"
echo "5. 🔍 Review access logs for the past 24-48 hours"
echo "6. 📝 Document the incident and lessons learned"
echo ""
echo "📞 If you suspect active compromise, contact:"
echo "   - Cloudflare Security: security@cloudflare.com"
echo "   - Plaid Security: security@plaid.com"
echo "   - SendGrid Security: security@sendgrid.com"
echo "   - Auth0 Security: security@auth0.com"
echo "   - Twilio Security: security@twilio.com"
echo ""
echo "✅ Emergency rotation script completed successfully" 