#!/bin/bash

# EVA Platform - Cloudflare Deployment Script
# This script sets up and deploys the EVA Platform to Cloudflare Workers and Pages

set -e

echo "🚀 EVA Platform - Cloudflare Deployment"
echo "======================================="

# Configuration
ACCOUNT_ID="eace6f3c56b5735ae4a9ef385d6ee914"
ZONE_ID="913680b4428f2f4d1c078dd841cd8cdb"
BUCKET_NAME="eva-fin-b-test-r2-frontend-services"
PROJECT_NAME="eva-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if wrangler is installed
print_step "Checking Wrangler installation..."
if ! command -v wrangler &> /dev/null; then
    print_warning "Wrangler not found. Installing..."
    npm install -g wrangler
    print_success "Wrangler installed successfully"
else
    print_success "Wrangler is already installed"
fi

# Login to Cloudflare (if not already logged in)
print_step "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    print_warning "Not logged in to Cloudflare. Please log in..."
    wrangler login
else
    print_success "Already logged in to Cloudflare"
fi

# Create R2 bucket if it doesn't exist
print_step "Setting up R2 bucket: $BUCKET_NAME"
if wrangler r2 bucket create $BUCKET_NAME --account-id $ACCOUNT_ID; then
    print_success "R2 bucket created or already exists"
else
    print_warning "R2 bucket may already exist, continuing..."
fi

# Create KV namespaces
print_step "Creating KV namespaces..."
print_step "Creating SESSION_STORE namespace..."
wrangler kv:namespace create "SESSION_STORE" --account-id $ACCOUNT_ID || print_warning "SESSION_STORE namespace may already exist"

print_step "Creating CONFIG_STORE namespace..."
wrangler kv:namespace create "CONFIG_STORE" --account-id $ACCOUNT_ID || print_warning "CONFIG_STORE namespace may already exist"

# Build the application
print_step "Building the application..."
npm run build
print_success "Application built successfully"

# Deploy to Cloudflare Pages
print_step "Deploying to Cloudflare Pages..."
if wrangler pages project create $PROJECT_NAME --account-id $ACCOUNT_ID; then
    print_success "Pages project created"
else
    print_warning "Pages project may already exist, continuing..."
fi

print_step "Deploying built files to Pages..."
wrangler pages deploy build --project-name $PROJECT_NAME --account-id $ACCOUNT_ID
print_success "Deployed to Cloudflare Pages"

# Set up environment variables for Pages
print_step "Setting up Pages environment variables..."
ENV_VARS=(
    "REACT_APP_CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID"
    "REACT_APP_CLOUDFLARE_ZONE_ID=$ZONE_ID"
    "REACT_APP_R2_BUCKET=$BUCKET_NAME"
    "REACT_APP_R2_ENDPOINT=https://$ACCOUNT_ID.r2.cloudflarestorage.com"
    "REACT_APP_R2_S3_API_URL=https://$ACCOUNT_ID.r2.cloudflarestorage.com/$BUCKET_NAME"
    "REACT_APP_R2_CATALOG_URL=https://catalog.cloudflarestorage.com/$ACCOUNT_ID/$BUCKET_NAME"
    "REACT_APP_WORKERS_URL=https://eva-platform.$ACCOUNT_ID.workers.dev"
    "REACT_APP_CDN_URL=https://cdn.eva-platform.$ACCOUNT_ID.workers.dev"
    "REACT_APP_API_URL=https://api.eva-platform.$ACCOUNT_ID.workers.dev/api"
    "REACT_APP_WEBSOCKET_URL=wss://api.eva-platform.$ACCOUNT_ID.workers.dev/ws"
    "REACT_APP_ENVIRONMENT=production"
)

for env_var in "${ENV_VARS[@]}"; do
    key=$(echo $env_var | cut -d'=' -f1)
    value=$(echo $env_var | cut -d'=' -f2-)
    wrangler pages secret put $key --project-name $PROJECT_NAME --account-id $ACCOUNT_ID <<< "$value"
done

print_success "Environment variables configured"

# Deploy Workers (if worker.js exists)
if [ -f "src/worker.js" ]; then
    print_step "Deploying Cloudflare Workers..."
    wrangler deploy --account-id $ACCOUNT_ID
    print_success "Workers deployed successfully"
else
    print_warning "No worker.js found, skipping Workers deployment"
fi

# Set up DNS (optional)
print_step "DNS Configuration (manual step required)"
print_warning "Please manually configure your DNS to point to:"
echo "  • Pages: $PROJECT_NAME.pages.dev"
echo "  • Workers: eva-platform.$ACCOUNT_ID.workers.dev"

# Final summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
print_success "Frontend deployed to: https://$PROJECT_NAME.pages.dev"
print_success "R2 Bucket: $BUCKET_NAME"
print_success "Account ID: $ACCOUNT_ID"
print_success "Zone ID: $ZONE_ID"

echo ""
echo "📝 Next Steps:"
echo "1. Configure your custom domain in Cloudflare Pages"
echo "2. Set up any additional secrets using 'wrangler secret put'"
echo "3. Configure SSL/TLS settings in Cloudflare dashboard"
echo "4. Set up monitoring and analytics"

echo ""
echo "🔗 Useful URLs:"
echo "• Cloudflare Dashboard: https://dash.cloudflare.com/$ACCOUNT_ID"
echo "• Pages Dashboard: https://dash.cloudflare.com/$ACCOUNT_ID/pages"
echo "• R2 Dashboard: https://dash.cloudflare.com/$ACCOUNT_ID/r2"
echo "• Workers Dashboard: https://dash.cloudflare.com/$ACCOUNT_ID/workers"

echo ""
print_success "Deployment script completed successfully! 🚀" 