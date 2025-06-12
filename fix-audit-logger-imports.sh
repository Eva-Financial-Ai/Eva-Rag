#!/bin/bash

echo "🔧 Fixing auditLogger import paths..."

# Fix imports in components (2 levels deep)
find src/components -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../../utils/auditLogger|g" "$file"
    sed -i '' "s|from [\"']\.\./\.\./\.\./utils/auditLogger|from '../../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in pages (1 level deep)
find src/pages -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in contexts (1 level deep)
find src/contexts -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in services (1 level deep)
find src/services -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in hooks (1 level deep)
find src/hooks -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in utils itself (same level)
find src/utils -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if [[ "$file" != "src/utils/auditLogger.ts" ]] && grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from './auditLogger|g" "$file"
  fi
done

# Fix imports in test directory
find src/test -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from '../utils/auditLogger|g" "$file"
  fi
done

# Fix imports in root src files (already fixed but double-check)
for file in src/reportWebVitals.ts src/serviceWorkerRegistration.ts; do
  if [ -f "$file" ] && grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
    echo "Fixing: $file"
    sed -i '' "s|from [\"']\.\./utils/auditLogger|from './utils/auditLogger|g" "$file"
  fi
done

echo "✅ Import paths fixed!"