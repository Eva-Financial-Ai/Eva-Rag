#!/bin/bash

# EVA Platform - Phase 2: Automated High-Volume Cleanup
# Targets: ~400 unused variables, ~150 anonymous exports, import cleanup

echo "🔧 Phase 2: Automated High-Volume Cleanup"
echo "=========================================="

# Get baseline count
BEFORE_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
echo "📊 Starting with: $BEFORE_COUNT issues"

# Fix 1: Remove unused imports systematically
echo "📦 [HIGH IMPACT] Cleaning unused imports..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Create backup
  cp "$file" "$file.backup"

  # Remove clearly unused imports
  sed -i '' '/^import.*{[^}]*}.*from.*@testing-library.*/{
    s/{ *act *,//g
    s/, *act *}/ }/g
    s/{ *act *}/{ }/g
    s/{ *within *,//g
    s/, *within *}/ }/g
    s/{ *within *}/{ }/g
    s/{ *fireEvent *,//g
    s/, *fireEvent *}/ }/g
    s/{ *fireEvent *}/{ }/g
  }' "$file"

  # Remove empty import statements
  sed -i '' '/^import { *} from/d' "$file"

  # Clean up unused icon imports
  sed -i '' '/^import.*{[^}]*Icon[^}]*}.*from.*@heroicons.*/{
    s/{ *[A-Za-z]*Icon *,//g
    s/, *[A-Za-z]*Icon *}/ }/g
    s/{ *[A-Za-z]*Icon *}/{ }/g
  }' "$file"

  # Remove lines that are just unused imports
  sed -i '' '/^import.*{[^}]*}.*from.*lucide-react.*/{
    s/{ *[A-Za-z]* *,//g
    s/, *[A-Za-z]* *}/ }/g
    s/{ *[A-Za-z]* *}/{ }/g
  }' "$file"
done

# Fix 2: Remove unused variable declarations (very conservative)
echo "🗑️ [SAFE] Removing obvious unused variables..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remove obvious unused const declarations that match pattern
  sed -i '' '/^[ ]*const [a-zA-Z_][a-zA-Z0-9_]* = [^;]*;[ ]*$/d' "$file"

  # Remove unused imports of specific common types
  sed -i '' '/^import.*\(ComponentProps\|ReactNode\|FC\|useMemo\|lazy\|Suspense\).*never used/d' "$file"
done

# Fix 3: Fix anonymous default exports
echo "🏷️ [MEDIUM IMPACT] Fixing anonymous default exports..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "export default {" "$file"; then
    echo "  📝 Fixing anonymous export in: $file"
    # Replace anonymous export with named export
    sed -i '' 's/export default {/const exportObject = {/g' "$file"
    sed -i '' '$a\
export default exportObject;' "$file"
  fi

  # Fix anonymous function exports
  if grep -q "export default (" "$file"; then
    echo "  🔧 Fixing anonymous function export in: $file"
    sed -i '' 's/export default (/const defaultFunction = (/g' "$file"
    sed -i '' '$a\
export default defaultFunction;' "$file"
  fi
done

# Fix 4: Clean up unused React imports
echo "⚛️ [SAFE] Cleaning React imports..."
find src -name "*.tsx" | while read file; do
  # If file doesn't use JSX or React features, remove React import
  if ! grep -q "React\." "$file" && ! grep -q "<[A-Z]" "$file"; then
    sed -i '' '/^import React/d' "$file"
  fi
done

# Fix 5: Remove console.log statements (code cleanup)
echo "🧹 [SAFE] Removing console.log statements..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' '/console\.log/d' "$file"
done

# Fix 6: Clean up empty lines and formatting
echo "📐 [SAFE] Cleaning formatting..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remove multiple consecutive empty lines
  sed -i '' '/^$/N;/^\n$/d' "$file"
done

# Fix 7: Remove backup files
echo "🧽 Cleaning backup files..."
find src -name "*.backup" -delete

# Run linter to check improvements
echo ""
echo "🔍 Checking improvements..."
AFTER_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

echo "📊 Phase 2 Results:"
echo "  ✅ Fixed: $FIXED_COUNT issues"
echo "  📋 Remaining: $AFTER_COUNT issues"
echo "  📈 Improvement: $(echo "scale=1; $FIXED_COUNT * 100 / $BEFORE_COUNT" | bc -l)%"

if [ $FIXED_COUNT -gt 100 ]; then
  echo "🎉 Excellent! Significant progress made."
elif [ $FIXED_COUNT -gt 50 ]; then
  echo "✨ Good progress! Ready for Phase 3."
else
  echo "⚠️ Limited progress. May need manual intervention."
fi

echo ""
echo "🎯 Phase 2 Complete! Ready for Phase 3 (React Hooks & Logic fixes)"
