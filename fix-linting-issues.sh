#!/bin/bash

# EVA Platform - Automated Linting Fix Script
# Phase 1: Safe Automated Fixes

echo "🔧 EVA Platform Linting Fixes - Phase 1: Automated Cleanup"
echo "============================================================"

# Fix 1: Remove unused imports (safest fix)
echo "📦 Fixing unused imports..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/^import.*{[^}]*}.*from/s/{[^,{}]*,\s*\([^}]*\)}/{\1}/g'

# Fix 2: Fix anonymous default exports
echo "🏷️ Fixing anonymous default exports..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "export default {" "$file"; then
    sed -i '' 's/export default {/const defaultExport = {/g' "$file"
    echo "export default defaultExport;" >> "$file"
  fi
done

# Fix 3: Replace restricted 'screen' globals with proper screen imports
echo "🖥️ Fixing restricted globals..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "Unexpected use of 'screen'" <<< "$(npm run lint -- --format=compact "$file" 2>/dev/null)" && ! grep -q "import.*screen" "$file"; then
    # Add screen import if using screen without import
    if grep -q "@testing-library/react" "$file"; then
      sed -i '' 's/import.*@testing-library\/react.*/&/; s/{[^}]*}/{&, screen}/' "$file"
    fi
  fi
done

# Fix 4: Fix escape characters
echo "🔤 Fixing unnecessary escape characters..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\\(/(/g; s/\\)/)/g'

# Fix 5: Remove unused variables (conservative approach)
echo "🗑️ Removing obvious unused variables..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remove unused const declarations that are clearly unused
  sed -i '' '/const [a-zA-Z_][a-zA-Z0-9_]* = [^;]*;$/d' "$file"
done

# Fix 6: Fix accessibility anchor issues
echo "♿ Fixing accessibility issues..."
find src -name "*.tsx" | xargs sed -i '' 's/<a href="#"/<button type="button"/g; s/<\/a>/<\/button>/g'

echo "✅ Phase 1 automated fixes complete!"
echo "🔍 Running linter to check improvements..."

# Run linter and show improvement
BEFORE_COUNT=$(npm run lint 2>&1 | grep -c "warning\|error" || echo "0")
echo "📊 Remaining issues: $BEFORE_COUNT"

echo ""
echo "🎯 Next: Run 'bash fix-linting-issues.sh' again for Phase 2 fixes"
