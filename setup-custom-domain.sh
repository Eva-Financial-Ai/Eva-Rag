#!/bin/bash

# ===================================================================
# EVA Platform - Custom Domain Setup Script (demo.eva.ai)
# ===================================================================

echo "🌐 Setting up custom domain: demo.eva.ai"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="eva-ai-platform"
CUSTOM_DOMAIN="demo.eva.ai"
ZONE_ID="79cbd8176057c91e2e2329ffd8b386a5"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Project: $PROJECT_NAME"
echo "   Domain: $CUSTOM_DOMAIN"
echo "   Zone ID: $ZONE_ID"
echo ""

# Step 1: Deploy current version
echo -e "${YELLOW}🚀 Step 1: Building and deploying current version...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

wrangler pages deploy build --project-name "$PROJECT_NAME"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Step 2: Domain configuration instructions
echo ""
echo -e "${YELLOW}🔧 Step 2: Manual Domain Configuration Required${NC}"
echo "==============================================="
echo ""
echo -e "${BLUE}📌 ACTION REQUIRED: Configure custom domain in Cloudflare Dashboard${NC}"
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Navigate to: 'Workers & Pages' → 'eva-ai-platform' → 'Custom domains'"
echo "3. Click: 'Set up a custom domain'"
echo "4. Enter: $CUSTOM_DOMAIN"
echo "5. Choose: 'Activate domain'"
echo ""

# Step 3: DNS Records setup
echo -e "${YELLOW}🌍 Step 3: DNS Records Configuration${NC}"
echo "==============================================="
echo ""
echo -e "${BLUE}📋 Required DNS Records for eva.ai domain:${NC}"
echo ""
echo "Record Type: CNAME"
echo "Name:        demo"
echo "Target:      eva-ai-platform.pages.dev"
echo "TTL:         1 second (for instant updates)"
echo ""
echo -e "${GREEN}Alternative A Record (if CNAME doesn't work):${NC}"
echo "Record Type: A"  
echo "Name:        demo"
echo "IPv4:        [Get IP from: dig eva-ai-platform.pages.dev]"
echo ""

# Step 4: Verification script
echo -e "${YELLOW}🔍 Step 4: Domain Verification${NC}"
echo "==============================================="
echo ""
echo "After DNS propagation (5-30 minutes), test:"
echo ""
echo -e "${BLUE}Command: dig $CUSTOM_DOMAIN${NC}"
echo -e "${BLUE}Command: curl -I https://$CUSTOM_DOMAIN${NC}"
echo ""

# Step 5: SSL Certificate
echo -e "${YELLOW}🔒 Step 5: SSL Certificate${NC}"
echo "==============================================="
echo ""
echo "Cloudflare will automatically issue SSL certificate for:"
echo "- https://$CUSTOM_DOMAIN"
echo ""
echo "This process typically takes 5-15 minutes after domain activation."
echo ""

# Step 6: Test the setup
echo -e "${YELLOW}🧪 Step 6: Testing URLs${NC}"
echo "==============================================="
echo ""
echo "Once DNS propagates, these URLs should work:"
echo ""
echo -e "${GREEN}✅ Primary:   https://$CUSTOM_DOMAIN${NC}"
echo -e "${GREEN}✅ Dashboard: https://$CUSTOM_DOMAIN/dashboard${NC}"
echo -e "${GREEN}✅ AI Chat:   https://$CUSTOM_DOMAIN/ai-assistant${NC}"
echo ""

# Get current deployment URL for reference
CURRENT_URL=$(wrangler pages project list | grep "$PROJECT_NAME" | awk '{print $2}')
echo -e "${BLUE}📋 Current deployment URL (for reference):${NC}"
echo "   https://$CURRENT_URL"
echo ""

# Final instructions
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "==============================================="
echo ""
echo "1. ✅ Code changes deployed (EVA AI auto-popup removed)"
echo "2. 🔧 Manual: Add custom domain in Cloudflare Dashboard"
echo "3. 🌍 Manual: Configure DNS records for eva.ai domain"
echo "4. ⏱️  Wait: 5-30 minutes for DNS propagation"
echo "5. 🔒 Wait: 5-15 minutes for SSL certificate"
echo "6. 🧪 Test: Visit https://$CUSTOM_DOMAIN"
echo ""

echo -e "${GREEN}🎉 Setup script completed!${NC}"
echo -e "${BLUE}📋 Summary: EVA AI auto-popup removed, ready for custom domain setup${NC}" 