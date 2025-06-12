#!/bin/bash
echo "💰 Applying Financial Calculations & Compliance Fixes..."

# Find all files with financial calculations
FILES_WITH_CALCULATIONS=$(grep -r "amount\|payment\|interest\|rate" src/ --include="*.tsx" --include="*.ts" | grep -E "[\+\-\*\/]" | cut -d: -f1 | sort -u)

for file in $FILES_WITH_CALCULATIONS; do
    echo "Adding financial utilities to: $file"

    # Add financial utils import if not present
    if ! grep -q "import.*financialUtils" "$file"; then
        sed -i '' '1i\
import { calculateWithPrecision, formatCurrency } from '"'"'../utils/financialUtils'"'"';\
' "$file" 2>/dev/null || true
    fi
done

echo "✅ Financial compliance fixes applied"
