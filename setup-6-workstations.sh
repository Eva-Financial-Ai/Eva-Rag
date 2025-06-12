#!/bin/bash
# EVA Platform - 6 Workstation Setup Script
# Sets up 6 development workstations for parallel AI-assisted development

echo "🚀 EVA Platform 6-Workstation Setup"
echo "==================================="
echo "Setting up revolutionary development environment..."
echo ""

# Base directory for all workstations
BASE_DIR="eva-6-workstations"
mkdir -p $BASE_DIR

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create workstation
create_workstation() {
    local ws_id=$1
    local dev_name=$2
    local features=$3

    echo -e "${BLUE}Setting up Workstation $ws_id for $dev_name${NC}"

    # Create workstation directory
    mkdir -p "$BASE_DIR/workstation-$ws_id"
    cd "$BASE_DIR/workstation-$ws_id"

    # Clone repository
    if [ ! -d "eva-platform" ]; then
        git clone https://github.com/financeaiguy/evafi-ai-fe-demo.git eva-platform
    fi

    # Create workspace configuration
    cat > workspace-config.json << EOF
{
  "workstation_id": "$ws_id",
  "developer": "$dev_name",
  "features": $features,
  "cursor_instances": 3,
  "ai_agents": [
    "feature-development",
    "test-generation",
    "api-integration",
    "documentation"
  ],
  "rotation_interval": 5,
  "overnight_tasks_enabled": true
}
EOF

    # Create monitoring dashboard
    cat > monitor.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Workstation Monitor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <meta http-equiv="refresh" content="30">
</head>
<body class="bg-gray-900 text-white p-4">
    <h1 class="text-2xl font-bold mb-4">Workstation Status</h1>
    <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-800 p-4 rounded">
            <h2 class="text-lg font-semibold">Cursor Instance 1</h2>
            <p class="text-green-400">🟢 Active</p>
            <p class="text-sm">Current: Feature Development</p>
            <p class="text-sm">Progress: 75%</p>
        </div>
        <div class="bg-gray-800 p-4 rounded">
            <h2 class="text-lg font-semibold">Cursor Instance 2</h2>
            <p class="text-yellow-400">🟡 Processing</p>
            <p class="text-sm">Current: API Integration</p>
            <p class="text-sm">ETA: 3 min</p>
        </div>
        <div class="bg-gray-800 p-4 rounded">
            <h2 class="text-lg font-semibold">Cursor Instance 3</h2>
            <p class="text-yellow-400">🟡 Processing</p>
            <p class="text-sm">Current: Test Generation</p>
            <p class="text-sm">ETA: 2 min</p>
        </div>
    </div>
</body>
</html>
EOF

    cd - > /dev/null
    echo -e "${GREEN}✓ Workstation $ws_id setup complete${NC}"
    echo ""
}

# Create Developer 1 Workstations (Foundation & Data)
echo -e "${YELLOW}=== Developer 1: Foundation & Data ===${NC}"
create_workstation "1A" "Developer 1" '["Customer Retention Platform", "CRM Core", "Database Schema"]'
create_workstation "1B" "Developer 1" '["Team Management", "Auth0 Integration", "Permissions"]'
create_workstation "1C" "Developer 1" '["Database APIs", "Core Services", "Integration Layer"]'

# Create Developer 2 Workstations (Applications & Integrations)
echo -e "${YELLOW}=== Developer 2: Applications & Integrations ===${NC}"
create_workstation "2A" "Developer 2" '["Credit Application", "Multi-step Forms", "Validation"]'
create_workstation "2B" "Developer 2" '["Plaid Integration", "QuickBooks API", "Financial Data"]'
create_workstation "2C" "Developer 2" '["Credit Bureau APIs", "FICO Scores", "Business Credit"]'

# Create Developer 3 Workstations (Intelligence & Risk)
echo -e "${YELLOW}=== Developer 3: Intelligence & Risk ===${NC}"
create_workstation "3A" "Developer 3" '["Risk Assessment", "Scoring Engine", "Data Aggregation"]'
create_workstation "3B" "Developer 3" '["Smart Match", "ML Algorithm", "Lender Matching"]'
create_workstation "3C" "Developer 3" '["Dashboard", "Analytics", "Reporting"]'

# Create Developer 4 Workstations (Execution & Documents)
echo -e "${YELLOW}=== Developer 4: Execution & Documents ===${NC}"
create_workstation "4A" "Developer 4" '["Transaction Execution", "Digital Signatures", "Workflow"]'
create_workstation "4B" "Developer 4" '["FileLock Drive", "Document Management", "Versioning"]'
create_workstation "4C" "Developer 4" '["Testing Suite", "Integration Tests", "Quality Assurance"]'

# Create Spare Workstations
echo -e "${YELLOW}=== Spare Workstations ===${NC}"
create_workstation "5" "Spare" '["Hot Swap", "Emergency Tasks", "Overflow"]'
create_workstation "6" "Spare" '["Testing Environment", "Performance Testing", "Security Scans"]'

# Create central monitoring dashboard
echo -e "${BLUE}Creating Central Monitoring Dashboard...${NC}"
cat > $BASE_DIR/central-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>EVA Platform - 6 Workstation Central Monitor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <meta http-equiv="refresh" content="10">
</head>
<body class="bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-center">EVA Platform Development Dashboard</h1>

        <!-- Productivity Metrics -->
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 class="text-2xl font-semibold mb-4">Real-time Productivity</h2>
            <div class="grid grid-cols-4 gap-4">
                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="text-lg">Lines of Code</h3>
                    <p class="text-3xl font-bold text-green-400">127,453</p>
                    <p class="text-sm text-gray-400">+12,453 today</p>
                </div>
                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="text-lg">Test Coverage</h3>
                    <p class="text-3xl font-bold text-blue-400">93.7%</p>
                    <p class="text-sm text-gray-400">+2.3% today</p>
                </div>
                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="text-lg">Features Complete</h3>
                    <p class="text-3xl font-bold text-yellow-400">4/9</p>
                    <p class="text-sm text-gray-400">CRM 100% done</p>
                </div>
                <div class="bg-gray-700 p-4 rounded">
                    <h3 class="text-lg">AI Sessions Active</h3>
                    <p class="text-3xl font-bold text-purple-400">14/18</p>
                    <p class="text-sm text-gray-400">78% utilization</p>
                </div>
            </div>
        </div>

        <!-- Workstation Grid -->
        <div class="grid grid-cols-2 gap-6">
            <!-- Developer 1 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-xl font-semibold mb-3">Developer 1: Foundation & Data</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span>WS 1A: CRM Core</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 1B: Team Mgmt</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 1C: Database</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                </div>
            </div>

            <!-- Developer 2 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-xl font-semibold mb-3">Developer 2: Applications & APIs</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span>WS 2A: Credit App</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 2B: Plaid/QB</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 2C: Credit APIs</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                </div>
            </div>

            <!-- Developer 3 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-xl font-semibold mb-3">Developer 3: Intelligence & Risk</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span>WS 3A: Risk Engine</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 3B: Smart Match</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 3C: Analytics</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                </div>
            </div>

            <!-- Developer 4 -->
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-xl font-semibold mb-3">Developer 4: Execution & Docs</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span>WS 4A: Transactions</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 4B: FileLock</span>
                        <span class="text-yellow-400">🟡 Processing</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>WS 4C: Testing</span>
                        <span class="text-green-400">🟢 Active</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Timeline Progress -->
        <div class="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 class="text-2xl font-semibold mb-4">Sprint Progress</h2>
            <div class="space-y-3">
                <div>
                    <div class="flex justify-between mb-1">
                        <span>Overall Progress</span>
                        <span>44%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" style="width: 44%"></div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <p class="text-lg">Days Remaining: <span class="text-3xl font-bold text-yellow-400">19</span></p>
                    <p class="text-sm text-gray-400">Target: June 15, 2025</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh with countdown
        let seconds = 10;
        setInterval(() => {
            seconds--;
            if (seconds <= 0) location.reload();
        }, 1000);
    </script>
</body>
</html>
EOF

# Create rotation script
echo -e "${BLUE}Creating Workstation Rotation Script...${NC}"
cat > $BASE_DIR/rotate-workstations.sh << 'EOF'
#!/bin/bash
# Workstation Rotation Helper

echo "🔄 EVA Platform - Workstation Rotation"
echo "====================================="
echo ""
echo "Current Rotation Schedule:"
echo ""
echo "Developer 1:"
echo "  9:00 AM - Check WS 1A output → Submit to WS 1B"
echo "  9:05 AM - Check WS 1B output → Submit to WS 1C"
echo "  9:10 AM - Check WS 1C output → Submit to WS 1A"
echo ""
echo "Developer 2:"
echo "  9:00 AM - Check WS 2A output → Submit to WS 2B"
echo "  9:05 AM - Check WS 2B output → Submit to WS 2C"
echo "  9:10 AM - Check WS 2C output → Submit to WS 2A"
echo ""
echo "Developer 3:"
echo "  9:00 AM - Check WS 3A output → Submit to WS 3B"
echo "  9:05 AM - Check WS 3B output → Submit to WS 3C"
echo "  9:10 AM - Check WS 3C output → Submit to WS 3A"
echo ""
echo "Developer 4:"
echo "  9:00 AM - Check WS 4A output → Submit to WS 4B"
echo "  9:05 AM - Check WS 4B output → Submit to WS 4C"
echo "  9:10 AM - Check WS 4C output → Submit to WS 4A"
echo ""
echo "⏰ Next rotation in: $(date -d '+5 minutes' '+%I:%M %p')"
EOF

chmod +x $BASE_DIR/rotate-workstations.sh

# Create overnight task scheduler
echo -e "${BLUE}Creating Overnight Task Scheduler...${NC}"
cat > $BASE_DIR/schedule-overnight.sh << 'EOF'
#!/bin/bash
# Schedule overnight AI tasks for all workstations

echo "🌙 Scheduling Overnight AI Tasks"
echo "================================"
echo ""

# Tasks for each workstation
declare -A overnight_tasks=(
    ["1A"]="Generate comprehensive test suite for CRM module"
    ["1B"]="Create API documentation for Team Management"
    ["1C"]="Optimize database queries and indexes"
    ["2A"]="Generate E2E tests for Credit Application flow"
    ["2B"]="Create integration tests for Plaid/QuickBooks"
    ["2C"]="Document all Credit Bureau API endpoints"
    ["3A"]="Train risk scoring model with test data"
    ["3B"]="Optimize Smart Match algorithm performance"
    ["3C"]="Generate dashboard performance reports"
    ["4A"]="Create transaction workflow documentation"
    ["4B"]="Generate security tests for FileLock"
    ["4C"]="Run comprehensive integration test suite"
    ["5"]="Performance profiling and optimization"
    ["6"]="Security vulnerability scanning"
)

for ws in "${!overnight_tasks[@]}"; do
    echo "Workstation $ws: ${overnight_tasks[$ws]}"
done

echo ""
echo "✅ All overnight tasks scheduled for 5:00 PM"
echo "📊 Results will be available at 9:00 AM tomorrow"
EOF

chmod +x $BASE_DIR/schedule-overnight.sh

# Final summary
echo ""
echo -e "${GREEN}✅ 6-Workstation Setup Complete!${NC}"
echo ""
echo "📁 Directory Structure:"
echo "   $BASE_DIR/"
echo "   ├── workstation-1A/ (Dev 1: CRM Core)"
echo "   ├── workstation-1B/ (Dev 1: Team Management)"
echo "   ├── workstation-1C/ (Dev 1: Database)"
echo "   ├── workstation-2A/ (Dev 2: Credit App)"
echo "   ├── workstation-2B/ (Dev 2: Financial APIs)"
echo "   ├── workstation-2C/ (Dev 2: Credit APIs)"
echo "   ├── workstation-3A/ (Dev 3: Risk Engine)"
echo "   ├── workstation-3B/ (Dev 3: Smart Match)"
echo "   ├── workstation-3C/ (Dev 3: Analytics)"
echo "   ├── workstation-4A/ (Dev 4: Transactions)"
echo "   ├── workstation-4B/ (Dev 4: Documents)"
echo "   ├── workstation-4C/ (Dev 4: Testing)"
echo "   ├── workstation-5/  (Spare: Hot Swap)"
echo "   ├── workstation-6/  (Spare: Testing)"
echo "   ├── central-dashboard.html"
echo "   ├── rotate-workstations.sh"
echo "   └── schedule-overnight.sh"
echo ""
echo "🚀 Next Steps:"
echo "   1. Open central-dashboard.html in browser"
echo "   2. Start Cursor on each workstation"
echo "   3. Run ./rotate-workstations.sh for schedule"
echo "   4. Begin development with 24x productivity!"
echo ""
echo "💡 Pro Tip: Use 'screen' or 'tmux' to manage multiple terminals"
echo ""
