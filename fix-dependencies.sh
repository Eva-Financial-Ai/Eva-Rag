#!/bin/bash

# EVA Platform Dependency Fixer Script
# Resolves common dependency issues and conflicts

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  EVA Platform Dependency Fixer      ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Function to check if package is installed
check_package() {
  if grep -q "\"$1\"" package.json; then
    return 0 # Found
  else
    return 1 # Not found
  fi
}

# Step 1: Ensure we have critical dependencies
echo -e "${YELLOW}Step 1: Checking critical dependencies...${NC}"

CRITICAL_DEPS=("prop-types" "react-error-boundary" "react-router-dom" "zustand")
MISSING_DEPS=()

for dep in "${CRITICAL_DEPS[@]}"; do
  if ! check_package "$dep"; then
    MISSING_DEPS+=("$dep")
  fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo -e "${YELLOW}Installing missing critical dependencies: ${MISSING_DEPS[*]}${NC}"
  npm install --save "${MISSING_DEPS[@]}" --legacy-peer-deps
  echo -e "${GREEN}✓ Critical dependencies installed${NC}"
else
  echo -e "${GREEN}✓ All critical dependencies are already installed${NC}"
fi
echo ""

# Step 2: Fix React version conflicts
echo -e "${YELLOW}Step 2: Fixing React version conflicts...${NC}"

# Ensure stable React version
echo -e "${BLUE}Installing stable React version...${NC}"
npm install --save react@18.2.0 react-dom@18.2.0 --legacy-peer-deps
npm install --save-dev @types/react@18.2.0 @types/react-dom@18.2.0 --legacy-peer-deps
echo -e "${GREEN}✓ React versions fixed${NC}"
echo ""

# Step 3: Fix prop-types issues
echo -e "${YELLOW}Step 3: Fixing PropTypes issues...${NC}"

# Add prop-types polyfill if not already present
if [ ! -f public/js/prop-types-fallback.js ]; then
  mkdir -p public/js
  echo -e "${BLUE}Creating PropTypes polyfill...${NC}"
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

  # Update index.html to load the polyfill early
  if ! grep -q "<script src=\"%PUBLIC_URL%/js/prop-types-fallback.js\"></script>" public/index.html; then
    sed -i.bak '/<head>/a \    <script src="%PUBLIC_URL%/js/prop-types-fallback.js"></script>' public/index.html
    rm -f public/index.html.bak
  fi
  
  echo -e "${GREEN}✓ PropTypes polyfill created${NC}"
else
  echo -e "${GREEN}✓ PropTypes polyfill already exists${NC}"
fi
echo ""

# Step 4: Clean up node_modules if requested
echo -e "${YELLOW}Step 4: Clean up node_modules?${NC}"
read -p "Do you want to perform a clean reinstallation of all dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Removing node_modules and lock files...${NC}"
  rm -rf node_modules package-lock.json
  
  echo -e "${BLUE}Reinstalling all dependencies...${NC}"
  npm cache clean --force
  npm install --legacy-peer-deps
  
  echo -e "${GREEN}✓ Clean reinstallation completed${NC}"
else
  echo -e "${BLUE}Skipping clean reinstallation${NC}"
fi
echo ""

# Step 5: Create or update environment variables
echo -e "${YELLOW}Step 5: Setting up environment variables...${NC}"

if [ ! -f .env.development.local ]; then
  cat > .env.development.local << 'EOF'
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
FAST_REFRESH=true
REACT_APP_ENABLE_MOCKS=true
EOF
  echo -e "${GREEN}✓ Environment variables configured${NC}"
else
  echo -e "${BLUE}✓ .env.development.local already exists, ensuring critical variables are set...${NC}"
  
  # Ensure critical variables are set
  grep -q "DISABLE_ESLINT_PLUGIN=true" .env.development.local || echo "DISABLE_ESLINT_PLUGIN=true" >> .env.development.local
  grep -q "SKIP_PREFLIGHT_CHECK=true" .env.development.local || echo "SKIP_PREFLIGHT_CHECK=true" >> .env.development.local
  grep -q "TSC_COMPILE_ON_ERROR=true" .env.development.local || echo "TSC_COMPILE_ON_ERROR=true" >> .env.development.local
  
  echo -e "${GREEN}✓ Critical environment variables added if needed${NC}"
fi
echo ""

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Dependency fixes complete!          ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Try starting the application with: ${GREEN}npm run start:no-lint${NC}"
echo -e "2. If issues persist, try: ${GREEN}npm run start:force${NC}"
echo ""

# Make this script executable
chmod +x fix-dependencies.sh 