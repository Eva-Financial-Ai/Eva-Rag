#!/bin/bash

echo "🚨 EVA AI Frontend - Node Version Emergency Fix"
echo "==============================================="
echo "Current Node version: $(node --version)"
echo "Required: Node 18.x or 20.x (NOT 23.x)"
echo ""

# Check if NVM is installed
if command -v nvm &> /dev/null; then
    echo "✅ NVM found - installing Node 20.11.0..."
    nvm install 20.11.0
    nvm use 20.11.0
    echo "✅ Node version fixed: $(node --version)"
elif command -v brew &> /dev/null; then
    echo "🍺 Homebrew found - installing Node 20..."
    echo "⚠️  This will replace your current Node installation"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install node@20
        brew unlink node
        brew link node@20 --force --overwrite
        echo "✅ Node version fixed: $(node --version)"
    else
        echo "❌ Installation cancelled"
        exit 1
    fi
else
    echo "❌ Neither NVM nor Homebrew found"
    echo ""
    echo "🔧 Manual Installation Options:"
    echo "1. Install NVM (recommended):"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   source ~/.bashrc"
    echo "   nvm install 20.11.0"
    echo ""
    echo "2. Install Homebrew:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "   brew install node@20"
    echo ""
    echo "3. Download Node 20.11.0 manually from:"
    echo "   https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg"
    echo ""
    exit 1
fi

# Verify Node version
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v20.* ]] || [[ $NODE_VERSION == v18.* ]]; then
    echo "✅ Node version is now compatible: $NODE_VERSION"
    
    # Clean install dependencies
    echo "🧹 Cleaning and reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm install --no-optional --legacy-peer-deps
    
    echo "🚀 Starting development server..."
    npm run start:no-lint
else
    echo "❌ Node version still incompatible: $NODE_VERSION"
    echo "Please manually install Node 18.x or 20.x"
    exit 1
fi 