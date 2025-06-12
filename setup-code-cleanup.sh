#!/bin/bash

echo "🚀 Setting up Automated Code Cleanup System"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your git repository"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No package.json found${NC}"
    echo "Please run this script from the root of your Node.js project"
    exit 1
fi

echo -e "${BLUE}📦 Installing code cleanup system...${NC}"

# Install the cleanup system dependencies
cd code-cleanup-system
npm install

echo -e "${BLUE}🔨 Building cleanup tools...${NC}"
npm run build

# Link the CLI tool globally for development
npm link

cd ..

echo -e "${BLUE}🔧 Initializing cleanup configuration...${NC}"

# Run the init command
code-cleanup init

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Available commands:"
echo -e "${BLUE}  npm run cleanup:analyze${NC} - Analyze your codebase for issues"
echo -e "${BLUE}  npm run cleanup:dry-run${NC} - See what would be removed (safe)"
echo -e "${BLUE}  npm run cleanup:safe${NC} - Remove low-risk duplicates"
echo -e "${BLUE}  npm run cleanup:interactive${NC} - Choose what to remove"
echo ""
echo -e "${YELLOW}⚡ Quick start:${NC}"
echo "  1. Run 'npm run cleanup:analyze' to see potential improvements"
echo "  2. Review the generated report"
echo "  3. Run 'npm run cleanup:dry-run' to see what would be removed"
echo "  4. When ready, run 'npm run cleanup:safe' to start cleaning"
echo ""
echo -e "${GREEN}Happy cleaning! 🧹${NC}"
