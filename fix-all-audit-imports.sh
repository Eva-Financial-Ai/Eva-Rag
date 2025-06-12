#\!/bin/bash

echo "🔧 Fixing all auditLogger imports..."

# Create a temporary file to track fixed files
FIXED_FILES=$(mktemp)

# Function to calculate correct relative path
get_relative_path() {
    local from_file=$1
    local to_file="src/utils/auditLogger"
    
    # Get directory of the from file
    local from_dir=$(dirname "$from_file")
    
    # Calculate relative path
    local relative_path=$(python3 -c "
import os
from_dir = '$from_dir'
to_file = '$to_file'
rel_path = os.path.relpath(to_file, from_dir)
print(rel_path)
")
    
    echo "$relative_path"
}

# Find all files with auditLogger imports
find src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    # Skip the auditLogger file itself
    if [[ "$file" == "src/utils/auditLogger.ts" ]]; then
        continue
    fi
    
    # Check if file has auditLogger import
    if grep -q "from.*[\"'].*utils/auditLogger" "$file"; then
        echo "Processing: $file"
        
        # Get correct relative path
        rel_path=$(get_relative_path "$file")
        
        # Create backup
        cp "$file" "$file.bak"
        
        # Fix imports using multiple patterns
        sed -i '' "s|from [\"']\(\.\./\)*utils/auditLogger[\"']|from '$rel_path'|g" "$file"
        sed -i '' "s|from [\"']\./auditLogger[\"']|from '$rel_path'|g" "$file"
        
        # Check if changes were made
        if \! diff -q "$file" "$file.bak" > /dev/null; then
            echo "  ✓ Fixed import path to: $rel_path"
            echo "$file" >> "$FIXED_FILES"
            rm "$file.bak"
        else
            rm "$file.bak"
        fi
    fi
done

# Count fixed files
FIXED_COUNT=$(wc -l < "$FIXED_FILES")
rm "$FIXED_FILES"

echo "✅ Fixed $FIXED_COUNT files\!"
