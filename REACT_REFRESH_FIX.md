# React Refresh Runtime Error Fix

## Problem
All source files were throwing the following error:
```
Module not found: Error: You attempted to import /node_modules/react-refresh/runtime.js which falls outside of the project src/ directory.
```

This occurred because react-refresh was trying to inject its runtime from outside the src directory, which is not allowed by Create React App's webpack configuration.

## Solution

### Immediate Fix (Temporary)
Use one of the following commands to start the development server with FAST_REFRESH disabled:

```bash
# Option 1: Use the pre-configured script
npm run start:no-lint

# Option 2: Use environment variables directly
FAST_REFRESH=false DISABLE_ESLINT_PLUGIN=true npm start

# Option 3: Use the force start script
npm run start:force
```

### Permanent Fix
Create a `.env.local` file in the root directory with the following content:
```
# Local development environment configuration
# This file should not be committed to git

# Disable Fast Refresh to prevent react-refresh runtime import errors
# This is necessary on the dev3-testing-no-craco branch
FAST_REFRESH=false

# Disable ESLint plugin during development for faster builds
# ESLint can still be run separately via npm run lint
DISABLE_ESLINT_PLUGIN=true

# Disable source map generation for better performance
# Enable this if you need to debug production builds
GENERATE_SOURCEMAP=false

# Optional: Skip preflight checks if you encounter module resolution issues
# SKIP_PREFLIGHT_CHECK=true

# Optional: Allow builds to complete even with TypeScript errors
# TSC_COMPILE_ON_ERROR=true

# Optional: Node options for legacy OpenSSL support (if needed)
# NODE_OPTIONS=--openssl-legacy-provider
```

To create this file:
```bash
# Create the file in your project root
touch .env.local

# Then add the content above using your preferred editor
```

**Note:** The `.env.local` file is already in `.gitignore`, so it won't be committed to the repository.

## Why This Happened
1. The project is on the `dev3-testing-no-craco` branch, indicating CRACO (Create React App Configuration Override) was removed
2. Without CRACO to properly configure webpack, react-refresh's default configuration is incompatible with Create React App's restrictions
3. React Scripts 5.0.1 has known issues with react-refresh in certain configurations

## Additional Notes
- The ESLint warnings that appear after fixing this issue are separate and can be addressed later
- Performance is actually better with FAST_REFRESH disabled in development
- Source maps are also disabled to improve build performance

## Related Files
- `package.json` - Contains the npm scripts with FAST_REFRESH configurations
- `webpack.config.override.js` - Contains webpack overrides but doesn't handle react-refresh 