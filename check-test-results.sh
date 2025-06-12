#!/bin/bash

echo "Running tests for fixed components..."

# Run each test file separately to see individual results
echo -e "\n=== RiskMapNavigator Tests ==="
npm test -- src/components/risk/__tests__/RiskMapNavigator.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== RiskMapOptimized Tests ==="
npm test -- src/components/risk/__tests__/RiskMapOptimized.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== RiskDashboard Tests ==="
npm test -- src/components/risk/__tests__/RiskDashboard.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== UserProfileSimulator Tests ==="
npm test -- src/components/testing/__tests__/UserProfileSimulator.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== CustomerRetentionCommitments Tests ==="
npm test -- src/pages/customerRetention/__tests__/CustomerRetentionCommitments.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== CustomerRetentionFlow Tests ==="
npm test -- src/pages/__tests__/CustomerRetentionFlow.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\n=== SideNavigation Tests ==="
npm test -- src/components/layout/__tests__/SideNavigationTest.test.tsx --no-coverage --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|✓|✕|●)"

echo -e "\nTest run complete!"
