#!/bin/bash

# EVA Platform - Phase 1: Critical & Safe Fixes Only
# Focuses on high-impact, low-risk automated fixes

echo "🚨 Phase 1: Critical Security & Compilation Fixes"
echo "================================================="

# Get baseline count
BEFORE_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
echo "📊 Starting with: $BEFORE_COUNT issues"

# Fix 1: Critical Security - Remove script-url usage
echo "🔒 [CRITICAL] Fixing script-url security issues..."
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "javascript:" | while read file; do
  echo "  ⚠️  Fixing script URL in: $file"
  sed -i '' 's/href="javascript:[^"]*"/href="#" onClick={handleClick}/g' "$file"
done

# Fix 2: Fix unnecessary escape characters (safe fix)
echo "🔧 Fixing unnecessary escape characters..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only fix obvious unnecessary escapes
  sed -i '' 's/Unnecessary escape character: \\(/(/g' "$file" 2>/dev/null || true
  sed -i '' 's/Unnecessary escape character: \\)/)/g' "$file" 2>/dev/null || true
done

# Fix 3: Fix restricted globals by adding proper testing-library imports
echo "🖥️ Fixing restricted globals in test files..."
find src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  if grep -q "Unexpected use of 'screen'" <<< "$(npm run lint -- "$file" 2>/dev/null)"; then
    if ! grep -q "import.*screen.*from.*@testing-library" "$file"; then
      echo "  📝 Adding screen import to: $file"
      # Add screen to existing testing-library import
      sed -i '' 's/from.*@testing-library\/react/&/' "$file"
      sed -i '' 's/import { \([^}]*\) } from.*@testing-library\/react/import { \1, screen } from "@testing-library\/react"/' "$file"
    fi
  fi
done

# Fix 4: Remove clearly unused single-line variable declarations (very conservative)
echo "🗑️ Removing obvious unused variables (conservative)..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only remove variables that are clearly defined but never used in same file
  # Very conservative approach - only obvious cases
  grep -n "const .* = .*;" "$file" | while IFS=: read line_num line_content; do
    var_name=$(echo "$line_content" | sed 's/.*const \([a-zA-Z_][a-zA-Z0-9_]*\) = .*/\1/')
    if [ -n "$var_name" ] && ! grep -q "$var_name" <<< "$(tail -n +$((line_num + 1)) "$file")"; then
      echo "  🗑️ Removing unused variable '$var_name' in: $file"
      sed -i '' "${line_num}d" "$file"
    fi
  done
done

# Run linter to check improvements
echo ""
echo "🔍 Checking improvements..."
AFTER_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

echo "📊 Results:"
echo "  ✅ Fixed: $FIXED_COUNT issues"
echo "  📋 Remaining: $AFTER_COUNT issues"
echo "  📈 Improvement: $(echo "scale=1; $FIXED_COUNT * 100 / $BEFORE_COUNT" | bc)%"

echo ""
echo "🎯 Phase 1 Complete! Ready for Phase 2 (automated unused imports cleanup)"
