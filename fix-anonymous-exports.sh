#!/bin/bash

# fix-anonymous-exports.sh
# Script to find and fix anonymous default exports in the codebase

echo "Searching for anonymous default exports..."

# Find files with anonymous default exports
FILES_WITH_ANONYMOUS_EXPORTS=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "export default \(.*\)\|export default {" src/ | grep -v "export default \w*;" | cut -d: -f1 | uniq)

if [ -z "$FILES_WITH_ANONYMOUS_EXPORTS" ]; then
  echo "No files with anonymous default exports found."
  exit 0
fi

echo "Found files with anonymous default exports:"
echo "$FILES_WITH_ANONYMOUS_EXPORTS" | sed 's/^/  /'
echo ""

read -p "Do you want to attempt to automatically fix these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Function to generate a variable name from file name
generate_var_name() {
  local file=$1
  local base_name=$(basename "$file" | sed 's/\.[^.]*$//')
  
  # Convert to camelCase
  local var_name=$(echo "$base_name" | sed -E 's/([A-Z])/_\L\1/g' | sed 's/^_//' | sed -E 's/(^|_)([a-z])/\U\2/g' | sed 's/^./\L&/')
  
  # Add suffix based on type
  if [[ "$file" == *Service* ]]; then
    var_name="${var_name}Service"
  elif [[ "$file" == *Util* ]]; then
    var_name="${var_name}Utils"
  elif [[ "$file" == *Helper* ]]; then
    var_name="${var_name}Helper"
  elif [[ "$file" == *Provider* ]]; then
    var_name="${var_name}Provider"
  fi
  
  echo "$var_name"
}

# Process each file
for file in $FILES_WITH_ANONYMOUS_EXPORTS; do
  echo "Processing $file..."
  
  # Generate appropriate variable name
  var_name=$(generate_var_name "$file")
  
  # Check if file exports an object literal
  if grep -q "export default {" "$file"; then
    echo "  Fixing object literal export in $file with variable name: $var_name"
    sed -i '' -E "s/export default \{/const $var_name = \{/g" "$file"
    echo -e "\n// Export the service object\nexport default $var_name;" >> "$file"
  
  # Check if file exports a new instance
  elif grep -q "export default new " "$file"; then
    echo "  Fixing instance export in $file with variable name: $var_name"
    class_name=$(grep "export default new " "$file" | sed -E "s/export default new ([a-zA-Z0-9_]+).*/\1/")
    sed -i '' -E "s/export default new $class_name(.*)/\/\/ Create a singleton instance\nconst $var_name = new $class_name\1\n\nexport default $var_name;/g" "$file"
  
  # Handle other cases
  else
    echo "  Unable to automatically fix $file. Pattern not recognized."
    echo "  Please fix manually. You might use: const $var_name = ... and export default $var_name;"
  fi
done

echo "Done processing files."
echo "Please review the changes to ensure they are correct."
echo "Run ESLint to verify that the errors have been fixed." 