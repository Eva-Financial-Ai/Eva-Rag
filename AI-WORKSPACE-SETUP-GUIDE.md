# AI Workspace Setup Guide - EVA Platform

## Quick Start: Setting Up 40+ AI Agent Workspaces

---

## Workspace Creation Script

```bash
#!/bin/bash
# create-ai-workspaces.sh

# Base directory for all AI workspaces
BASE_DIR="eva-ai-workspaces"
mkdir -p $BASE_DIR

# Developer 1 Workspaces - Portfolio & Smart Match
mkdir -p $BASE_DIR/dev1-portfolio/portfolio-core
mkdir -p $BASE_DIR/dev1-portfolio/portfolio-analytics
mkdir -p $BASE_DIR/dev1-portfolio/portfolio-reporting
mkdir -p $BASE_DIR/dev1-portfolio/portfolio-ui
mkdir -p $BASE_DIR/dev1-smart-match/smart-match-engine
mkdir -p $BASE_DIR/dev1-smart-match/smart-match-ml
mkdir -p $BASE_DIR/dev1-smart-match/smart-match-api
mkdir -p $BASE_DIR/dev1-smart-match/smart-match-notifications

# Developer 2 Workspaces - Credit & Documents
mkdir -p $BASE_DIR/dev2-credit/credit-app-forms
mkdir -p $BASE_DIR/dev2-credit/credit-app-validation
mkdir -p $BASE_DIR/dev2-credit/credit-app-integrations
mkdir -p $BASE_DIR/dev2-credit/lender-onboarding
mkdir -p $BASE_DIR/dev2-documents/documents-filelock
mkdir -p $BASE_DIR/dev2-documents/documents-versioning
mkdir -p $BASE_DIR/dev2-documents/documents-sharing
mkdir -p $BASE_DIR/dev2-documents/documents-ui

# Developer 3 Workspaces - Risk & Customer
mkdir -p $BASE_DIR/dev3-risk/risk-scoring-engine
mkdir -p $BASE_DIR/dev3-risk/risk-visualizations
mkdir -p $BASE_DIR/dev3-risk/risk-alerts
mkdir -p $BASE_DIR/dev3-risk/risk-reporting
mkdir -p $BASE_DIR/dev3-retention/retention-lifecycle
mkdir -p $BASE_DIR/dev3-retention/retention-campaigns
mkdir -p $BASE_DIR/dev3-retention/retention-analytics
mkdir -p $BASE_DIR/dev3-retention/retention-crm

# Developer 4 Workspaces - Transaction & Platform
mkdir -p $BASE_DIR/dev4-transaction/transaction-signatures
mkdir -p $BASE_DIR/dev4-transaction/transaction-payments
mkdir -p $BASE_DIR/dev4-transaction/transaction-audit
mkdir -p $BASE_DIR/dev4-asset/asset-marketplace
mkdir -p $BASE_DIR/dev4-asset/asset-valuation
mkdir -p $BASE_DIR/dev4-asset/asset-matching
mkdir -p $BASE_DIR/dev4-platform/team-management
mkdir -p $BASE_DIR/dev4-platform/platform-integration

# Shared Testing & Documentation Workspaces
mkdir -p $BASE_DIR/shared/test-unit
mkdir -p $BASE_DIR/shared/test-integration
mkdir -p $BASE_DIR/shared/test-e2e
mkdir -p $BASE_DIR/shared/docs-api
mkdir -p $BASE_DIR/shared/docs-user
mkdir -p $BASE_DIR/shared/docs-technical

echo "Created 40+ AI workspace directories"
```

---

## Initial Workspace Setup

### Step 1: Clone Base Repository to Each Workspace

```bash
# For each workspace, clone the main repository
for workspace in $BASE_DIR/*/*; do
  cd $workspace
  git clone https://github.com/eva-platform/frontend.git .
  git checkout -b ai-$(basename $workspace)
  cd -
done
```

### Step 2: Create Workspace Configuration Files

Create `.cursor/workspace-config.json` in each workspace:

```json
{
  "workspace_name": "portfolio-core",
  "developer_owner": "Developer 1",
  "ai_agent_focus": "Portfolio CRUD operations and data models",
  "dependencies": ["portfolio-analytics", "smart-match-engine"],
  "output_directory": "src/components/portfolio",
  "test_directory": "src/components/portfolio/__tests__",
  "primary_files": [
    "src/types/portfolio.types.ts",
    "src/api/services/portfolioService.ts",
    "src/components/portfolio/PortfolioList.tsx",
    "src/components/portfolio/PortfolioDetail.tsx"
  ]
}
```

---

## AI Agent Prompt Library

### 1. Portfolio Core Workspace

```markdown
You are an AI developer working on the Portfolio Management core functionality for EVA Platform.

Your specific tasks:

1. Create TypeScript interfaces for Portfolio entities
2. Implement CRUD operations for portfolios
3. Build React components for portfolio management
4. Create comprehensive unit tests

Context:

- Use React 18 with TypeScript
- Follow the existing codebase patterns
- Integrate with existing authentication
- Use TailwindCSS for styling

Start by creating:

1. `src/types/portfolio.types.ts` - All portfolio-related types
2. `src/api/services/portfolioService.ts` - API service layer
3. `src/components/portfolio/PortfolioList.tsx` - List view component
4. `src/components/portfolio/PortfolioDetail.tsx` - Detail view component
5. Tests for all components and services
```

### 2. Smart Match Engine Workspace

```markdown
You are an AI developer implementing the Smart Match Lender matching engine.

Your specific tasks:

1. Implement the scoring algorithm based on the technical specifications
2. Create the matching engine core logic
3. Build the pre-filtering system
4. Implement caching strategies

Reference the Smart Match Lender Technical Specifications for detailed requirements.

Key components to build:

1. `src/services/matching/scoringEngine.ts`
2. `src/services/matching/matchingEngine.ts`
3. `src/services/matching/filterEngine.ts`
4. `src/services/matching/matchingCache.ts`
5. Comprehensive tests for all components

Use these scoring weights:

- Credit Score: 25%
- Loan Amount: 20%
- Geographic: 15%
- Industry: 15%
- Historical Success: 15%
- Processing Speed: 10%
```

### 3. Credit Application Forms Workspace

```markdown
You are an AI developer building the multi-step credit application form system.

Your specific tasks:

1. Create a multi-step form component with progress tracking
2. Implement form state persistence
3. Add comprehensive validation
4. Build responsive UI components

Requirements:

- Use React Hook Form for form management
- Implement auto-save functionality
- Add progress indicators
- Support file uploads
- Mobile-responsive design

Components to create:

1. `src/components/credit/MultiStepForm.tsx`
2. `src/components/credit/FormProgress.tsx`
3. `src/components/credit/FormSteps/PersonalInfo.tsx`
4. `src/components/credit/FormSteps/BusinessInfo.tsx`
5. `src/components/credit/FormSteps/FinancialInfo.tsx`
6. `src/components/credit/FormSteps/DocumentUpload.tsx`
```

---

## Developer Workflow Commands

### Morning Review Script

```bash
#!/bin/bash
# morning-review.sh

echo "🌅 Morning AI Agent Review"
echo "========================="

# Check all workspaces for overnight changes
for workspace in eva-ai-workspaces/*/*; do
  echo "\n📁 Checking $workspace"
  cd $workspace

  # Check git status
  changes=$(git status --porcelain | wc -l)
  if [ $changes -gt 0 ]; then
    echo "✅ Changes detected: $changes files"
    git diff --stat
  else
    echo "❌ No changes"
  fi

  # Check for test results
  if [ -f "test-results.json" ]; then
    echo "🧪 Test Results:"
    cat test-results.json | jq '.summary'
  fi

  cd - > /dev/null
done
```

### Integration Helper Script

```bash
#!/bin/bash
# integrate-workspaces.sh

# Create integration branch
cd eva-platform-frontend-main
git checkout -b integration/$(date +%Y%m%d)

# Cherry-pick approved changes from AI workspaces
echo "Select workspace to integrate:"
select workspace in eva-ai-workspaces/*/*; do
  cd $workspace

  echo "Recent commits:"
  git log --oneline -10

  echo "Enter commit SHA to cherry-pick (or 'skip'):"
  read commit_sha

  if [ "$commit_sha" != "skip" ]; then
    cd ../../eva-platform-frontend-main
    git cherry-pick $commit_sha
  fi

  break
done
```

---

## AI Agent Management Dashboard

### Create a Simple Monitoring Dashboard

```html
<!-- ai-dashboard.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>EVA AI Agent Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">AI Agent Workspace Status</h1>

      <div class="grid grid-cols-4 gap-4">
        <!-- Developer 1 Status -->
        <div class="bg-white p-4 rounded shadow">
          <h2 class="text-xl font-semibold">Developer 1</h2>
          <div class="mt-2">
            <div class="workspace-status" data-workspace="portfolio-core">
              <span class="font-medium">portfolio-core:</span>
              <span class="status">🟢 Active</span>
            </div>
            <!-- Add more workspaces -->
          </div>
        </div>

        <!-- Repeat for other developers -->
      </div>

      <div class="mt-8">
        <h2 class="text-2xl font-semibold mb-4">Progress Metrics</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-blue-100 p-4 rounded">
            <h3 class="font-semibold">Lines of Code</h3>
            <p class="text-3xl font-bold">45,230</p>
          </div>
          <div class="bg-green-100 p-4 rounded">
            <h3 class="font-semibold">Test Coverage</h3>
            <p class="text-3xl font-bold">87%</p>
          </div>
          <div class="bg-yellow-100 p-4 rounded">
            <h3 class="font-semibold">Features Complete</h3>
            <p class="text-3xl font-bold">6/9</p>
          </div>
        </div>
      </div>
    </div>

    <script>
      // Auto-refresh every 30 seconds
      setInterval(() => {
        location.reload();
      }, 30000);
    </script>
  </body>
</html>
```

---

## Best Practices for AI Agent Management

### 1. Clear Workspace Boundaries

- Each workspace focuses on ONE specific area
- Avoid overlapping responsibilities
- Define clear interfaces between workspaces

### 2. Prompt Engineering Tips

- Be extremely specific about requirements
- Include code examples from existing codebase
- Reference design patterns to follow
- Specify testing requirements upfront

### 3. Code Review Process

```bash
# Quick review checklist
- [ ] Code follows project conventions
- [ ] TypeScript types are comprehensive
- [ ] Tests pass with >80% coverage
- [ ] No console.logs or debugging code
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Mobile responsive
- [ ] Accessibility features included
```

### 4. Integration Strategy

- Review and integrate every 4 hours
- Never integrate untested code
- Use feature flags for gradual rollout
- Maintain integration log

### 5. AI Agent Monitoring

```javascript
// monitoring-config.js
module.exports = {
  workspaces: {
    'portfolio-core': {
      expectedFilesPerDay: 10,
      expectedTestsPerDay: 20,
      maxErrorRate: 0.05,
    },
    // ... other workspaces
  },
  alerts: {
    noActivity: 2, // hours
    highErrorRate: 0.1,
    lowTestCoverage: 0.7,
  },
};
```

---

## Troubleshooting Common Issues

### Issue 1: AI Agent Stuck or Repeating

**Solution**: Provide more specific context or examples

### Issue 2: Inconsistent Code Style

**Solution**: Add ESLint config to workspace and reference in prompts

### Issue 3: Integration Conflicts

**Solution**: Use smaller, more frequent integrations

### Issue 4: Test Failures

**Solution**: Have AI agent fix tests before moving to new features

### Issue 5: Performance Issues

**Solution**: Add performance requirements to initial prompts

---

## Daily Checklist for Developers

### Morning (9 AM)

- [ ] Run morning review script
- [ ] Check AI agent progress
- [ ] Identify stuck workspaces
- [ ] Plan integration priorities

### Midday (1 PM)

- [ ] First integration round
- [ ] Update AI agent prompts
- [ ] Resolve conflicts
- [ ] Run test suites

### Evening (5 PM)

- [ ] Final integration round
- [ ] Set overnight tasks
- [ ] Update progress tracking
- [ ] Prepare next day plan

---

## Success Metrics Tracking

```javascript
// Track daily progress
const dailyMetrics = {
  date: '2025-05-27',
  workspacesActive: 40,
  featuresCompleted: 2,
  linesOfCode: 12450,
  testsWritten: 234,
  testCoverage: 0.85,
  bugsFixed: 45,
  integrationSuccess: 0.92,
};

// Log to tracking system
fetch('/api/metrics', {
  method: 'POST',
  body: JSON.stringify(dailyMetrics),
});
```

---

_Last Updated: May 27, 2025_
_For questions: Contact lead developer_
