#!/bin/bash

echo "🚀 Executing All Fixes"
echo "====================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Execute each fix script in order
for i in {01..09}; do
    script="$SCRIPT_DIR/${i}_apply_*.sh"
    if [ -f $script ]; then
        echo -e "\n▶️  Executing: $(basename $script)"
        bash $script
    fi
done

echo -e "\n✅ All fixes have been applied!"
echo "Please review the changes and run tests to ensure everything works correctly."
