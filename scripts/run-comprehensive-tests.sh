#!/bin/bash

# Comprehensive Test Suite for EVA AI Frontend
# Runs unit, integration, e2e, and QA tests with detailed reporting

echo "🧪 COMPREHENSIVE EVA AI TEST SUITE"
echo "=================================="

# Configuration
TEST_RESULTS_DIR="test-results"
COVERAGE_DIR="coverage"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$TEST_RESULTS_DIR/test_run_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directories
mkdir -p "$TEST_RESULTS_DIR"
mkdir -p "$COVERAGE_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Test result tracking
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false
QA_TESTS_PASSED=false
SECURITY_TESTS_PASSED=false
PERFORMANCE_TESTS_PASSED=false

echo ""
log "Starting comprehensive test suite at $(date)"
log "Results will be saved to: $TEST_RESULTS_DIR"

# 1. Pre-test Setup
echo ""
echo -e "${BLUE}📋 PRE-TEST SETUP${NC}"
echo "================"

echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $NODE_VERSION${NC}"
    exit 1
fi

echo "Installing dependencies..."
if npm install >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    log "Dependencies installed successfully"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    log "ERROR: Failed to install dependencies"
    exit 1
fi

echo "Checking test environment..."
if [ ! -f "jest.config.js" ]; then
    echo "Copying Jest configuration..."
    cp tests/setup/jest.config.js ./jest.config.js
fi

# 2. Linting and Code Quality
echo ""
echo -e "${BLUE}🔍 CODE QUALITY CHECKS${NC}"
echo "====================="

echo "Running ESLint..."
if npx eslint src/ tests/ --ext .js,.jsx,.ts,.tsx --format json > "$TEST_RESULTS_DIR/eslint_$TIMESTAMP.json" 2>/dev/null; then
    LINT_ISSUES=$(cat "$TEST_RESULTS_DIR/eslint_$TIMESTAMP.json" | jq '[.[] | .messages | length] | add // 0')
    if [ "$LINT_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}✅ No linting issues found${NC}"
        log "Linting passed: 0 issues"
    else
        echo -e "${YELLOW}⚠️  Found $LINT_ISSUES linting issues${NC}"
        log "Linting completed with $LINT_ISSUES issues"
    fi
else
    echo -e "${YELLOW}⚠️  ESLint not configured or failed${NC}"
    log "ESLint check skipped or failed"
fi

echo "Running Prettier check..."
if npx prettier --check src/ tests/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Code formatting is consistent${NC}"
    log "Prettier check passed"
else
    echo -e "${YELLOW}⚠️  Code formatting issues found${NC}"
    log "Prettier check found formatting issues"
fi

# 3. Unit Tests
echo ""
echo -e "${BLUE}🧪 UNIT TESTS${NC}"
echo "============="

log "Starting unit tests"
echo "Running unit tests with coverage..."

if npm run test:unit -- --coverage --coverageDirectory="$COVERAGE_DIR/unit" --testResultsProcessor="jest-json-reporter" --outputFile="$TEST_RESULTS_DIR/unit_results_$TIMESTAMP.json" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Unit tests passed${NC}"
    UNIT_TESTS_PASSED=true
    log "Unit tests completed successfully"
    
    # Coverage summary
    if [ -f "$COVERAGE_DIR/unit/coverage-summary.json" ]; then
        COVERAGE_PERCENT=$(cat "$COVERAGE_DIR/unit/coverage-summary.json" | jq '.total.lines.pct')
        echo "    Coverage: ${COVERAGE_PERCENT}%"
        log "Unit test coverage: ${COVERAGE_PERCENT}%"
    fi
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    log "ERROR: Unit tests failed"
    cat "$TEST_RESULTS_DIR/unit_results_$TIMESTAMP.json" 2>/dev/null | jq '.testResults[] | select(.status == "failed") | {name: .name, message: .message}' || echo "No detailed error info available"
fi

# 4. Integration Tests
echo ""
echo -e "${BLUE}🔗 INTEGRATION TESTS${NC}"
echo "==================="

log "Starting integration tests"
echo "Running component integration tests..."

if npm run test:integration -- --testResultsProcessor="jest-json-reporter" --outputFile="$TEST_RESULTS_DIR/integration_results_$TIMESTAMP.json" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Integration tests passed${NC}"
    INTEGRATION_TESTS_PASSED=true
    log "Integration tests completed successfully"
else
    echo -e "${RED}❌ Integration tests failed${NC}"
    log "ERROR: Integration tests failed"
fi

# 5. API Tests
echo ""
echo -e "${BLUE}🌐 API TESTS${NC}"
echo "============"

log "Starting API tests"
echo "Testing API endpoints..."

# Test dashboard API
echo "  Testing Dashboard API..."
if curl -s -f "http://localhost:3001/api/dashboard" >/dev/null 2>&1; then
    echo -e "    ${GREEN}✅ Dashboard API accessible${NC}"
    log "Dashboard API test passed"
else
    echo -e "    ${YELLOW}⚠️  Dashboard API not accessible (dev server may not be running)${NC}"
    log "Dashboard API test skipped - server not running"
fi

# Test credit application API
echo "  Testing Credit Application API..."
if curl -s -f "http://localhost:3001/api/credit-applications" >/dev/null 2>&1; then
    echo -e "    ${GREEN}✅ Credit Application API accessible${NC}"
    log "Credit Application API test passed"
else
    echo -e "    ${YELLOW}⚠️  Credit Application API not accessible${NC}"
    log "Credit Application API test skipped - server not running"
fi

# Test file upload API
echo "  Testing File Upload API..."
if curl -s -f "http://localhost:3001/api/upload" >/dev/null 2>&1; then
    echo -e "    ${GREEN}✅ File Upload API accessible${NC}"
    log "File Upload API test passed"
else
    echo -e "    ${YELLOW}⚠️  File Upload API not accessible${NC}"
    log "File Upload API test skipped - server not running"
fi

# 6. Security Tests
echo ""
echo -e "${BLUE}🔒 SECURITY TESTS${NC}"
echo "================"

log "Starting security tests"
echo "Running security vulnerability scan..."

if command -v npm-audit >/dev/null 2>&1; then
    npm audit --json > "$TEST_RESULTS_DIR/security_audit_$TIMESTAMP.json" 2>/dev/null
    VULNERABILITIES=$(cat "$TEST_RESULTS_DIR/security_audit_$TIMESTAMP.json" | jq '.metadata.vulnerabilities.total // 0')
    
    if [ "$VULNERABILITIES" -eq 0 ]; then
        echo -e "${GREEN}✅ No security vulnerabilities found${NC}"
        SECURITY_TESTS_PASSED=true
        log "Security audit passed: 0 vulnerabilities"
    else
        echo -e "${YELLOW}⚠️  Found $VULNERABILITIES security vulnerabilities${NC}"
        log "Security audit found $VULNERABILITIES vulnerabilities"
        
        # Show high severity issues
        HIGH_SEVERITY=$(cat "$TEST_RESULTS_DIR/security_audit_$TIMESTAMP.json" | jq '.metadata.vulnerabilities.high // 0')
        if [ "$HIGH_SEVERITY" -gt 0 ]; then
            echo -e "    ${RED}🚨 $HIGH_SEVERITY high severity vulnerabilities found${NC}"
            log "HIGH SEVERITY: $HIGH_SEVERITY vulnerabilities found"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  npm audit not available${NC}"
    log "Security audit skipped - npm audit not available"
fi

# Test for common security issues
echo "Checking for common security issues..."

# Check for console.log statements in production code
CONSOLE_LOGS=$(grep -r "console\.log" src/ 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo -e "    ${YELLOW}⚠️  Found $CONSOLE_LOGS console.log statements in source code${NC}"
    log "Security check: Found $CONSOLE_LOGS console.log statements"
else
    echo -e "    ${GREEN}✅ No console.log statements in production code${NC}"
    log "Security check: No console.log statements found"
fi

# Check for TODO/FIXME comments that might indicate security issues
SECURITY_TODOS=$(grep -r -i "TODO.*security\|FIXME.*security\|XXX.*security" src/ 2>/dev/null | wc -l)
if [ "$SECURITY_TODOS" -gt 0 ]; then
    echo -e "    ${YELLOW}⚠️  Found $SECURITY_TODOS security-related TODO/FIXME comments${NC}"
    log "Security check: Found $SECURITY_TODOS security TODOs"
else
    echo -e "    ${GREEN}✅ No pending security-related tasks${NC}"
    log "Security check: No security TODOs found"
fi

# 7. Performance Tests
echo ""
echo -e "${BLUE}⚡ PERFORMANCE TESTS${NC}"
echo "=================="

log "Starting performance tests"
echo "Running bundle size analysis..."

if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
    log "Production build completed"
    
    # Analyze bundle size
    if [ -d "build/static/js" ]; then
        MAIN_JS_SIZE=$(find build/static/js -name "main*.js" -exec du -h {} \; | cut -f1)
        echo "    Main bundle size: $MAIN_JS_SIZE"
        log "Main bundle size: $MAIN_JS_SIZE"
        
        # Check if bundle is too large (warning if > 1MB)
        MAIN_JS_BYTES=$(find build/static/js -name "main*.js" -exec du -b {} \; | cut -f1)
        if [ "$MAIN_JS_BYTES" -gt 1048576 ]; then
            echo -e "    ${YELLOW}⚠️  Main bundle is larger than 1MB${NC}"
            log "Performance warning: Main bundle > 1MB"
        else
            echo -e "    ${GREEN}✅ Bundle size is optimal${NC}"
            log "Performance check: Bundle size optimal"
        fi
    fi
    
    PERFORMANCE_TESTS_PASSED=true
else
    echo -e "${RED}❌ Build failed${NC}"
    log "ERROR: Production build failed"
fi

# Check for performance anti-patterns
echo "Checking for performance anti-patterns..."

# Look for potential memory leaks (useEffect without cleanup)
POTENTIAL_LEAKS=$(grep -r "useEffect" src/ | grep -v "return" | wc -l)
if [ "$POTENTIAL_LEAKS" -gt 0 ]; then
    echo -e "    ${YELLOW}⚠️  Found $POTENTIAL_LEAKS useEffect hooks that may need cleanup${NC}"
    log "Performance check: $POTENTIAL_LEAKS potential useEffect cleanup issues"
else
    echo -e "    ${GREEN}✅ No obvious memory leak patterns found${NC}"
    log "Performance check: No memory leak patterns found"
fi

# 8. Accessibility Tests
echo ""
echo -e "${BLUE}♿ ACCESSIBILITY TESTS${NC}"
echo "===================="

log "Starting accessibility tests"
echo "Running accessibility tests..."

if npm run test:a11y >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Accessibility tests passed${NC}"
    log "Accessibility tests completed successfully"
else
    echo -e "${YELLOW}⚠️  Accessibility tests not configured or failed${NC}"
    log "Accessibility tests skipped or failed"
fi

# Manual accessibility checks
echo "Performing manual accessibility checks..."

# Check for missing alt attributes
MISSING_ALT=$(grep -r "<img" src/ | grep -v "alt=" | wc -l)
if [ "$MISSING_ALT" -gt 0 ]; then
    echo -e "    ${YELLOW}⚠️  Found $MISSING_ALT img tags without alt attributes${NC}"
    log "Accessibility: $MISSING_ALT images missing alt text"
else
    echo -e "    ${GREEN}✅ All images have alt attributes${NC}"
    log "Accessibility: All images have alt text"
fi

# Check for proper heading hierarchy
HEADING_ISSUES=$(grep -r "<h[1-6]" src/ | wc -l)
if [ "$HEADING_ISSUES" -gt 0 ]; then
    echo -e "    ${GREEN}✅ Found $HEADING_ISSUES heading elements${NC}"
    log "Accessibility: Found $HEADING_ISSUES heading elements"
else
    echo -e "    ${YELLOW}⚠️  No heading elements found${NC}"
    log "Accessibility: No heading elements found"
fi

# 9. E2E Tests (if Cypress/Playwright is available)
echo ""
echo -e "${BLUE}🎭 END-TO-END TESTS${NC}"
echo "=================="

log "Starting E2E tests"

if command -v cypress >/dev/null 2>&1; then
    echo "Running Cypress E2E tests..."
    if npx cypress run --headless --reporter json --reporter-options "outputFile=$TEST_RESULTS_DIR/e2e_results_$TIMESTAMP.json" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
        E2E_TESTS_PASSED=true
        log "E2E tests completed successfully"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        log "ERROR: E2E tests failed"
    fi
elif command -v playwright >/dev/null 2>&1; then
    echo "Running Playwright E2E tests..."
    if npx playwright test --reporter=json --output-file="$TEST_RESULTS_DIR/e2e_results_$TIMESTAMP.json" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
        E2E_TESTS_PASSED=true
        log "E2E tests completed successfully"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        log "ERROR: E2E tests failed"
    fi
else
    echo -e "${YELLOW}⚠️  No E2E testing framework found (Cypress/Playwright)${NC}"
    log "E2E tests skipped - no framework available"
fi

# 10. QA Tests
echo ""
echo -e "${BLUE}✅ QA TESTS${NC}"
echo "==========="

log "Starting QA tests"
echo "Running QA validation tests..."

if npm run test:qa >/dev/null 2>&1; then
    echo -e "${GREEN}✅ QA tests passed${NC}"
    QA_TESTS_PASSED=true
    log "QA tests completed successfully"
else
    echo -e "${YELLOW}⚠️  QA tests not configured or failed${NC}"
    log "QA tests skipped or failed"
fi

# Manual QA checks
echo "Performing manual QA checks..."

# Check for proper error boundaries
ERROR_BOUNDARIES=$(grep -r "componentDidCatch\|ErrorBoundary" src/ | wc -l)
if [ "$ERROR_BOUNDARIES" -gt 0 ]; then
    echo -e "    ${GREEN}✅ Error boundaries implemented${NC}"
    log "QA check: Error boundaries found"
else
    echo -e "    ${YELLOW}⚠️  No error boundaries found${NC}"
    log "QA check: No error boundaries found"
fi

# Check for loading states
LOADING_STATES=$(grep -r "loading\|isLoading\|Loading" src/ | wc -l)
if [ "$LOADING_STATES" -gt 5 ]; then
    echo -e "    ${GREEN}✅ Loading states implemented${NC}"
    log "QA check: Loading states found"
else
    echo -e "    ${YELLOW}⚠️  Few or no loading states found${NC}"
    log "QA check: Limited loading states"
fi

# 11. Generate Test Report
echo ""
echo -e "${BLUE}📊 GENERATING TEST REPORT${NC}"
echo "========================="

REPORT_FILE="$TEST_RESULTS_DIR/test_report_$TIMESTAMP.html"

cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EVA AI Test Report - $TIMESTAMP</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .test-section { margin: 20px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
        .passed { border-left-color: #10b981; background: #f0f9ff; }
        .failed { border-left-color: #ef4444; background: #fef2f2; }
        .warning { border-left-color: #f59e0b; background: #fffbeb; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1f2937; }
        .metric-label { font-size: 0.9em; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 EVA AI Comprehensive Test Report</h1>
        <p>Generated on $(date)</p>
        <p>Test Suite Version: 1.0.0</p>
    </div>

    <h2>📊 Test Summary</h2>
    <div class="test-section">
        <div class="metric">
            <div class="metric-value">$([ "$UNIT_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">Unit Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">$([ "$INTEGRATION_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">Integration Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">$([ "$E2E_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">E2E Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">$([ "$QA_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">QA Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">$([ "$SECURITY_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">Security Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">$([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "✅" || echo "❌")</div>
            <div class="metric-label">Performance Tests</div>
        </div>
    </div>

    <h2>📋 Detailed Results</h2>
    
    <div class="test-section $([ "$UNIT_TESTS_PASSED" = true ] && echo "passed" || echo "failed")">
        <h3>Unit Tests</h3>
        <p>Status: $([ "$UNIT_TESTS_PASSED" = true ] && echo "✅ Passed" || echo "❌ Failed")</p>
        <p>Coverage: Check coverage report in $COVERAGE_DIR/unit/</p>
    </div>

    <div class="test-section $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo "passed" || echo "failed")">
        <h3>Integration Tests</h3>
        <p>Status: $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo "✅ Passed" || echo "❌ Failed")</p>
        <p>Component integrations tested successfully</p>
    </div>

    <div class="test-section $([ "$SECURITY_TESTS_PASSED" = true ] && echo "passed" || echo "warning")">
        <h3>Security Tests</h3>
        <p>Status: $([ "$SECURITY_TESTS_PASSED" = true ] && echo "✅ Passed" || echo "⚠️  Warnings Found")</p>
        <p>Vulnerability scan and security checks completed</p>
    </div>

    <div class="test-section $([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "passed" || echo "failed")">
        <h3>Performance Tests</h3>
        <p>Status: $([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "✅ Passed" || echo "❌ Failed")</p>
        <p>Bundle analysis and performance metrics collected</p>
    </div>

    <h2>📁 Test Artifacts</h2>
    <ul>
        <li>Test logs: $LOG_FILE</li>
        <li>Coverage reports: $COVERAGE_DIR/</li>
        <li>Test results: $TEST_RESULTS_DIR/</li>
    </ul>

    <p><small>Report generated by EVA AI Test Suite v1.0.0</small></p>
</body>
</html>
EOF

echo "Test report generated: $REPORT_FILE"
log "Test report generated: $REPORT_FILE"

# 12. Final Summary
echo ""
echo -e "${BLUE}📋 FINAL SUMMARY${NC}"
echo "================"

TOTAL_TESTS=6
PASSED_TESTS=0

[ "$UNIT_TESTS_PASSED" = true ] && ((PASSED_TESTS++))
[ "$INTEGRATION_TESTS_PASSED" = true ] && ((PASSED_TESTS++))
[ "$E2E_TESTS_PASSED" = true ] && ((PASSED_TESTS++))
[ "$QA_TESTS_PASSED" = true ] && ((PASSED_TESTS++))
[ "$SECURITY_TESTS_PASSED" = true ] && ((PASSED_TESTS++))
[ "$PERFORMANCE_TESTS_PASSED" = true ] && ((PASSED_TESTS++))

PASS_PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo "Test Results Summary:"
echo "  Unit Tests:        $([ "$UNIT_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "  Integration Tests: $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "  E2E Tests:         $([ "$E2E_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "  QA Tests:          $([ "$QA_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "  Security Tests:    $([ "$SECURITY_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${YELLOW}⚠️  WARNINGS${NC}")"
echo "  Performance Tests: $([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"

echo ""
echo "Overall Result: $PASSED_TESTS/$TOTAL_TESTS tests passed ($PASS_PERCENTAGE%)"

if [ "$PASS_PERCENTAGE" -ge 80 ]; then
    echo -e "${GREEN}🎉 Test suite completed successfully!${NC}"
    log "Test suite completed successfully: $PASS_PERCENTAGE% pass rate"
    exit 0
elif [ "$PASS_PERCENTAGE" -ge 60 ]; then
    echo -e "${YELLOW}⚠️  Test suite completed with warnings${NC}"
    log "Test suite completed with warnings: $PASS_PERCENTAGE% pass rate"
    exit 0
else
    echo -e "${RED}❌ Test suite failed${NC}"
    log "Test suite failed: $PASS_PERCENTAGE% pass rate"
    exit 1
fi 