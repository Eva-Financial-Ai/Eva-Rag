#!/bin/bash

# Fix prop-types chunk loading issue
echo "Fixing prop-types chunk loading issue..."

# Check if prop-types is installed in node_modules
if [ ! -d "./node_modules/prop-types" ]; then
  echo "prop-types not found in node_modules, installing..."
  npm install prop-types --no-save
fi

# Force a clean install of prop-types
echo "Reinstalling prop-types..."
rm -rf ./node_modules/prop-types
npm install prop-types --no-save

# Clear browser cache
echo "Please clear your browser cache before restarting the application"
echo "Done. Please restart your development server with: npm start" 