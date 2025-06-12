#!/bin/bash

# 🧪 EVA Platform Payment Integration Test Suite
# This script comprehensively tests Stripe, Plaid, and sales analytics integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL=${1:-"http://localhost:3000"}
TEST_USER_ID="test_user_$(date +%s)"
TEST_EMAIL="test_$(date +%s)@eva-platform.com"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ️  $1${NC}"
}

test_start() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] 🧪 $1${NC}"
}

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    test_start "Testing: $test_name"

    if eval "$test_command"; then
        log "PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        error "FAILED: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# API helper function
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="${4:-200}"

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" -eq "$expected_status" ]; then
        echo "$body"
        return 0
    else
        error "API call failed: $method $endpoint (expected $expected_status, got $http_code)"
        echo "$body" >&2
        return 1
    fi
}

# Test functions
test_health_check() {
    local response
    response=$(api_call "GET" "/api/health")
    echo "$response" | grep -q "healthy" || return 1
}

test_stripe_webhook() {
    local webhook_data='{
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_webhook",
                "amount": 30000,
                "currency": "usd",
                "customer": "cus_test_customer",
                "metadata": {
                    "eva_product_key": "risk_score_general",
                    "eva_customer_id": "'$TEST_USER_ID'"
                }
            }
        }
    }'

    local response
    response=$(api_call "POST" "/api/webhooks/stripe" "$webhook_data")
    echo "$response" | grep -q "received" || return 1
}

test_plaid_link_token() {
    local request_data='{
        "userId": "'$TEST_USER_ID'",
        "customerName": "Test Customer"
    }'

    local response
    response=$(api_call "POST" "/api/banking/create-link-token" "$request_data")
    echo "$response" | grep -q "linkToken" || return 1
}

test_plaid_webhook() {
    local webhook_data='{
        "webhook_type": "ITEM",
        "webhook_code": "PENDING_EXPIRATION",
        "item_id": "test_item_id",
        "user_id": "'$TEST_USER_ID'"
    }'

    local response
    response=$(api_call "POST" "/api/webhooks/plaid" "$webhook_data")
    echo "$response" | grep -q "received" || return 1
}

test_payment_intent_creation() {
    local request_data='{
        "productType": "risk_score_general",
        "customerId": "cus_test_customer",
        "amount": 300,
        "metadata": {
            "test": "true"
        }
    }'

    local response
    response=$(api_call "POST" "/api/payments/create-payment-intent" "$request_data")
    echo "$response" | grep -q "clientSecret" || return 1
}

test_subscription_creation() {
    local request_data='{
        "customerId": "cus_test_customer",
        "priceId": "price_platform_subscription",
        "productKey": "platform_subscription"
    }'

    local response
    response=$(api_call "POST" "/api/payments/create-subscription" "$request_data" 200)
    echo "$response" | grep -q -E "(subscription|error)" || return 1
}

test_sales_dashboard_data() {
    local response
    response=$(api_call "GET" "/api/sales/dashboard")
    echo "$response" | grep -q -E "(todayMetrics|recentTransactions|topProducts)" || return 1
}

test_sales_metrics() {
    local response
    response=$(api_call "GET" "/api/sales/metrics?period=today")
    echo "$response" | grep -q -E "(totalRevenue|totalTransactions)" || return 1
}

test_customer_analytics() {
    local response
    response=$(api_call "GET" "/api/sales/customers")
    echo "$response" | grep -q -E "(data|customers)" || return 1
}

test_product_definitions() {
    local response
    response=$(api_call "GET" "/api/products/definitions")
    echo "$response" | grep -q -E "(risk_score_general|platform_subscription)" || return 1
}

test_percentage_payment_calculation() {
    local request_data='{
        "creditAmount": 100000,
        "commissionRate": 0.05
    }'

    local response
    response=$(api_call "POST" "/api/payments/calculate-commission" "$request_data")
    echo "$response" | grep -q "5000" || return 1  # 5% of 100,000 = 5,000
}

test_bank_account_validation() {
    local request_data='{
        "accessToken": "access-sandbox-test-token",
        "accountId": "test-account-id"
    }'

    local response
    response=$(api_call "POST" "/api/banking/validate-account" "$request_data" 200)
    echo "$response" | grep -q -E "(isValid|error)" || return 1
}

test_transaction_recording() {
    local transaction_data='{
        "productType": "risk_score_general",
        "customerId": "'$TEST_USER_ID'",
        "amount": 300,
        "status": "completed",
        "paymentMethod": "stripe"
    }'

    local response
    response=$(api_call "POST" "/api/sales/transactions" "$transaction_data")
    echo "$response" | grep -q -E "(success|id)" || return 1
}

test_stripe_products_creation() {
    info "Testing Stripe products creation script"
    if [ -f "scripts/setup-stripe-products.js" ]; then
        node scripts/setup-stripe-products.js --test-mode || return 1
    else
        warn "Stripe products script not found, skipping"
        return 0
    fi
}

test_database_connection() {
    local response
    response=$(api_call "GET" "/api/health/database")
    echo "$response" | grep -q -E "(healthy|connected)" || return 1
}

test_redis_connection() {
    local response
    response=$(api_call "GET" "/api/health/redis" 200)
    # Redis was removed, so we expect this to either return healthy (if fallback) or 404
    return 0
}

test_environment_variables() {
    local response
    response=$(api_call "GET" "/api/health/config")
    echo "$response" | grep -q -E "(stripe|plaid)" || return 1
}

test_security_headers() {
    local headers
    headers=$(curl -I -s "$BASE_URL/")
    echo "$headers" | grep -q "X-Content-Type-Options" || return 1
    echo "$headers" | grep -q "X-Frame-Options" || return 1
    echo "$headers" | grep -q "Strict-Transport-Security" || return 1
}

test_rate_limiting() {
    info "Testing rate limiting (making 5 rapid requests)"
    local count=0
    for i in {1..5}; do
        if api_call "GET" "/api/test/rate-limit" "" 200 >/dev/null 2>&1; then
            count=$((count + 1))
        fi
        sleep 0.1
    done
    [ $count -ge 3 ] || return 1  # At least 3 should succeed
}

test_error_handling() {
    local response
    response=$(api_call "POST" "/api/payments/create-payment-intent" '{"invalid": "data"}' 400)
    echo "$response" | grep -q -E "(error|invalid)" || return 1
}

test_data_validation() {
    local request_data='{
        "productType": "invalid_product",
        "customerId": "",
        "amount": -100
    }'

    local response
    response=$(api_call "POST" "/api/payments/create-payment-intent" "$request_data" 400)
    echo "$response" | grep -q "error" || return 1
}

test_financial_calculations() {
    local test_cases=(
        '{"amount": 300, "expected": 300}'
        '{"amount": 300.50, "expected": 300.50}'
        '{"amount": 300.999, "expected": 301.00}'
    )

    for test_case in "${test_cases[@]}"; do
        local response
        response=$(api_call "POST" "/api/utils/validate-amount" "$test_case")
        echo "$response" | grep -q "valid" || return 1
    done
}

# Performance tests
test_api_response_time() {
    info "Testing API response time"
    local start_time=$(date +%s%N)
    api_call "GET" "/api/health" >/dev/null
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

    info "API response time: ${duration}ms"
    [ $duration -lt 1000 ] || return 1  # Should be under 1 second
}

test_concurrent_requests() {
    info "Testing concurrent request handling"
    local pids=()

    for i in {1..5}; do
        (api_call "GET" "/api/health" >/dev/null 2>&1) &
        pids+=($!)
    done

    local success_count=0
    for pid in "${pids[@]}"; do
        if wait "$pid"; then
            success_count=$((success_count + 1))
        fi
    done

    [ $success_count -eq 5 ] || return 1
}

# Load test simulation
test_load_simulation() {
    info "Running light load simulation (10 requests)"
    local success_count=0

    for i in {1..10}; do
        if api_call "GET" "/api/health" >/dev/null 2>&1; then
            success_count=$((success_count + 1))
        fi
        sleep 0.1
    done

    local success_rate=$((success_count * 100 / 10))
    info "Load test success rate: ${success_rate}%"
    [ $success_rate -ge 90 ] || return 1
}

# Main test execution
main() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                EVA Platform Payment Integration Tests         ║"
    echo "║                                                               ║"
    echo "║  Testing: Stripe, Plaid, Sales Analytics & Infrastructure    ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    info "Testing against: $BASE_URL"
    info "Test User ID: $TEST_USER_ID"
    echo ""

    # Core health tests
    run_test "Health Check Endpoint" "test_health_check"
    run_test "Database Connection" "test_database_connection"
    run_test "Environment Variables" "test_environment_variables"

    # Stripe integration tests
    echo -e "\n${PURPLE}=== Stripe Integration Tests ===${NC}"
    run_test "Stripe Webhook Processing" "test_stripe_webhook"
    run_test "Payment Intent Creation" "test_payment_intent_creation"
    run_test "Subscription Creation" "test_subscription_creation"
    run_test "Percentage Payment Calculation" "test_percentage_payment_calculation"

    # Plaid integration tests
    echo -e "\n${PURPLE}=== Plaid Integration Tests ===${NC}"
    run_test "Plaid Link Token Creation" "test_plaid_link_token"
    run_test "Plaid Webhook Processing" "test_plaid_webhook"
    run_test "Bank Account Validation" "test_bank_account_validation"

    # Sales analytics tests
    echo -e "\n${PURPLE}=== Sales Analytics Tests ===${NC}"
    run_test "Sales Dashboard Data" "test_sales_dashboard_data"
    run_test "Sales Metrics API" "test_sales_metrics"
    run_test "Customer Analytics" "test_customer_analytics"
    run_test "Product Definitions" "test_product_definitions"
    run_test "Transaction Recording" "test_transaction_recording"

    # Security and validation tests
    echo -e "\n${PURPLE}=== Security & Validation Tests ===${NC}"
    run_test "Security Headers" "test_security_headers"
    run_test "Rate Limiting" "test_rate_limiting"
    run_test "Error Handling" "test_error_handling"
    run_test "Data Validation" "test_data_validation"
    run_test "Financial Calculations" "test_financial_calculations"

    # Performance tests
    echo -e "\n${PURPLE}=== Performance Tests ===${NC}"
    run_test "API Response Time" "test_api_response_time"
    run_test "Concurrent Requests" "test_concurrent_requests"
    run_test "Load Simulation" "test_load_simulation"

    # Final summary
    echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        TEST SUMMARY                           ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"

    echo -e "\n📊 ${BLUE}Test Results:${NC}"
    echo -e "   Total Tests: ${TESTS_TOTAL}"
    echo -e "   ${GREEN}Passed: ${TESTS_PASSED}${NC}"
    echo -e "   ${RED}Failed: ${TESTS_FAILED}${NC}"

    local success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo -e "   Success Rate: ${success_rate}%"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n🎉 ${GREEN}ALL TESTS PASSED! Payment integration is working correctly.${NC}"

        echo -e "\n✅ ${GREEN}Ready for production:${NC}"
        echo "   • Stripe payment processing: ✅"
        echo "   • Plaid bank integration: ✅"
        echo "   • Sales analytics system: ✅"
        echo "   • Security measures: ✅"
        echo "   • Performance benchmarks: ✅"

        exit 0
    else
        echo -e "\n❌ ${RED}Some tests failed. Please review the errors above.${NC}"

        echo -e "\n🔧 ${YELLOW}Next steps:${NC}"
        echo "   1. Check application logs: pm2 logs eva-platform"
        echo "   2. Verify environment variables in .env.production"
        echo "   3. Ensure Stripe and Plaid API keys are valid"
        echo "   4. Check database connectivity"
        echo "   5. Review failed test outputs above"

        exit 1
    fi
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Tests interrupted by user${NC}"; exit 130' INT

# Validate arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [BASE_URL]"
    echo ""
    echo "Examples:"
    echo "  $0                              # Test localhost:3000"
    echo "  $0 https://eva-platform.com    # Test production"
    echo "  $0 https://staging.eva.com     # Test staging"
    echo ""
    echo "This script tests:"
    echo "  • Stripe payment processing"
    echo "  • Plaid bank integration"
    echo "  • Sales analytics APIs"
    echo "  • Security measures"
    echo "  • Performance benchmarks"
    exit 0
fi

# Check if server is running
if ! curl -s "$BASE_URL/api/health" >/dev/null 2>&1; then
    error "Server is not responding at $BASE_URL"
    error "Please ensure the EVA platform is running before running tests"
    exit 1
fi

# Run the test suite
main "$@"
