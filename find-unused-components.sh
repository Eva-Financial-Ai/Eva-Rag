#!/bin/bash

echo "Searching for potentially unused component files..."

# Directory to search in
SEARCH_DIR="src/components"

# Output file
OUTPUT_FILE="unused-component-files.txt"

# Create/clear output file
> $OUTPUT_FILE

# Function to check if a file is imported anywhere
function is_imported() {
    local file_basename=$(basename $1 .tsx)
    local file_basename_no_ext=${file_basename%.*}
    
    # Skip index files
    if [[ "$file_basename" == "index.ts" || "$file_basename" == "index.tsx" ]]; then
        return 0
    fi
    
    # Count imports of this component in other files
    local import_count=$(grep -r "import.*${file_basename_no_ext}" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | wc -l)
    
    # Also check for dynamic imports
    local dynamic_import_count=$(grep -r "import(.*${file_basename_no_ext}" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" src/ | wc -l)
    
    # Count JSX usage like <ComponentName
    local jsx_count=$(grep -r "<${file_basename_no_ext}" --include="*.tsx" --include="*.jsx" src/ | wc -l)
    
    local total_count=$((import_count + dynamic_import_count + jsx_count))
    
    if [[ $total_count -le 1 ]]; then
        # If count is 1 or 0, it might be only self-reference
        return 1
    else
        return 0
    fi
}

# Find all component files
for file in $(find $SEARCH_DIR -name "*.tsx" -o -name "*.jsx"); do
    if ! is_imported "$file"; then
        # Check if the file defines a component
        if grep -q "function\|const.*=.*=>\|export default\|extends React" "$file"; then
            echo "Potentially unused: $file" >> $OUTPUT_FILE
        fi
    fi
done

echo "Found $(wc -l < $OUTPUT_FILE) potentially unused component files."
echo "Results saved to $OUTPUT_FILE" 