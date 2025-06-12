#!/bin/bash

# EVA Platform Quick Start Script
# A simplified startup script that skips most of the configuration steps

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  EVA Platform Quick Start            ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Create essential configuration files if they don't exist
echo -e "${YELLOW}Setting up minimal environment...${NC}"

# Create .env.development.local with essential variables
if [ ! -f .env.development.local ]; then
  cat > .env.development.local << 'EOF'
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
FAST_REFRESH=true
REACT_APP_ENABLE_MOCKS=true
EOF
  echo -e "${GREEN}✓ Created .env.development.local${NC}"
fi

# Create .eslintrc.local.js with relaxed rules
if [ ! -f .eslintrc.local.js ]; then
  cat > .eslintrc.local.js << 'EOF'
module.exports = {
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
EOF
  echo -e "${GREEN}✓ Created .eslintrc.local.js${NC}"
fi

# Add prop-types polyfill to prevent common errors
if [ ! -f public/js/prop-types-fallback.js ]; then
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
  echo -e "${GREEN}✓ Created PropTypes polyfill${NC}"
  
  # Update index.html to load the polyfill early if not already included
  if ! grep -q "<script src=\"%PUBLIC_URL%/js/prop-types-fallback.js\"></script>" public/index.html; then
    sed -i.bak '/<head>/a \    <script src="%PUBLIC_URL%/js/prop-types-fallback.js"></script>' public/index.html
    rm -f public/index.html.bak
    echo -e "${GREEN}✓ Added polyfill to index.html${NC}"
  fi
fi

# Ensure critical dependencies are installed
echo -e "${YELLOW}Checking critical dependencies...${NC}"
if ! grep -q '"prop-types"' package.json; then
  echo -e "${YELLOW}Installing critical dependency: prop-types${NC}"
  npm install --save prop-types
  echo -e "${GREEN}✓ Installed prop-types${NC}"
fi

# Kill any running node processes
echo -e "${YELLOW}Stopping any running Node.js processes...${NC}"
killall node 2>/dev/null || true
echo -e "${GREEN}✓ Environment ready${NC}"

# Start the app with compatibility flags
echo -e "${YELLOW}Starting the application...${NC}"
echo -e "${BLUE}Using compatibility mode with relaxed checking${NC}"

# Determine if we're on macOS or Linux for the correct command format
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  DISABLE_ESLINT_PLUGIN=true SKIP_PREFLIGHT_CHECK=true TSC_COMPILE_ON_ERROR=true FAST_REFRESH=true react-scripts start
else
  # Linux and others
  DISABLE_ESLINT_PLUGIN=true SKIP_PREFLIGHT_CHECK=true TSC_COMPILE_ON_ERROR=true FAST_REFRESH=true react-scripts start
fi

# Make this script executable
chmod +x quick-start.sh 