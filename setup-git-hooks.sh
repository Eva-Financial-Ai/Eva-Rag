#!/bin/bash

# Setup script for git hooks
# Run this after initializing git repository

echo "🔧 Setting up git hooks..."

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"

echo "✅ Git hooks setup complete!"
echo "Now your code will be automatically formatted before each commit."