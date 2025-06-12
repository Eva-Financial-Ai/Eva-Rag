#!/bin/bash

# Pre-Commit CI Checks Script
# Run this before committing to ensure your changes pass basic checks

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
PASS=true

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  EVA Platform Pre-Commit Checks      ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Function to run a check and update status
run_check() {
  local command="$1"
  local name="$2"

  echo -e "${YELLOW}Running $name check...${NC}"

  if eval "$command"; then
    echo -e "${GREEN}✓ $name check passed${NC}"
    echo ""
    return 0
  else
    echo -e "${RED}✗ $name check failed${NC}"
    echo ""
    PASS=false
    return 1
  fi
}

# Check 1: TypeScript compilation
run_check "npx tsc --noEmit" "TypeScript"

# Check 2: ESLint (critical rules only)
run_check "npm run lint:critical" "ESLint Critical Rules"

# Check 3: Prettier formatting
run_check "npm run format:check" "Prettier Formatting"

# Check 4: Unit tests (if any changed files have corresponding tests)
if git diff --cached --name-only | grep -q "\.tsx\|\.ts"; then
  echo -e "${YELLOW}Running unit tests for changed files...${NC}"

  # Extract the list of changed files
  CHANGED_FILES=$(git diff --cached --name-only | grep -E "\.tsx$|\.ts$" | grep -v "\.d\.ts$" | grep -v "\.test\.")

  # Run tests for each changed file if a test file exists
  TEST_RUN=false
  for file in $CHANGED_FILES; do
    # Determine test file path
    dir=$(dirname "$file")
    filename=$(basename "$file")
    base="${filename%.*}"
    test_file="$dir/__tests__/$base.test.tsx"
    alt_test_file="$dir/$base.test.tsx"

    # Check if test file exists and run it
    if [ -f "$test_file" ]; then
      echo -e "${BLUE}Testing: $file${NC}"
      TEST_RUN=true
      if npx jest "$test_file" --passWithNoTests; then
        echo -e "${GREEN}✓ Tests passed for $file${NC}"
      else
        echo -e "${RED}✗ Tests failed for $file${NC}"
        PASS=false
      fi
    elif [ -f "$alt_test_file" ]; then
      echo -e "${BLUE}Testing: $file${NC}"
      TEST_RUN=true
      if npx jest "$alt_test_file" --passWithNoTests; then
        echo -e "${GREEN}✓ Tests passed for $file${NC}"
      else
        echo -e "${RED}✗ Tests failed for $file${NC}"
        PASS=false
      fi
    fi
  done

  if [ "$TEST_RUN" = false ]; then
    echo -e "${BLUE}No test files found for changed files${NC}"
  fi

  echo ""
else
  echo -e "${BLUE}No TypeScript/React files changed, skipping tests${NC}"
  echo ""
fi

# Check 5: Check for debugging statements
if git diff --cached | grep -i "console.log\|debugger;" | grep -v "// @debug" > /dev/null; then
  echo -e "${RED}✗ Debug statements detected:${NC}"
  git diff --cached | grep -i "console.log\|debugger;" | grep -v "// @debug"
  echo -e "${YELLOW}Consider removing debug statements before committing${NC}"
  echo -e "${YELLOW}(Add '// @debug' comment to keep intentional logs)${NC}"
  echo ""
  PASS=false
else
  echo -e "${GREEN}✓ No debug statements detected${NC}"
  echo ""
fi

# Final check: Git hooks setup
if [ ! -d ".git/hooks" ]; then
  echo -e "${YELLOW}Git hooks not set up. Run 'npm run prepare' to enable automatic checks.${NC}"
  echo ""
fi

# Summary
if [ "$PASS" = true ]; then
  echo -e "${GREEN}=======================================${NC}"
  echo -e "${GREEN}  All checks passed! Ready to commit.  ${NC}"
  echo -e "${GREEN}=======================================${NC}"
  exit 0
else
  echo -e "${RED}=======================================${NC}"
  echo -e "${RED}  Some checks failed. Fix issues before committing.${NC}"
  echo -e "${RED}=======================================${NC}"
  echo -e "${YELLOW}Tip: You can still commit with 'git commit --no-verify' if necessary.${NC}"
  exit 1
fi
