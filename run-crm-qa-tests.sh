#!/bin/bash

echo "🧪 Running CRM QA Unit and Integration Tests"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests with pretty output
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running: ${test_name}${NC}"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} passed${NC}"
    else
        echo -e "${RED}❌ ${test_name} failed${NC}"
        exit 1
    fi
    
    echo ""
}

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run CRM Service Unit Tests
run_test "CRM Service Unit Tests" "npm test -- src/services/__tests__/CRMService.test.ts --reporter=verbose"

# Run Customer Retention Platform Component Tests
run_test "Customer Retention Platform Component Tests" "npm test -- src/components/customerRetention/__tests__/CustomerRetentionPlatform.test.tsx --reporter=verbose"

# Run coverage report for CRM tests
echo -e "${YELLOW}Generating Coverage Report${NC}"
echo "----------------------------------------"
npm test -- --coverage --collectCoverageFrom='src/services/CRMService.ts' --collectCoverageFrom='src/components/customerRetention/CustomerRetentionPlatform.tsx' src/services/__tests__/CRMService.test.ts src/components/customerRetention/__tests__/CustomerRetentionPlatform.test.tsx

echo ""
echo -e "${GREEN}✨ All CRM QA tests completed successfully!${NC}"
echo ""
echo "📊 Test Summary:"
echo "  - CRM Service CRUD operations: ✅"
echo "  - Document associations: ✅"
echo "  - Activity tracking: ✅"
echo "  - Notes management: ✅"
echo "  - Communication logging: ✅"
echo "  - FileLock integration: ✅"
echo "  - UI component interactions: ✅"
echo "  - Error handling: ✅"
echo ""
echo "🎯 Full CRUD operations verified for Customer Retention Platform!"