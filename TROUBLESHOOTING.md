# Troubleshooting Guide

This document provides solutions for common issues you might encounter when working with the EVA Platform frontend.

## Table of Contents

1. [Development Environment Setup Issues](#development-environment-setup-issues)
2. [Build and Compilation Errors](#build-and-compilation-errors)
3. [Runtime Errors](#runtime-errors)
4. [Redis Caching Issues](#redis-caching-issues)
5. [Dependency and Package Issues](#dependency-and-package-issues)
6. [Docker-Specific Issues](#docker-specific-issues)
7. [IDE and Tooling Problems](#ide-and-tooling-problems)

## Development Environment Setup Issues

### Node.js Version Mismatch

**Error Message:**

```
Error: The engine "node" is incompatible with this module.
```

**Solution:**
The project requires Node.js 16.x-18.x, with 18.18.0 being the recommended version.

```bash
# Using nvm (recommended)
nvm install 18.18.0
nvm use 18.18.0

# Alternatively, install Node.js 18.18.0 directly
```

If you need to use a different Node.js version, you can bypass the check with:

```bash
# On Mac/Linux
./quick-start.sh

# On Windows
windows-start.bat
```

### Yarn vs NPM Conflicts

**Error Message:**

```
error An unexpected error occurred: "ENOENT: no such file or directory, ..."
```

**Solution:**
If you've switched between Yarn and NPM, clear your node_modules:

```bash
rm -rf node_modules
rm -f yarn.lock package-lock.json

# Then install with your preferred tool
npm install --legacy-peer-deps
# OR
yarn install
```

## Build and Compilation Errors

### ESLint Errors Preventing Build

**Error Message:**

```
ESLint: Error: ...
Compiled with problems:
ERROR in ...
```

**Solution:**
Use one of the ESLint-disabled start scripts:

```bash
npm run start:no-lint
# OR
npm run start:force
```

Alternatively, fix the specific ESLint issues in your code.

### TypeScript Compilation Errors

**Error Message:**

```
TypeScript error: ...
```

**Solution:**

1. Use the force start which ignores TypeScript errors:

   ```bash
   npm run start:force
   ```

2. Fix the type errors in your code:
   - Check for incorrect prop types
   - Ensure imports match exported types
   - Add necessary type declarations

### CSS/SCSS Module Errors

**Error Message:**

```
Error: Cannot find module '*.module.css'
```

**Solution:**

1. Check that the file exists and has the correct extension
2. Make sure PostCSS and tailwind are properly configured
3. Try restarting the development server

## Runtime Errors

### ChunkLoadError: Loading chunk X failed

**Error Message:**

```
ChunkLoadError: Loading chunk vendors-node_modules_prop-types_index_js failed
```

**Solution:**
This often happens with prop-types not loading correctly.

1. Clear your browser cache
2. Run the fix script to install prop-types and add the polyfill:

   ```bash
   # On Mac/Linux
   ./fix-dependencies.sh

   # On Windows
   apply.bat
   ```

3. Start with the force mode:
   ```bash
   npm run start:force
   ```

### React-Error-Boundary Development.js Not Found

**Error Message:**

```
Module build failed: ENOENT: no such file or directory, open ... react-error-boundary.development.js
```

**Solution:**
This indicates a partially-failed installation:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run start:force
```

### React Hook Errors

**Error Message:**

```
React Hook "useX" cannot be called inside a callback/at the top level/etc.
```

**Solution:**

1. Make sure hooks are only called inside React function components
2. Ensure hooks are called in the same order on every render
3. Start with relaxed ESLint settings:
   ```bash
   npm run start:no-lint
   ```

### Empty White Screen

**Symptoms:** App loads but shows a blank white screen with no visible errors.

**Solution:**

1. Check browser console for errors
2. Try running with the error overlay disabled:
   ```bash
   REACT_ERROR_OVERLAY=false npm start
   ```
3. Clear browser cache and local storage

## Redis Caching Issues

### Redis Connection Refused

**Error Message:**

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

1. Ensure Redis server is running:

   ```bash
   # Check if Redis is running
   redis-cli ping

   # Start Redis (macOS with Homebrew)
   brew services start redis

   # Start Redis (Linux)
   sudo systemctl start redis-server

   # Or use Docker
   docker run -d --name redis-eva -p 6379:6379 redis:7-alpine
   ```

2. If Redis is unavailable, the app will automatically fallback to in-memory caching
3. To disable Redis temporarily, set `REACT_APP_REDIS_ENABLED=false` in your .env file

### Redis Authentication Failed

**Error Message:**

```
Error: NOAUTH Authentication required
```

**Solution:**

1. Set the correct password in your environment variables:
   ```bash
   REACT_APP_REDIS_PASSWORD=your-redis-password
   ```
2. Check your Redis server authentication configuration

### Redis Memory Issues

**Error Message:**

```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**

1. Increase Redis memory limit:
   ```bash
   redis-cli CONFIG SET maxmemory 1gb
   ```
2. Configure eviction policy:
   ```bash
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```
3. Reduce cache TTL values in your environment configuration

### Cache Not Working

**Symptoms:** Data is not being cached or retrieved from cache

**Solution:**

1. Check Redis connection:
   ```bash
   node -r ts-node/register src/test-redis-cache.ts
   ```
2. Verify environment variables are set correctly
3. Check browser console for cache-related errors
4. Monitor Redis activity:
   ```bash
   redis-cli monitor
   ```

### ioredis Module Not Found

**Error Message:**

```
Error: Cannot find module 'ioredis'
```

**Solution:**

1. Install Redis dependencies:
   ```bash
   npm install ioredis@5.3.2
   ```
2. Restart the development server

## Dependency and Package Issues

### Peer Dependency Warnings/Errors

**Error Message:**

```
npm WARN ERESOLVE overriding peer dependency...
```

**Solution:**
Use the legacy peer deps flag:

```bash
npm install --legacy-peer-deps
```

Or run the dependency fix script:

```bash
# On Mac/Linux
./fix-dependencies.sh

# On Windows
apply.bat
```

### Missing Dependencies at Runtime

**Error Message:**

```
Cannot find module 'X'
```

**Solution:**

1. Install the missing dependency:
   ```bash
   npm install --save X
   ```
2. Check that the package is listed in package.json
3. Run the dependency fix script to ensure critical dependencies

## Docker-Specific Issues

### Container Fails to Start

**Error Message:**

```
Error: Cannot start container...
```

**Solution:**

1. Check Docker logs for details:
   ```bash
   docker logs eva-frontend
   ```
2. Ensure ports are not in use:
   ```bash
   lsof -i :3000  # Check if port 3000 is in use
   ```
3. Make sure Docker has enough resources allocated

### Hot Reload Not Working in Docker

**Symptom:** Changes to files don't trigger reloads in Docker environment.

**Solution:**

1. Make sure volumes are mounted correctly in docker-compose.yml
2. Check that CHOKIDAR_USEPOLLING=true is set in the environment
3. Try rebuilding the container:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## IDE and Tooling Problems

### VSCode ESLint Extension Errors

**Error Message:**

```
ESLint: Cannot find module 'X'
```

**Solution:**

1. Install dependencies locally:
   ```bash
   npm install
   ```
2. Reload VSCode
3. Check ESLint configuration in VSCode settings

### WebStorm/IntelliJ TypeScript Issues

**Symptom:** IDE shows TypeScript errors but the app compiles fine.

**Solution:**

1. Ensure IntelliJ is using the project's TypeScript version:
   - Settings → Languages & Frameworks → TypeScript
   - Select "Use TypeScript from node_modules directory"
2. Invalidate caches and restart IntelliJ
3. Update to the latest IDE version

## Additional Resources

If you're still encountering issues:

1. Check the [Common Setup Issues](./COMMON-SETUP-ISSUES.md) document
2. Run the appropriate script for your OS:
   - Mac/Linux: `./setup-team-clone.sh`
   - Windows: `run.bat` or `windows-start.bat`
3. Create an issue on the project GitHub repository with:
   - Detailed description of the issue
   - Steps to reproduce
   - Environment information (OS, Node.js version, npm/yarn version)
   - Error logs or screenshots
