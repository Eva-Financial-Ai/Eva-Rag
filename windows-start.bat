@echo off
echo ========================================
echo   EVA Platform Windows Quick Start
echo ========================================
echo.

echo Setting up environment variables...
set DISABLE_ESLINT_PLUGIN=true
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set FAST_REFRESH=true
set REACT_FAST_REFRESH=true
set CHOKIDAR_USEPOLLING=true
set GENERATE_SOURCEMAP=false
set REACT_APP_ENABLE_MOCKS=true

echo Stopping any running Node processes...
taskkill /f /im node.exe >nul 2>&1

echo Starting the application with compatibility fixes...
echo Press Ctrl+C to stop the application
echo.
npx react-scripts start 