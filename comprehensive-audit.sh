#!/bin/bash

# Comprehensive Codebase Audit Script
# This script audits the codebase in 9 sections and applies cursor rules

echo "🔍 EVA Platform Comprehensive Codebase Audit"
echo "==========================================="
echo ""

# Create audit directory
mkdir -p audit-reports
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="audit-reports/audit_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

# Section 1: Security & Authentication Audit
echo "📋 Section 1: Security & Authentication Audit"
echo "--------------------------------------------"
cat > "$REPORT_DIR/01_security_audit.md" << 'SECTION1'
# Section 1: Security & Authentication Audit

## Findings:

### 1.1 Encryption Implementation
SECTION1

# Check for unencrypted sensitive data
echo "Checking for unencrypted sensitive data..."
grep -r "password\|ssn\|taxId\|bankAccount" src/ --include="*.tsx" --include="*.ts" | grep -v "security.ts" | grep -v "test" >> "$REPORT_DIR/01_security_audit.md" 2>/dev/null || true

# Check for Auth0 implementation
echo "Checking Auth0 implementation..."
grep -r "useAuth\|Auth0" src/ --include="*.tsx" --include="*.ts" >> "$REPORT_DIR/01_security_audit.md" 2>/dev/null || true

# Section 2: Financial Calculations & Compliance
echo -e "\n📋 Section 2: Financial Calculations & Compliance"
echo "------------------------------------------------"
cat > "$REPORT_DIR/02_financial_compliance.md" << 'SECTION2'
# Section 2: Financial Calculations & Compliance

## Findings:

### 2.1 Financial Precision
SECTION2

# Check for financial calculations
grep -r "amount\|payment\|interest\|rate" src/ --include="*.tsx" --include="*.ts" | grep -E "[\+\-\*\/]" >> "$REPORT_DIR/02_financial_compliance.md" 2>/dev/null || true

# Check for decimal precision
grep -r "toFixed\|Math.round\|parseFloat" src/ --include="*.tsx" --include="*.ts" >> "$REPORT_DIR/02_financial_compliance.md" 2>/dev/null || true

# Section 3: Data Validation & Error Handling
echo -e "\n📋 Section 3: Data Validation & Error Handling"
echo "----------------------------------------------"
cat > "$REPORT_DIR/03_validation_errors.md" << 'SECTION3'
# Section 3: Data Validation & Error Handling

## Findings:

### 3.1 Input Validation
SECTION3

# Check for validation
grep -r "validate\|validation" src/ --include="*.tsx" --include="*.ts" | head -50 >> "$REPORT_DIR/03_validation_errors.md" 2>/dev/null || true

# Check error handling
grep -r "try.*catch\|throw\|Error" src/ --include="*.tsx" --include="*.ts" | head -50 >> "$REPORT_DIR/03_validation_errors.md" 2>/dev/null || true

# Section 4: API Integration & External Services
echo -e "\n📋 Section 4: API Integration & External Services"
echo "-------------------------------------------------"
cat > "$REPORT_DIR/04_api_integration.md" << 'SECTION4'
# Section 4: API Integration & External Services

## Findings:

### 4.1 API Calls
SECTION4

# Check API implementations
grep -r "axios\|fetch\|apiClient" src/ --include="*.tsx" --include="*.ts" | head -50 >> "$REPORT_DIR/04_api_integration.md" 2>/dev/null || true

# Section 5: Component Architecture & Best Practices
echo -e "\n📋 Section 5: Component Architecture & Best Practices"
echo "----------------------------------------------------"
cat > "$REPORT_DIR/05_component_architecture.md" << 'SECTION5'
# Section 5: Component Architecture & Best Practices

## Findings:

### 5.1 Component Structure
SECTION5

# Check for class components
echo "Class components found:" >> "$REPORT_DIR/05_component_architecture.md"
grep -r "class.*extends.*Component\|React.Component" src/ --include="*.tsx" --include="*.ts" >> "$REPORT_DIR/05_component_architecture.md" 2>/dev/null || true

# Check component size
echo -e "\nLargest components:" >> "$REPORT_DIR/05_component_architecture.md"
find src/components -name "*.tsx" -exec wc -l {} \; 2>/dev/null | sort -rn | head -20 >> "$REPORT_DIR/05_component_architecture.md" || true

# Section 6: Testing & Quality Assurance
echo -e "\n📋 Section 6: Testing & Quality Assurance"
echo "-----------------------------------------"
cat > "$REPORT_DIR/06_testing_qa.md" << 'SECTION6'
# Section 6: Testing & Quality Assurance

## Findings:

### 6.1 Test Coverage
SECTION6

# Count test files
echo "Total test files: $(find src/ -name "*.test.tsx" -o -name "*.test.ts" 2>/dev/null | wc -l)" >> "$REPORT_DIR/06_testing_qa.md"
echo "Total component files: $(find src/components -name "*.tsx" 2>/dev/null | grep -v test | wc -l)" >> "$REPORT_DIR/06_testing_qa.md"

# Section 7: Accessibility & User Experience
echo -e "\n📋 Section 7: Accessibility & User Experience"
echo "---------------------------------------------"
cat > "$REPORT_DIR/07_accessibility_ux.md" << 'SECTION7'
# Section 7: Accessibility & User Experience

## Findings:

### 7.1 Accessibility Implementation
SECTION7

# Check for accessibility attributes
echo "Accessibility attributes found: $(grep -r "aria-\|role=\|alt=" src/ --include="*.tsx" 2>/dev/null | wc -l)" >> "$REPORT_DIR/07_accessibility_ux.md"

# Check for loading states
echo "Loading states found: $(grep -r "loading\|isLoading\|pending" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)" >> "$REPORT_DIR/07_accessibility_ux.md"

# Section 8: Performance & Optimization
echo -e "\n📋 Section 8: Performance & Optimization"
echo "----------------------------------------"
cat > "$REPORT_DIR/08_performance.md" << 'SECTION8'
# Section 8: Performance & Optimization

## Findings:

### 8.1 Performance Optimizations
SECTION8

# Check for memoization
echo "Memoization usage:" >> "$REPORT_DIR/08_performance.md"
grep -r "useMemo\|useCallback\|React.memo" src/ --include="*.tsx" --include="*.ts" | head -20 >> "$REPORT_DIR/08_performance.md" 2>/dev/null || true

# Check for lazy loading
echo -e "\nLazy loading usage:" >> "$REPORT_DIR/08_performance.md"
grep -r "lazy\|Suspense" src/ --include="*.tsx" --include="*.ts" | head -20 >> "$REPORT_DIR/08_performance.md" 2>/dev/null || true

# Section 9: Documentation & Code Quality
echo -e "\n📋 Section 9: Documentation & Code Quality"
echo "------------------------------------------"
cat > "$REPORT_DIR/09_documentation.md" << 'SECTION9'
# Section 9: Documentation & Code Quality

## Findings:

### 9.1 Code Documentation
SECTION9

# Check for JSDoc comments
echo "JSDoc comments found: $(grep -r "/\*\*" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)" >> "$REPORT_DIR/09_documentation.md"

# Check for TODO comments
echo -e "\nTODO/FIXME comments:" >> "$REPORT_DIR/09_documentation.md"
grep -r "TODO\|FIXME\|HACK" src/ --include="*.tsx" --include="*.ts" | head -20 >> "$REPORT_DIR/09_documentation.md" 2>/dev/null || true

echo -e "\n✅ Audit complete! Reports saved in: $REPORT_DIR"
echo "Next step: Run the rule application script to fix identified issues."

# Create summary report
cat > "$REPORT_DIR/00_summary.md" << 'SUMMARY'
# EVA Platform Comprehensive Audit Summary

## Audit Sections:

1. **Security & Authentication** - Auth0 integration, encryption, sensitive data handling
2. **Financial Calculations & Compliance** - Decimal precision, GAAP compliance, calculations
3. **Data Validation & Error Handling** - Input validation, error boundaries, user feedback
4. **API Integration & External Services** - API client setup, error handling, timeouts
5. **Component Architecture** - Functional components, hooks, code organization
6. **Testing & Quality Assurance** - Test coverage, unit tests, integration tests
7. **Accessibility & User Experience** - WCAG compliance, loading states, responsive design
8. **Performance & Optimization** - Memoization, lazy loading, caching
9. **Documentation & Code Quality** - JSDoc, code comments, technical debt

## Next Steps:

1. Review each section report
2. Prioritize critical issues
3. Run rule application scripts
4. Implement fixes incrementally
5. Re-run audit to verify improvements

SUMMARY

# Generate actionable fixes script
cat > "$REPORT_DIR/apply-fixes.sh" << 'FIXES'
#!/bin/bash

echo "🔧 Applying Cursor Rules to EVA Platform"
echo "========================================"

# This script will be generated based on audit findings
# It will apply fixes for each section systematically

echo "Script to apply fixes will be generated after audit review."

FIXES

chmod +x "$REPORT_DIR/apply-fixes.sh"

echo -e "\n📊 Generating detailed analysis..."
ls -la "$REPORT_DIR/"
