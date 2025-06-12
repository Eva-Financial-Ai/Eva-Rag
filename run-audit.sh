#!/bin/bash
# Frontend Audit Tool Runner
#
# This script runs the frontend audit tool as a system admin background process.
# It logs output to a file and can be run from the command line.
#
# Usage:
#   ./run-audit.sh [category]
#
# Categories:
#   all (default)
#   api
#   routing
#   components
#   responsive
#   a11y
#   typescript
#   security
#   demo
#   build
#   performance

# Set up colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="logs/audit-$TIMESTAMP.log"

# Get the audit category from arguments or default to "all"
CATEGORY=${1:-all}

echo -e "${BLUE}=== Starting Frontend Audit (${CATEGORY}) ===${NC}"
echo -e "${YELLOW}Logs will be written to: ${LOG_FILE}${NC}"

# Make sure the audit script is executable
chmod +x scripts/run-frontend-audit.js

# Run the audit script with the specified category and log output
node scripts/run-frontend-audit.js $CATEGORY | tee $LOG_FILE

# Check if the tool ran successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}=== Frontend Audit Completed Successfully ===${NC}"
  echo -e "${GREEN}Check the audit-reports directory for the results.${NC}"
  # Open the latest report if on macOS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    LATEST_REPORT=$(ls -t audit-reports/*.html | head -n 1)
    if [ ! -z "$LATEST_REPORT" ]; then
      echo -e "${GREEN}Opening latest report: $LATEST_REPORT${NC}"
      open "$LATEST_REPORT"
    fi
  fi
else
  echo -e "${RED}=== Frontend Audit Failed ===${NC}"
  echo -e "${RED}Check the log file for details: ${LOG_FILE}${NC}"
fi 