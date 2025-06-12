#!/bin/bash

echo "Fixing chunk loading issues..."
echo "==============================="

# Check if development server is running
if ! lsof -i :3000 | grep -q LISTEN; then
    echo "❌ Development server is not running on port 3000"
    echo "Starting development server..."
    npm start &
    echo "✅ Development server starting. Please wait a moment and refresh your browser."
else
    echo "✅ Development server is running on port 3000"
fi

echo ""
echo "Troubleshooting steps:"
echo "1. Clear your browser cache:"
echo "   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Or open DevTools → Network tab → Check 'Disable cache'"
echo ""
echo "2. If the error persists, try:"
echo "   - Stop the server (Ctrl+C)"
echo "   - Delete node_modules/.cache folder: rm -rf node_modules/.cache"
echo "   - Restart the server: npm start"
echo ""
echo "3. Check for build errors in the terminal where npm start is running"
echo ""
echo "4. If using a proxy or VPN, try disabling it temporarily"
echo ""
echo "5. As a last resort:"
echo "   - Stop the server"
echo "   - Run: rm -rf node_modules package-lock.json"
echo "   - Run: npm install"
echo "   - Run: npm start"

# Check if DealStructuring page exists
if [ -f "src/pages/DealStructuring.tsx" ]; then
    echo ""
    echo "✅ DealStructuring.tsx file exists"

    # Check for default export
    if grep -q "export default DealStructuring" src/pages/DealStructuring.tsx; then
        echo "✅ DealStructuring has a default export"
    else
        echo "❌ DealStructuring might be missing a default export"
    fi
else
    echo "❌ DealStructuring.tsx file not found!"
fi

# Check webpack config
if [ -f "craco.config.js" ] || [ -f "webpack.config.js" ]; then
    echo "✅ Custom webpack configuration found"
else
    echo "ℹ️  Using default Create React App webpack configuration"
fi

echo ""
echo "The development server should now be running at http://localhost:3000"
echo "If you still see chunk loading errors, try the troubleshooting steps above."
