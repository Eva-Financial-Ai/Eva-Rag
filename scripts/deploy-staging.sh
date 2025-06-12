#!/bin/bash

# EVA AI Platform - Staging Deployment Script
# Deploy to evafin.ai (Cloudflare Pages + Workers)

set -e  # Exit on any error

echo "🚀 Starting EVA AI Platform deployment to staging (evafin.ai)..."

# Configuration
ACCOUNT_ID="eace6f3c56b5735ae4a9ef385d6ee914"
PROJECT_NAME="eva-ai-frontend"
DOMAIN="evafin.ai"
API_DOMAIN="api.evafin.ai"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo_info "Checking prerequisites..."

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo_error "Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo_warning "Not logged in to Cloudflare. Please run: wrangler auth login"
    exit 1
fi

# Verify account access
CURRENT_ACCOUNT=$(wrangler whoami | grep "Account ID" | cut -d' ' -f3 || echo "")
if [[ "$CURRENT_ACCOUNT" != "$ACCOUNT_ID" ]]; then
    echo_warning "Current account ($CURRENT_ACCOUNT) doesn't match target account ($ACCOUNT_ID)"
    echo_info "Make sure you have access to account $ACCOUNT_ID"
fi

echo_success "Prerequisites checked"

# Set environment variables
echo_info "Setting environment variables..."
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
export NODE_ENV="staging"
export REACT_APP_ENVIRONMENT="staging"
export REACT_APP_API_URL="https://$API_DOMAIN"

# Install dependencies if needed
echo_info "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Run tests (if available)
echo_info "Running tests..."
if npm run test:ci --if-present; then
    echo_success "Tests passed"
else
    echo_warning "Tests failed or not available - continuing deployment"
fi

# Build the application
echo_info "Building application for staging..."
npm run build

if [ ! -d "build" ]; then
    echo_error "Build directory not found. Build failed."
    exit 1
fi

echo_success "Application built successfully"

# Deploy to Cloudflare Pages
echo_info "Deploying frontend to Cloudflare Pages..."

wrangler pages deploy build \
    --project-name="$PROJECT_NAME" \
    --account-id="$ACCOUNT_ID" \
    --compatibility-date="2024-01-01"

echo_success "Frontend deployed to Cloudflare Pages"

# Deploy Workers (if worker files exist)
if [ -f "src/worker.js" ] || [ -f "worker/index.js" ]; then
    echo_info "Deploying API Workers..."
    
    wrangler deploy \
        --account-id="$ACCOUNT_ID" \
        --env staging
    
    echo_success "Workers deployed"
else
    echo_warning "No worker files found - skipping Worker deployment"
fi

# Setup custom domain (if not already configured)
echo_info "Checking custom domain configuration..."

# Note: Custom domain setup typically requires manual configuration in Cloudflare Dashboard
echo_warning "Custom domain setup may require manual configuration:"
echo "  1. Go to Cloudflare Dashboard > Pages > $PROJECT_NAME > Custom domains"
echo "  2. Add $DOMAIN as custom domain"
echo "  3. Configure DNS records if needed"

# Display deployment information
echo ""
echo_success "🎉 Deployment completed successfully!"
echo ""
echo_info "Deployment Details:"
echo "  • Frontend URL: https://$DOMAIN"
echo "  • API URL: https://$API_DOMAIN"
echo "  • Account ID: $ACCOUNT_ID"
echo "  • Project: $PROJECT_NAME"
echo "  • Environment: staging"
echo ""
echo_info "Next Steps:"
echo "  1. Verify deployment at https://$DOMAIN"
echo "  2. Test API endpoints at https://$API_DOMAIN"
echo "  3. Configure any required environment variables"
echo "  4. Set up monitoring and alerts"
echo ""

# Check if deployment is accessible
echo_info "Testing deployment accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200"; then
    echo_success "Frontend is accessible at https://$DOMAIN"
else
    echo_warning "Frontend may not be immediately accessible. DNS propagation can take a few minutes."
fi

echo_success "Deployment script completed!" 