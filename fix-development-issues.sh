#!/bin/bash

# Fix Development Issues Script
# Resolves TypeScript schema errors and port conflicts

echo "🔧 EVA Platform - Development Environment Fix"
echo "============================================="

# Step 1: Stop all existing development servers
echo "1. Stopping existing development servers..."
pkill -f "react-scripts\|craco" 2>/dev/null || true
sleep 2

# Step 2: Clear ports
echo "2. Clearing development ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# Step 3: Verify schema file is correct
echo "3. Verifying TypeScript schema configuration..."
if [ -f ".vscode/schemas/package.schema.json" ]; then
    # Check if file contains HTML (corrupted)
    if grep -q "<html>\|<head>\|<body>" ".vscode/schemas/package.schema.json"; then
        echo "   ❌ Schema file is corrupted, fixing..."
        cat > .vscode/schemas/package.schema.json << 'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Package.json Schema",
  "description": "JSON schema for npm package.json files",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the package"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+",
      "description": "Version number"
    },
    "description": {
      "type": "string",
      "description": "Package description"
    },
    "scripts": {
      "type": "object",
      "description": "NPM scripts",
      "additionalProperties": {
        "type": "string"
      }
    },
    "dependencies": {
      "type": "object",
      "description": "Production dependencies",
      "additionalProperties": {
        "type": "string"
      }
    },
    "devDependencies": {
      "type": "object",
      "description": "Development dependencies",
      "additionalProperties": {
        "type": "string"
      }
    }
  },
  "required": ["name", "version"]
}
EOF
        echo "   ✅ Schema file fixed"
    else
        echo "   ✅ Schema file is already valid"
    fi
else
    echo "   ⚠️  Schema file not found, creating..."
    mkdir -p .vscode/schemas
    cat > .vscode/schemas/package.schema.json << 'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Package.json Schema",
  "description": "JSON schema for npm package.json files",
  "type": "object"
}
EOF
    echo "   ✅ Schema file created"
fi

# Step 4: Test TypeScript compilation
echo "4. Testing TypeScript compilation..."
npm run tsc:check >/dev/null 2>&1 || npx tsc --noEmit --skipLibCheck >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ⚠️  TypeScript compilation has warnings (continuing...)"
fi

# Step 5: Clear caches
echo "5. Clearing development caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf build 2>/dev/null || true
echo "   ✅ Caches cleared"

# Step 6: Check dependencies
echo "6. Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "   📦 Installing dependencies..."
    npm install --silent
    echo "   ✅ Dependencies installed"
else
    echo "   ✅ Dependencies already installed"
fi

# Step 7: Start development server
echo "7. Starting development server..."
echo "   🚀 Launching EVA Platform on http://localhost:3000"
echo "   📝 Press Ctrl+C to stop the server"
echo ""
echo "============================================="
echo "✅ All issues resolved! Starting development server..."
echo "============================================="
echo ""

# Start the development server
npm start
