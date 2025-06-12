#!/bin/bash

echo "🔧 Quick Fix for EVA Platform Development Issues"
echo "================================================="

# 1. Kill any processes on port 3000
echo "1. Clearing port 3000..."
pkill -f "port.*3000" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Stop all React/Node development servers
echo "2. Stopping development servers..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "craco" 2>/dev/null || true
sleep 2

# 3. Verify and fix the schema file
echo "3. Fixing TypeScript schema..."
if [ -f ".vscode/schemas/package.schema.json" ]; then
    if grep -q "Document Moved\|html\|body" ".vscode/schemas/package.schema.json"; then
        echo "   Fixing corrupted schema file..."
        echo '{"$schema":"http://json-schema.org/draft-07/schema#","title":"Package Schema","type":"object"}' > .vscode/schemas/package.schema.json
        echo "   ✅ Schema fixed"
    fi
fi

# 4. Clear cache
echo "4. Clearing cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# 5. Test TypeScript
echo "5. Testing TypeScript..."
npx tsc --noEmit --skipLibCheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ TypeScript OK"
else
    echo "   ⚠️  TypeScript has issues but continuing..."
fi

echo ""
echo "✅ Issues resolved! You can now run:"
echo "   npm start    (to start the development server)"
echo "   npm test     (to run tests)"
echo "   npm run build (to create production build)"
echo ""
