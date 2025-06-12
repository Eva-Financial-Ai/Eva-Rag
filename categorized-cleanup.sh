#!/bin/bash

echo "Categorizing backed up components based on analysis..."

# Define source and destination directories
SOURCE_DIR="./unused-components-backup"
DEST_DIR="./categorized-components"

# Create category directories
mkdir -p "$DEST_DIR/1-likely-unused"
mkdir -p "$DEST_DIR/2-potentially-needed"
mkdir -p "$DEST_DIR/3-development"

# Category 1: Likely Genuinely Unused
cat << EOF > "$DEST_DIR/1-likely-unused/README.md"
# Likely Genuinely Unused Components

These components appear to be genuinely unused in the application and are likely safe to remove.
EOF

# Category 2: Potentially Needed
cat << EOF > "$DEST_DIR/2-potentially-needed/README.md"
# Potentially Needed Components

These components might be relevant to the system but aren't properly wired up. Review each component before removal.
EOF

# Category 3: Development/Demo Components
cat << EOF > "$DEST_DIR/3-development/README.md"
# Development and Demo Components

These components are for development, testing, or demonstration purposes. Consider moving to a dev-only directory.
EOF

# Function to categorize files
categorize_file() {
    local file="$1"
    local filename=$(basename "$file")
    local directory=$(dirname "$file" | sed "s|^$SOURCE_DIR/||")
    
    # Category 1: Likely Genuinely Unused
    if [[ "$filename" == *"ThirdPartyAuthModal"* || 
          "$filename" == *"DocumentUploadModal"* || 
          "$filename" == *"PlaidLinkModal"* || 
          "$filename" == *"StripeConnectModal"* || 
          "$filename" == *"MyPortfolioWallet"* || 
          "$filename" == *"PyPortfolioWallet"* || 
          "$filename" == *"CreditAnalysisChatInterface"* || 
          "$filename" == *"AIChatAdvisor"* || 
          "$filename" == *"BlockchainTransactionViewer"* || 
          "$filename" == *"BlockchainButton"* || 
          "$filename" == *"PortfolioDropdown"* || 
          "$filename" == *"UniCurrency"* || 
          "$filename" == *"FundingTrendsChart"* || 
          "$filename" == *"MetricCard"* || 
          "$filename" == *"DealProgressCard"* ]]; then
        
        mkdir -p "$DEST_DIR/1-likely-unused/$directory"
        cp "$file" "$DEST_DIR/1-likely-unused/$directory/"
        echo "Categorized as likely unused: $directory/$filename"
        
    # Category 3: Development/Demo Components
    elif [[ "$filename" == *"RouterSelector"* || 
            "$filename" == *"PQCryptographyProvider"* || 
            "$filename" == *"ResponsiveTestingPanel"* || 
            "$filename" == *"SideNavigationTest"* || 
            "$filename" == *"PerformanceMonitor"* || 
            "$filename" == *"DemoModeSwitcherPanel"* || 
            "$filename" == *"DemoCreditsManager"* || 
            "$filename" == *"DemoCreditsManagerFix"* || 
            "$filename" == *"RiskReportDevTools"* || 
            "$filename" == *"UserStoriesView"* || 
            "$filename" == *"EVAAssistantWithCustomAgents"* || 
            "$filename" == *"SmartMatchSkeleton"* || 
            "$filename" == *"StructureEditorSkeleton"* || 
            "$directory" == *"dev"* ]]; then
        
        mkdir -p "$DEST_DIR/3-development/$directory"
        cp "$file" "$DEST_DIR/3-development/$directory/"
        echo "Categorized as development component: $directory/$filename"
        
    # Category 2: Potentially Needed But Not Properly Wired Up
    else
        mkdir -p "$DEST_DIR/2-potentially-needed/$directory"
        cp "$file" "$DEST_DIR/2-potentially-needed/$directory/"
        echo "Categorized as potentially needed: $directory/$filename"
    fi
}

# Find all backed up component files and categorize them
find "$SOURCE_DIR" -type f -name "*.tsx" -o -name "*.jsx" | while read -r file; do
    categorize_file "$file"
done

echo "Categorization complete. Files organized in the $DEST_DIR directory."
echo "Please review each category before proceeding with cleanup." 