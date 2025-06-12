#!/bin/bash

# EVA AI Frontend - Branch Protection Setup Script
# This script configures branch protection rules for the main branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="Eva-Financial-Ai"
REPO_NAME="eva-mvp-fe"
BRANCH="main"

echo -e "${BLUE}🔒 Setting up branch protection for ${REPO_OWNER}/${REPO_NAME}...${NC}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "   brew install gh"
    echo "   # or"
    echo "   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  You need to authenticate with GitHub first:${NC}"
    echo "   gh auth login"
    exit 1
fi

echo -e "${YELLOW}📋 Configuring branch protection rules for '${BRANCH}' branch...${NC}"

# Create branch protection rule
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}/protection" \
  --input - << EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "test",
      "pr-validation",
      "accessibility-check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Branch protection rules successfully configured!${NC}"
    echo ""
    echo -e "${BLUE}📋 Protection Rules Summary:${NC}"
    echo "   • Require pull request reviews (1 approver minimum)"
    echo "   • Require status checks to pass"
    echo "   • Dismiss stale reviews when new commits are pushed"
    echo "   • Require code owner reviews"
    echo "   • Enforce for administrators"
    echo "   • Block force pushes and deletions"
    echo "   • Require conversation resolution before merging"
    echo ""
    echo -e "${YELLOW}📝 Required Status Checks:${NC}"
    echo "   • test (TypeScript check, unit tests, build)"
    echo "   • pr-validation (linting, formatting, coverage)"
    echo "   • accessibility-check (a11y compliance)"
    echo ""
    echo -e "${GREEN}🎉 Your main branch is now protected!${NC}"
else
    echo -e "${RED}❌ Failed to configure branch protection rules.${NC}"
    echo "   Please check your permissions and try again."
    exit 1
fi

# Optional: Create CODEOWNERS file if it doesn't exist
if [ ! -f ".github/CODEOWNERS" ]; then
    echo -e "${YELLOW}📝 Creating CODEOWNERS file...${NC}"
    mkdir -p .github
    cat > .github/CODEOWNERS << 'EOF'
# EVA AI Frontend Code Owners
# These owners will be requested for review when someone opens a pull request.

# Global owners
* @eva-financial-ai/frontend-team

# Core application files
/src/App.tsx @eva-financial-ai/senior-developers
/src/index.tsx @eva-financial-ai/senior-developers

# Configuration files
package.json @eva-financial-ai/senior-developers
tsconfig.json @eva-financial-ai/senior-developers
vite.config.ts @eva-financial-ai/senior-developers

# CI/CD and deployment
/.github/ @eva-financial-ai/devops-team
/scripts/ @eva-financial-ai/devops-team
wrangler.toml @eva-financial-ai/devops-team

# Security and authentication
/src/contexts/AuthContext.tsx @eva-financial-ai/security-team
/src/services/AuthService.ts @eva-financial-ai/security-team

# Financial components (require extra scrutiny)
/src/components/credit/ @eva-financial-ai/senior-developers @eva-financial-ai/compliance-team
/src/components/risk/ @eva-financial-ai/senior-developers @eva-financial-ai/compliance-team
/src/utils/financialCalculations.ts @eva-financial-ai/senior-developers @eva-financial-ai/compliance-team

# Documentation
README.md @eva-financial-ai/documentation-team
/docs/ @eva-financial-ai/documentation-team
EOF
    echo -e "${GREEN}✅ CODEOWNERS file created!${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Ensure your team members have the appropriate GitHub teams assigned"
echo "2. Test the protection by creating a pull request"
echo "3. Verify that status checks are working correctly"
echo "4. Update team permissions as needed"
echo ""
echo -e "${GREEN}🔗 Useful Links:${NC}"
echo "   • Repository Settings: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings"
echo "   • Branch Protection: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
echo "   • Actions: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions" 