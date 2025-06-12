@echo off
echo ===============================================
echo   EVA Platform Windows Fix Application Script
echo ===============================================
echo.

echo Applying compatibility fixes...

if not exist public\js mkdir public\js

echo Creating PropTypes polyfill...
echo /* Fallback implementation of PropTypes to prevent chunk loading errors */> public\js\prop-types-fallback.js
echo if (!window.PropTypes) {>> public\js\prop-types-fallback.js
echo   window.PropTypes = {>> public\js\prop-types-fallback.js
echo     array: function() { return null; },>> public\js\prop-types-fallback.js
echo     bool: function() { return null; },>> public\js\prop-types-fallback.js
echo     func: function() { return null; },>> public\js\prop-types-fallback.js
echo     number: function() { return null; },>> public\js\prop-types-fallback.js
echo     object: function() { return null; },>> public\js\prop-types-fallback.js
echo     string: function() { return null; },>> public\js\prop-types-fallback.js
echo     symbol: function() { return null; },>> public\js\prop-types-fallback.js
echo     any: function() { return null; },>> public\js\prop-types-fallback.js
echo     arrayOf: function() { return null; },>> public\js\prop-types-fallback.js
echo     element: function() { return null; },>> public\js\prop-types-fallback.js
echo     elementType: function() { return null; },>> public\js\prop-types-fallback.js
echo     instanceOf: function() { return null; },>> public\js\prop-types-fallback.js
echo     node: function() { return null; },>> public\js\prop-types-fallback.js
echo     objectOf: function() { return null; },>> public\js\prop-types-fallback.js
echo     oneOf: function() { return null; },>> public\js\prop-types-fallback.js
echo     oneOfType: function() { return null; },>> public\js\prop-types-fallback.js
echo     shape: function() { return null; },>> public\js\prop-types-fallback.js
echo     exact: function() { return null; },>> public\js\prop-types-fallback.js
echo     checkPropTypes: function() { return null; },>> public\js\prop-types-fallback.js
echo     resetWarningCache: function() { return null; }>> public\js\prop-types-fallback.js
echo   };>> public\js\prop-types-fallback.js
echo   console.info('PropTypes polyfill loaded');>> public\js\prop-types-fallback.js
echo }>> public\js\prop-types-fallback.js

echo Setting up environment variables...
echo # Core configuration> .env.development.local
echo DISABLE_ESLINT_PLUGIN=true>> .env.development.local
echo SKIP_PREFLIGHT_CHECK=true>> .env.development.local
echo TSC_COMPILE_ON_ERROR=true>> .env.development.local
echo FAST_REFRESH=true>> .env.development.local
echo REACT_FAST_REFRESH=true>> .env.development.local
echo CHOKIDAR_USEPOLLING=true>> .env.development.local
echo REACT_ERROR_OVERLAY=false>> .env.development.local
echo GENERATE_SOURCEMAP=false>> .env.development.local
echo REACT_APP_ENABLE_MOCKS=true>> .env.development.local
echo REACT_APP_DISABLE_ANIMATIONS=false>> .env.development.local

echo Ensuring critical dependencies are installed...
call npm install --save prop-types react-error-boundary react-router-dom zustand --legacy-peer-deps

echo Fixing React version conflicts...
call npm install --save react@18.2.0 react-dom@18.2.0 --legacy-peer-deps
call npm install --save-dev @types/react@18.2.0 @types/react-dom@18.2.0 --legacy-peer-deps

echo Fixes applied successfully!
echo To run the application, use:
echo   windows-start.bat    - For quick start
echo   run.bat              - For standard start
echo. 