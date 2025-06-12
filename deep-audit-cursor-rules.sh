#!/bin/bash

echo "=== EVA Platform Deep Code Audit ==="
echo "Checking compliance with Cursor rules..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_ISSUES=0
CRITICAL_ISSUES=0
WARNINGS=0

# Function to report issues
report_issue() {
    local severity=$1
    local category=$2
    local message=$3
    local file=$4

    if [ "$severity" = "CRITICAL" ]; then
        echo -e "${RED}[CRITICAL]${NC} $category: $message"
        [ -n "$file" ] && echo "  File: $file"
        ((CRITICAL_ISSUES++))
    elif [ "$severity" = "WARNING" ]; then
        echo -e "${YELLOW}[WARNING]${NC} $category: $message"
        [ -n "$file" ] && echo "  File: $file"
        ((WARNINGS++))
    fi
    ((TOTAL_ISSUES++))
}

echo "1. Checking React Component Patterns..."
echo "======================================="

# Check for class components (should use functional components)
CLASS_COMPONENTS=$(grep -r "class.*extends.*Component\|class.*extends.*React.Component" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "__tests__" | grep -v ".test." || true)
if [ -n "$CLASS_COMPONENTS" ]; then
    echo "$CLASS_COMPONENTS" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "React Pattern" "Class component found (should use functional components)" "$file"
    done
fi

# Check for proper hook usage
echo ""
echo "2. Checking TypeScript Usage..."
echo "==============================="

# Check for any files in src
ANY_JS_FILES=$(find src/ -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v "__tests__" | grep -v ".test." || true)
if [ -n "$ANY_JS_FILES" ]; then
    echo "$ANY_JS_FILES" | while IFS= read -r file; do
        report_issue "WARNING" "TypeScript" "JavaScript file found (should use TypeScript)" "$file"
    done
fi

# Check for 'any' type usage
ANY_TYPE_USAGE=$(grep -r ": any\|<any>\|as any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | grep -v ".test." || true)
if [ -n "$ANY_TYPE_USAGE" ]; then
    echo "$ANY_TYPE_USAGE" | head -10 | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "TypeScript" "Using 'any' type (should use proper types)" "$file"
    done
fi

echo ""
echo "3. Checking Security & Compliance..."
echo "===================================="

# Check for potential plain text storage of sensitive data
SENSITIVE_PATTERNS=$(grep -r "password\|ssn\|tax.*id\|bank.*account" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "encrypt\|hash\|mask" | grep -v "__tests__" | grep -v ".test." || true)
if [ -n "$SENSITIVE_PATTERNS" ]; then
    echo "$SENSITIVE_PATTERNS" | head -5 | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "CRITICAL" "Security" "Potential unencrypted sensitive data" "$file"
    done
fi

# Check for localStorage usage with sensitive data
LOCAL_STORAGE_SENSITIVE=$(grep -r "localStorage.*\(password\|ssn\|tax\|bank\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
if [ -n "$LOCAL_STORAGE_SENSITIVE" ]; then
    echo "$LOCAL_STORAGE_SENSITIVE" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "CRITICAL" "Security" "Storing sensitive data in localStorage" "$file"
    done
fi

echo ""
echo "4. Checking Financial Calculations..."
echo "====================================="

# Check for financial calculations without proper decimal precision
FINANCIAL_CALC=$(grep -r "toFixed\|Math.round" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "toFixed(2)" | grep -v "__tests__" || true)
if [ -n "$FINANCIAL_CALC" ]; then
    echo "$FINANCIAL_CALC" | head -5 | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "Financial" "Financial calculation may lack proper decimal precision" "$file"
    done
fi

echo ""
echo "5. Checking Error Handling..."
echo "============================="

# Check for API calls without error handling
API_NO_CATCH=$(grep -r "fetch\|axios" src/ --include="*.ts" --include="*.tsx" -A 5 2>/dev/null | grep -B 5 -v "catch\|error" | grep "fetch\|axios" || true)
if [ -n "$API_NO_CATCH" ]; then
    report_issue "WARNING" "Error Handling" "Found API calls that may lack proper error handling"
fi

# Check for empty catch blocks
EMPTY_CATCH=$(grep -r "catch.*{.*}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
if [ -n "$EMPTY_CATCH" ]; then
    echo "$EMPTY_CATCH" | head -5 | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "Error Handling" "Empty catch block found" "$file"
    done
fi

echo ""
echo "6. Checking CSS/Styling Patterns..."
echo "==================================="

# Check for inline styles (should use Tailwind or CSS modules)
INLINE_STYLES=$(grep -r "style={{" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "__tests__" || true)
if [ -n "$INLINE_STYLES" ]; then
    count=$(echo "$INLINE_STYLES" | wc -l)
    report_issue "WARNING" "Styling" "Found $count instances of inline styles (should use Tailwind or CSS modules)"
fi

echo ""
echo "7. Checking Test Coverage..."
echo "==========================="

# Count components without tests
COMPONENTS=$(find src/components -name "*.tsx" -not -path "*/test*" -not -name "*.test.*" -not -name "*.spec.*" 2>/dev/null | wc -l)
TEST_FILES=$(find src/components -name "*.test.tsx" -o -name "*.spec.tsx" 2>/dev/null | wc -l)
if [ $TEST_FILES -lt $((COMPONENTS / 2)) ]; then
    report_issue "WARNING" "Testing" "Low test coverage: $TEST_FILES test files for $COMPONENTS components"
fi

echo ""
echo "8. Checking Data Visualization..."
echo "================================"

# Check for non-standard chart libraries
NON_STANDARD_CHARTS=$(grep -r "import.*from.*['\"]\(d3\|highcharts\|plotly\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
if [ -n "$NON_STANDARD_CHARTS" ]; then
    echo "$NON_STANDARD_CHARTS" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "Data Viz" "Non-standard chart library (should use Chart.js or Recharts)" "$file"
    done
fi

echo ""
echo "9. Checking Audit Trail Implementation..."
echo "========================================"

# Check for state changes without audit logging
STATE_CHANGES=$(grep -r "setState\|dispatch" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "console.log\|audit\|log" | head -10 || true)
if [ -n "$STATE_CHANGES" ]; then
    count=$(echo "$STATE_CHANGES" | wc -l)
    report_issue "WARNING" "Audit Trail" "Found $count+ state changes that may lack audit logging"
fi

echo ""
echo "10. Checking API Integration Patterns..."
echo "========================================"

# Check for hardcoded API endpoints
HARDCODED_URLS=$(grep -r "http://\|https://" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost" | grep -v "__tests__" || true)
if [ -n "$HARDCODED_URLS" ]; then
    echo "$HARDCODED_URLS" | head -5 | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        report_issue "WARNING" "API Integration" "Hardcoded URL found (should use environment variables)" "$file"
    done
fi

echo ""
echo "11. Checking Code Organization..."
echo "================================"

# Check for business logic in components
BUSINESS_LOGIC_IN_COMPONENTS=$(grep -r "calculate\|validate\|transform" src/components --include="*.tsx" 2>/dev/null | grep -v "utils\|services\|helpers" | head -10 || true)
if [ -n "$BUSINESS_LOGIC_IN_COMPONENTS" ]; then
    count=$(echo "$BUSINESS_LOGIC_IN_COMPONENTS" | wc -l)
    report_issue "WARNING" "Code Organization" "Found $count+ instances of business logic in components (should be in services/utils)"
fi

echo ""
echo "12. Checking Document Processing..."
echo "=================================="

# Check for document processing without metadata
DOC_PROCESSING=$(grep -r "pdf\|document.*process" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "metadata" | head -5 || true)
if [ -n "$DOC_PROCESSING" ]; then
    report_issue "WARNING" "Document Processing" "Document processing may lack structured metadata"
fi

echo ""
echo "========================================"
echo "AUDIT SUMMARY"
echo "========================================"
echo -e "Total Issues Found: $TOTAL_ISSUES"
echo -e "${RED}Critical Issues: $CRITICAL_ISSUES${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "${RED}⚠️  CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION${NC}"
    exit 1
elif [ $WARNINGS -gt 20 ]; then
    echo -e "${YELLOW}⚠️  Many warnings found - consider addressing these${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Codebase is reasonably compliant with Cursor rules${NC}"
    exit 0
fi
