@echo off
echo ===============================================
echo   EVA Platform Windows Standard Run Script
echo ===============================================
echo.

if not exist .env.development.local (
  echo Creating environment configuration...
  echo DISABLE_ESLINT_PLUGIN=true>.env.development.local
  echo SKIP_PREFLIGHT_CHECK=true>>.env.development.local
  echo TSC_COMPILE_ON_ERROR=true>>.env.development.local
  echo FAST_REFRESH=true>>.env.development.local
  echo REACT_APP_ENABLE_MOCKS=true>>.env.development.local
)

echo Checking for npm installation...
where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo Error: npm is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

echo Checking node modules...
if not exist node_modules (
  echo Installing dependencies (this may take a while)...
  npm install --legacy-peer-deps
) else (
  echo Node modules found, skipping installation.
)

echo Starting application...
echo.
npm run start:no-lint 