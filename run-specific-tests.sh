#!/bin/bash

echo "Running specific tests..."

# Run tests and capture output
npm test -- \
  --testPathPattern="(RiskMapNavigator|RiskMapOptimized|UserProfileSimulator|CustomerRetentionCommitments|CustomerRetentionFlow)" \
  --no-coverage \
  --json \
  --outputFile=test-results-specific.json \
  2>&1

# Check if test results file exists
if [ -f "test-results-specific.json" ]; then
  echo "Test results:"
  cat test-results-specific.json | jq '.testResults[] | {name: .name, status: .status, message: .message}'
else
  echo "No test results file generated"
fi
