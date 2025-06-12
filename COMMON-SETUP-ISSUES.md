# Common Setup Issues and Solutions

## Overview

This document outlines common issues team members encounter when cloning the repository from the dev branch and how our `setup-team-clone.sh` script addresses them.

## Common Issues

### 1. ESLint Errors Preventing Start

**Symptoms:**
- Error messages about ESLint rules in the terminal
- The development server fails to start due to ESLint errors
- Messages about hooks rules violations

**Root Causes:**
- ESLint configuration is too strict for development
- Some components have legitimate rule violations that need refactoring
- React Hooks dependencies are incomplete in many components

**Solution in Script:**
- Creates a more lenient `.eslintrc.local.js` for development
- Adds problematic files to `.eslintignore`
- Sets `DISABLE_ESLINT_PLUGIN=true` in environment variables

### 2. Dependency Conflicts

**Symptoms:**
- Peer dependency warnings
- Error messages about incompatible versions of React
- Build errors related to missing dependencies

**Root Causes:**
- Version mismatches between React packages
- Transitive dependencies with incompatible versions
- Package-lock.json conflicts

**Solution in Script:**
- Cleans npm cache and removes node_modules
- Reinstalls React and React DOM with specific versions
- Uses `--legacy-peer-deps` flag to bypass dependency conflicts

### 3. Permission Issues

**Symptoms:**
- EACCES errors during npm operations
- Issues with file access in node_modules
- Failures when trying to install or update packages

**Root Causes:**
- Incorrect file permissions on node_modules
- Previous installations with different user permissions

**Solution in Script:**
- Fixes permissions on node_modules directory

### 4. Environment Configuration

**Symptoms:**
- Missing environment variables
- Build validation failures
- Preflight check failures

**Root Causes:**
- Missing .env files
- Environment-specific configuration not set up

**Solution in Script:**
- Creates `.env.development.local` with appropriate settings
- Sets `SKIP_PREFLIGHT_CHECK=true` to bypass strict checks

## Manual Resolution Steps

If you need to manually resolve these issues without using the script:

### For ESLint Issues:

```bash
# Create a local ESLint config
echo 'module.exports = {
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}' > .eslintrc.local.js

# Create environment variable to disable ESLint during development
echo 'DISABLE_ESLINT_PLUGIN=true' > .env.development.local
```

### For Dependency Issues:

```bash
# Clean installation
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

## Permanent Fixes in Progress

The development team is working on permanent fixes for these issues:

1. Refactoring components with hooks rule violations
2. Updating dependency specifications in package.json
3. Implementing proper ESLint configuration that works for all environments
4. Documenting proper environment setup procedures

If you encounter issues not addressed by the setup script, please report them to the development team. 