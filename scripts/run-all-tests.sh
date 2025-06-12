#!/bin/bash

echo "🧪 EVA Finance AI - Comprehensive Test Suite"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
FAILED=0

# Function to run a test suite
run_test_suite() {
    local name=$1
    local command=$2
    
    echo -e "${YELLOW}Running $name...${NC}"
    
    if eval $command; then
        echo -e "${GREEN}✅ $name passed${NC}\n"
    else
        echo -e "${RED}❌ $name failed${NC}\n"
        FAILED=1
    fi
}

# 1. Type checking
run_test_suite "TypeScript type checking" "npm run typecheck"

# 2. Linting
run_test_suite "ESLint" "npm run lint"

# 3. Unit tests
run_test_suite "Unit tests" "npm run test:run"

# 4. Integration tests
run_test_suite "Integration tests" "npm run test:run -- src/test/integration"

# 5. Security tests
run_test_suite "Security tests" "npm run test:run -- src/test/security"

# 6. Accessibility tests
run_test_suite "Accessibility tests" "npm run test:run -- src/test/accessibility"

# 7. Performance tests
run_test_suite "Performance tests" "npm run test:run -- src/test/performance"

# 8. Coverage report
echo -e "${YELLOW}Generating coverage report...${NC}"
npm run test:coverage

# 9. Bundle size check
echo -e "${YELLOW}Checking bundle size...${NC}"
if [ -f "dist/assets/index.js" ]; then
    SIZE=$(du -h dist/assets/index.js | cut -f1)
    echo "Bundle size: $SIZE"
    
    # Check if bundle is under 500KB
    SIZE_KB=$(du -k dist/assets/index.js | cut -f1)
    if [ $SIZE_KB -gt 500 ]; then
        echo -e "${RED}⚠️  Warning: Bundle size exceeds 500KB${NC}"
    else
        echo -e "${GREEN}✅ Bundle size is acceptable${NC}"
    fi
else
    echo "No build found. Run 'npm run build' first."
fi

echo ""
echo "==========================================="

# Summary
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    
    # Show coverage summary
    echo ""
    echo "Coverage Summary:"
    cat coverage/coverage-summary.json | jq '.total'
else
    echo -e "${RED}❌ Some tests failed. Please fix before committing.${NC}"
    exit 1
fi

# Optional: Open coverage report in browser
read -p "Open coverage report in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open coverage/index.html 2>/dev/null || xdg-open coverage/index.html 2>/dev/null || echo "Please open coverage/index.html manually"
fi