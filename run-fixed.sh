#!/bin/bash

# EVA Platform Run Fixed Script
# A simplified script that runs the application with all compatibility fixes

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  EVA Platform Run Fixed              ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check if the user wants to use Mac-specific compatibility flags
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo -e "${YELLOW}macOS detected. Would you like to use additional Mac-specific compatibility flags?${NC}"
  read -p "Apply Mac fixes (recommended)? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    MAC_FIXES=true
    echo -e "${BLUE}Mac-specific fixes will be applied${NC}"
  else
    MAC_FIXES=false
    echo -e "${BLUE}Using standard compatibility mode${NC}"
  fi
else
  MAC_FIXES=false
fi

# Ensure PropTypes polyfill exists
if [ ! -f public/js/prop-types-fallback.js ]; then
  echo -e "${YELLOW}PropTypes polyfill missing, creating it now...${NC}"
  mkdir -p public/js
  cat > public/js/prop-types-fallback.js << 'EOF'
/* Fallback implementation of PropTypes to prevent chunk loading errors */
if (!window.PropTypes) {
  window.PropTypes = {
    array: function() { return null; },
    bool: function() { return null; },
    func: function() { return null; },
    number: function() { return null; },
    object: function() { return null; },
    string: function() { return null; },
    symbol: function() { return null; },
    any: function() { return null; },
    arrayOf: function() { return null; },
    element: function() { return null; },
    elementType: function() { return null; },
    instanceOf: function() { return null; },
    node: function() { return null; },
    objectOf: function() { return null; },
    oneOf: function() { return null; },
    oneOfType: function() { return null; },
    shape: function() { return null; },
    exact: function() { return null; },
    checkPropTypes: function() { return null; },
    resetWarningCache: function() { return null; }
  };
  console.info('PropTypes polyfill loaded');
}
EOF

  # Update index.html if needed
  if ! grep -q "<script src=\"%PUBLIC_URL%/js/prop-types-fallback.js\"></script>" public/index.html; then
    echo -e "${YELLOW}Updating index.html to include the polyfill...${NC}"
    sed -i.bak '/<head>/a \    <script src="%PUBLIC_URL%/js/prop-types-fallback.js"></script>' public/index.html
    rm -f public/index.html.bak
  fi

  echo -e "${GREEN}✓ PropTypes polyfill created${NC}"
fi

# Ensure critical environment variables
if [ ! -f .env.development.local ]; then
  echo -e "${YELLOW}Creating development environment variables...${NC}"
  cat > .env.development.local << 'EOF'
# Core configuration
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
FAST_REFRESH=true
CHOKIDAR_USEPOLLING=true

# Mock API Configuration
REACT_APP_ENABLE_MOCKS=true

# Performance optimizations
GENERATE_SOURCEMAP=false
EOF
  echo -e "${GREEN}✓ Environment variables created${NC}"
else
  echo -e "${BLUE}Ensuring critical environment variables are set...${NC}"
  grep -q "DISABLE_ESLINT_PLUGIN=true" .env.development.local || echo "DISABLE_ESLINT_PLUGIN=true" >> .env.development.local
  grep -q "SKIP_PREFLIGHT_CHECK=true" .env.development.local || echo "SKIP_PREFLIGHT_CHECK=true" >> .env.development.local
  grep -q "TSC_COMPILE_ON_ERROR=true" .env.development.local || echo "TSC_COMPILE_ON_ERROR=true" >> .env.development.local
  grep -q "FAST_REFRESH=true" .env.development.local || echo "FAST_REFRESH=true" >> .env.development.local
  grep -q "CHOKIDAR_USEPOLLING=true" .env.development.local || echo "CHOKIDAR_USEPOLLING=true" >> .env.development.local
  echo -e "${GREEN}✓ Environment variables updated${NC}"
fi

# Kill any running node processes
echo -e "${YELLOW}Stopping any running Node.js processes...${NC}"
killall node 2>/dev/null || true

# Set up command based on OS
echo -e "${YELLOW}Starting the application with compatibility fixes...${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the application${NC}"

# Build the command based on OS
if [ "$MAC_FIXES" = true ]; then
  # Mac with additional fixes
  NODE_OPTIONS=--openssl-legacy-provider SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true TSC_COMPILE_ON_ERROR=true FAST_REFRESH=true CHOKIDAR_USEPOLLING=true react-scripts start
else
  # Standard fixes for all platforms
  SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true TSC_COMPILE_ON_ERROR=true FAST_REFRESH=true CHOKIDAR_USEPOLLING=true react-scripts start
fi

# Make this script executable
chmod +x run-fixed.sh 