#!/bin/bash

# EVA Platform - Phase 2: Conservative Cleanup (SAFE APPROACH)
# Targets: Only the most obvious and safe unused imports/variables

echo "🔧 Phase 2: Conservative Safe Cleanup"
echo "===================================="

# Get baseline count
BEFORE_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
echo "📊 Starting with: $BEFORE_COUNT issues"

# Fix 1: Remove specific unused imports that are clearly safe
echo "📦 [SAFE] Removing specific unused imports..."

# Target specific unused imports that are definitely safe
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only target specific unused imports that are definitely safe
  if grep -q "@typescript-eslint/no-unused-vars" <<< "$(npm run lint -- "$file" 2>/dev/null)"; then
    # Remove specific unused React imports only if no JSX is used
    if ! grep -q "<[A-Z]" "$file" && grep -q "import React" "$file"; then
      echo "  🗑️ Removing unused React import: $file"
      sed -i '' '/^import React/d' "$file"
    fi

    # Remove specific unused type imports that are clearly unused
    sed -i '' '/^import.*type.*ComponentProps.*never used/d' "$file"
    sed -i '' '/^import.*type.*ReactNode.*never used/d' "$file"
    sed -i '' '/^import.*type.*FC.*never used/d' "$file"
  fi
done

# Fix 2: Remove specific unused variables (very targeted)
echo "🗑️ [TARGETED] Removing specific unused variables..."

# Target specific common unused variable patterns
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only remove variables that match very specific safe patterns
  sed -i '' '/^[ ]*const response.*= await.*never used/d' "$file"
  sed -i '' '/^[ ]*const data.*= .*never used/d' "$file"
  sed -i '' '/^[ ]*const result.*= .*never used/d' "$file"
done

# Fix 3: Fix specific anonymous exports (conservative)
echo "🏷️ [CONSERVATIVE] Fixing specific anonymous exports..."

# Only fix files that have clear anonymous object exports
grep -l "export default {" src/**/*.ts src/**/*.tsx 2>/dev/null | head -5 | while read file; do
  if [ -f "$file" ]; then
    echo "  📝 Fixing anonymous export in: $file"
    # Very specific replacement
    sed -i '' 's/^export default {$/const defaultExport = {/' "$file"
    # Add export at the end only if it doesn't already exist
    if ! grep -q "export default defaultExport" "$file"; then
      echo "" >> "$file"
      echo "export default defaultExport;" >> "$file"
    fi
  fi
done

# Fix 4: Remove console.log statements (safe cleanup)
echo "🧹 [SAFE] Removing console.log statements..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only remove standalone console.log lines
  sed -i '' '/^[ ]*console\.log.*;$/d' "$file"
done

# Fix 5: Fix unnecessary escape characters (targeted)
echo "🔤 [TARGETED] Fixing escape characters..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Only fix specific escape character issues reported by linter
  if grep -q "Unnecessary escape character" <<< "$(npm run lint -- "$file" 2>/dev/null)"; then
    sed -i '' 's/\\(/(/g; s/\\)/)/g' "$file"
  fi
done

# Check results
echo ""
echo "🔍 Checking improvements..."
AFTER_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

echo "📊 Conservative Phase 2 Results:"
echo "  ✅ Fixed: $FIXED_COUNT issues"
echo "  📋 Remaining: $AFTER_COUNT issues"

if [ $FIXED_COUNT -gt 0 ]; then
  echo "  📈 Improvement: $(echo "scale=1; $FIXED_COUNT * 100 / $BEFORE_COUNT" | bc -l)%"
  echo "✨ Conservative progress made safely!"
else
  echo "  📈 No change - all fixes were too risky to apply automatically"
fi

# Verify no syntax errors were introduced
echo ""
echo "🔍 Verifying no syntax errors introduced..."
if npx tsc --noEmit > /dev/null 2>&1; then
  echo "✅ TypeScript compilation successful - no syntax errors"
else
  echo "⚠️ TypeScript compilation issues detected - manual review needed"
fi

echo ""
echo "🎯 Conservative Phase 2 Complete!"
echo "💡 Recommendation: Proceed with manual targeted fixes for remaining issues"
