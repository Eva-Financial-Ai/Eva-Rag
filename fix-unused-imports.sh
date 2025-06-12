#!/bin/bash

echo "Starting to fix unused imports..."

# Find TypeScript/JavaScript files in src directory
FILES=$(find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

# Use ESLint to fix unused imports
echo "Running ESLint to fix unused imports..."
npx eslint $FILES --fix --rule "no-unused-vars: error" --rule "@typescript-eslint/no-unused-vars: error"

echo "Unused imports cleanup completed." 