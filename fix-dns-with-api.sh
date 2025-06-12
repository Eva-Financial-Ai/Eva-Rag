#!/bin/bash

# ===================================================================
# EVA Platform - DNS Fix Script using Cloudflare API
# ===================================================================

echo "🔧 DNS Fix Script for evafi.ai"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ZONE_NAME="evafi.ai"
ZONE_ID="79cbd8176057c91e2e2329ffd8b386a5"
MISSING_RECORD_NAME="evafi.ai"
MISSING_RECORD_IP="76.76.21.21"

# Check if API token is provided
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable not set${NC}"
    echo ""
    echo -e "${YELLOW}📋 Required API Permissions:${NC}"
    echo "  - Zone:Zone:Read"
    echo "  - Zone:DNS:Read"
    echo "  - Zone:DNS:Edit"
    echo ""
    echo -e "${BLUE}🔗 Create token at: https://dash.cloudflare.com/profile/api-tokens${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  export CLOUDFLARE_API_TOKEN=\"your_token_here\""
    echo "  ./fix-dns-with-api.sh"
    echo ""
    exit 1
fi

echo -e "${BLUE}🔍 Checking current DNS records...${NC}"

# Test API token validity
echo "Testing API token..."
token_test=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

token_valid=$(echo "$token_test" | grep -o '"success":true' | wc -l)

if [ "$token_valid" -eq 0 ]; then
    echo -e "${RED}❌ Invalid API token${NC}"
    echo "Response: $token_test"
    exit 1
fi

echo -e "${GREEN}✅ API token valid${NC}"

# Get current DNS records for the zone
echo "Fetching DNS records for $ZONE_NAME..."
dns_records=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$MISSING_RECORD_NAME&type=A" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

# Check if A record exists
a_record_count=$(echo "$dns_records" | grep -o '"type":"A"' | wc -l)

if [ "$a_record_count" -gt 0 ]; then
    echo -e "${GREEN}✅ A record for $MISSING_RECORD_NAME already exists${NC}"
    echo "Current records:"
    echo "$dns_records" | grep -o '"content":"[^"]*"' | sed 's/"content"://g' | sed 's/"//g'
    
    echo ""
    echo -e "${YELLOW}🔍 Testing domain resolution...${NC}"
    dig_result=$(dig +short $MISSING_RECORD_NAME)
    if [ -n "$dig_result" ]; then
        echo -e "${GREEN}✅ Domain resolving to: $dig_result${NC}"
    else
        echo -e "${RED}❌ Domain not resolving - DNS propagation may be in progress${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️  No A record found for $MISSING_RECORD_NAME${NC}"
    echo -e "${BLUE}🛠️  Creating missing A record...${NC}"
    
    # Create the missing A record
    create_response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{
        \"type\": \"A\",
        \"name\": \"$MISSING_RECORD_NAME\",
        \"content\": \"$MISSING_RECORD_IP\",
        \"ttl\": 1,
        \"proxied\": true
      }")
    
    # Check if creation was successful
    create_success=$(echo "$create_response" | grep -o '"success":true' | wc -l)
    
    if [ "$create_success" -gt 0 ]; then
        echo -e "${GREEN}✅ A record created successfully!${NC}"
        echo "Record: $MISSING_RECORD_NAME → $MISSING_RECORD_IP (Proxied)"
        
        # Get the record ID for reference
        record_id=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//g' | sed 's/"//g')
        echo "Record ID: $record_id"
        
    else
        echo -e "${RED}❌ Failed to create A record${NC}"
        echo "Response: $create_response"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}🧪 Testing DNS resolution...${NC}"

# Test DNS resolution
echo "Testing dig $MISSING_RECORD_NAME..."
dig_result=$(dig +short $MISSING_RECORD_NAME)

if [ -n "$dig_result" ]; then
    echo -e "${GREEN}✅ Domain resolving to:${NC}"
    echo "$dig_result"
else
    echo -e "${YELLOW}⏳ Domain not resolving yet - DNS propagation in progress${NC}"
    echo "This can take 1-30 minutes depending on your location"
fi

echo ""
echo -e "${YELLOW}🔍 Testing subdomain (should already work)...${NC}"
demo_result=$(dig +short demo.evafi.ai)
if [ -n "$demo_result" ]; then
    echo -e "${GREEN}✅ demo.evafi.ai resolving to:${NC}"
    echo "$demo_result"
else
    echo -e "${RED}❌ demo.evafi.ai not resolving${NC}"
fi

echo ""
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "==============="
echo "1. ✅ DNS A record restored (if was missing)"
echo "2. ⏳ Wait for DNS propagation (1-30 minutes)"
echo "3. 🔧 Add demo.evafi.ai to Cloudflare Pages dashboard"
echo "4. 🧪 Test https://demo.evafi.ai"
echo ""

echo -e "${BLUE}📋 Manual verification commands:${NC}"
echo "dig evafi.ai"
echo "dig demo.evafi.ai"
echo "curl -I https://demo.evafi.ai"
echo ""

echo -e "${GREEN}🎉 DNS fix script completed!${NC}" 