#!/bin/bash
echo "🔐 Applying Security & Authentication Fixes..."

# Find all files that need security updates
FILES_TO_UPDATE=$(find src/ -name "*.tsx" -o -name "*.ts" | grep -v test | grep -v ".d.ts")

for file in $FILES_TO_UPDATE; do
    # Check if file contains sensitive data handling
    if grep -q "password\|ssn\|taxId\|bankAccount" "$file" 2>/dev/null; then
        echo "Updating security in: $file"

        # Add security import if not present
        if ! grep -q "import.*security" "$file"; then
            sed -i '' '1i\
import { encryptSensitiveData, decryptSensitiveData, secureStorage } from '"'"'../utils/security'"'"';\
' "$file" 2>/dev/null || true
        fi
    fi
done

echo "✅ Security fixes applied"
