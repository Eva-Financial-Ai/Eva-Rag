#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE} EVA Platform ESLint Batch Fix Script ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Function to fix a directory
fix_directory() {
    local directory=$1
    local max_warnings=$2
    local fix_mode=$3
    
    echo -e "${YELLOW}Processing directory: ${directory}${NC}"
    
    if [ "$fix_mode" = "check" ]; then
        echo -e "${BLUE}Running lint check only...${NC}"
        npx eslint "${directory}" --max-warnings="${max_warnings}"
    else
        echo -e "${BLUE}Fixing linting issues...${NC}"
        npx eslint "${directory}" --fix --max-warnings="${max_warnings}"
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Successfully processed ${directory}${NC}"
    else
        echo -e "${RED}Issues found in ${directory} - exit code: ${exit_code}${NC}"
    fi
    echo ""
    
    return $exit_code
}

# Function to fix React Hook dependency issues
fix_hooks_dependencies() {
    echo -e "${YELLOW}Focusing on React Hooks exhaustive-deps issues...${NC}"
    npx eslint --rule 'react-hooks/exhaustive-deps: error' --fix src/
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Successfully fixed hook dependency issues${NC}"
    else
        echo -e "${RED}Some hook dependency issues remain - please check them manually${NC}"
    fi
    echo ""
}

# Function to fix anonymous default exports
fix_anonymous_exports() {
    echo -e "${YELLOW}Focusing on anonymous default exports...${NC}"
    npx eslint --rule 'import/no-anonymous-default-export: error' --fix src/
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Successfully fixed anonymous default export issues${NC}"
    else
        echo -e "${RED}Some anonymous export issues remain - please check them manually${NC}"
    fi
    echo ""
}

# Function to fix unused variables
fix_unused_variables() {
    echo -e "${YELLOW}Focusing on unused variables...${NC}"
    npx eslint --rule '@typescript-eslint/no-unused-vars: error' --fix src/
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Successfully fixed unused variable issues${NC}"
    else
        echo -e "${RED}Some unused variable issues remain - please check them manually${NC}"
    fi
    echo ""
}

# Main execution
print_usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  check              Run lint check without fixing"
    echo "  fix                Run automatic fixes (default)"
    echo "  hooks              Focus on fixing React Hooks exhaustive-deps issues"
    echo "  exports            Focus on fixing anonymous default exports"
    echo "  unused             Focus on fixing unused variables"
    echo "  hooks-exports      Fix both hooks and exports issues"
    echo "  hooks-unused       Fix both hooks and unused variable issues"
    echo "  exports-unused     Fix both exports and unused variable issues"
    echo "  all                Fix all issues (hooks, exports, unused variables)"
    echo "  batch              Run batch fixes by directory with reasonable warning limits"
    echo ""
}

# Default values
FIX_MODE="fix"
BATCH_MODE="false"

# Parse arguments
if [ $# -gt 0 ]; then
    case "$1" in
        check)
            FIX_MODE="check"
            ;;
        fix)
            FIX_MODE="fix"
            ;;
        hooks)
            fix_hooks_dependencies
            exit $?
            ;;
        exports)
            fix_anonymous_exports
            exit $?
            ;;
        unused)
            fix_unused_variables
            exit $?
            ;;
        hooks-exports)
            fix_hooks_dependencies
            fix_anonymous_exports
            exit $?
            ;;
        hooks-unused)
            fix_hooks_dependencies
            fix_unused_variables
            exit $?
            ;;
        exports-unused)
            fix_anonymous_exports
            fix_unused_variables
            exit $?
            ;;
        all)
            fix_hooks_dependencies
            fix_anonymous_exports
            fix_unused_variables
            exit $?
            ;;
        batch)
            BATCH_MODE="true"
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
fi

if [ "$BATCH_MODE" = "true" ]; then
    echo -e "${BLUE}Running in batch mode...${NC}"
    
    # Fix critical directories first with reasonable warning limits
    fix_directory "src/hooks" 0 "$FIX_MODE"
    fix_directory "src/contexts" 5 "$FIX_MODE"
    fix_directory "src/services" 10 "$FIX_MODE"
    fix_directory "src/utils" 10 "$FIX_MODE"
    
    # Components with higher warning tolerance
    fix_directory "src/components/common" 20 "$FIX_MODE"
    fix_directory "src/components/layout" 20 "$FIX_MODE"
    fix_directory "src/components/dashboard" 30 "$FIX_MODE"
    fix_directory "src/components/risk" 50 "$FIX_MODE"
    
    # Pages with even higher warning tolerance
    fix_directory "src/pages" 100 "$FIX_MODE"
    
    # Tests with highest tolerance
    fix_directory "src/components/__tests__" 200 "$FIX_MODE"
    fix_directory "src/pages/__tests__" 200 "$FIX_MODE"
    
    echo -e "${GREEN}Batch processing complete!${NC}"
else
    # Run on the entire src directory
    fix_directory "src" 1000 "$FIX_MODE"
fi

echo -e "${BLUE}Script finished.${NC}" 