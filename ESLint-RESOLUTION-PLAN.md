# ESLint Resolution Plan

This document outlines a comprehensive approach to systematically fix ESLint issues in the codebase without breaking functionality.

## Current Status

Initial audit revealed:
- 885 warnings and 42 errors across the codebase
- Major issue categories:
  - Unused imports and variables
  - React Hook dependency array issues
  - Testing library best practices violations
  - Anonymous default exports
  - Anchor tag accessibility issues

## Phase 1: Foundation & Critical Fixes (Completed)

- [x] Fix hooks in critical utility files (`useApi`, `useApiData`, `useApiQuery`, etc.)
- [x] Update package dependencies to ensure consistent versions
- [x] Create batch fixing script (`fix-eslint-issues.sh`)
- [x] Document comprehensive ESLint resolution plan (this document)

## Phase 2: Core Infrastructure (Priority)

Focus on fixing the most critical parts of the application first:

1. **React Hook Dependency Issues**
   - Prioritize fixing `react-hooks/exhaustive-deps` issues
   - Use `./fix-eslint-issues.sh hooks` to address these issues
   - Test components after fixing to ensure behavior is maintained

2. **Anonymous Default Exports**
   - Convert all anonymous default exports to named exports
   - Use `./fix-eslint-issues.sh exports` to focus on these issues
   - Standardize export patterns across the codebase

3. **Fix Services & Utilities**
   - Fix issues in service files that power core functionality
   - Use batch mode: `./fix-eslint-issues.sh batch`
   - Pay special attention to API services and data utilities

## Phase 3: Component Improvements

Systematically improve React components:

1. **Common Components**
   - Focus on shared components first
   - Remove unused variables and imports
   - Fix accessibility issues (especially anchor tags)

2. **Specialized Components**
   - Address issues in business logic components
   - Group fixes by component category (dashboard, risk, etc.)
   - Test behavior after each group of fixes

3. **Page Components**
   - Fix page-level components last due to complexity
   - Ensure proper prop typing and hook dependencies
   - Validate user flows after fixes

## Phase 4: Testing Improvements

Enhance test quality and compliance:

1. **Fix Testing Library Violations**
   - Replace direct node access with proper queries
   - Update `queryBy*` to `getBy*` where appropriate
   - Separate multiple assertions in `waitFor` callbacks

2. **Test Coverage**
   - Fix missing or broken tests
   - Ensure test coverage of fixed components
   - Add tests for previously untested code paths

## Phase 5: Performance & Optimization

Improve application performance:

1. **Code Splitting**
   - Implement code splitting for large components
   - Use React.lazy and Suspense for route-based splitting
   - Consider dynamic imports for rarely used features

2. **Bundle Size Reduction**
   - Remove unused dependencies and imports
   - Analyze bundle size with webpack-bundle-analyzer
   - Optimize asset loading and delivery

## Prevention Strategy

Implement safeguards to prevent future issues:

1. **Pre-commit Hooks**
   - Configure Husky to run linting before commits
   - Block commits with critical linting errors
   - Allow staged fixes for easier compliance

2. **CI Pipeline Improvements**
   - Add ESLint validation to CI workflow
   - Consider progressive strictness levels
   - Track linting metrics over time

3. **Developer Documentation**
   - Update coding standards documentation
   - Create ESLint rule reference guide
   - Provide examples of common patterns

## Tools and Scripts

1. **fix-eslint-issues.sh** - Main batch script to apply automated fixes
   - Supports different modes: `batch`, `hooks`, `exports`, `unused`
   - Can target specific directories with appropriate warning thresholds

2. **fix-anonymous-exports.sh** - Specialized script to fix anonymous default exports
   - Automatically detects files with anonymous default exports
   - Generates appropriate variable names based on file name and type
   - Supports both object literal exports and instance exports

3. **.husky/pre-commit** - Pre-commit hook to enforce critical rules
   - Ensures new code doesn't introduce critical issues
   - Allows warnings but blocks commits with errors

4. **.github/workflows/lint.yml** - CI integration to track progress
   - Runs ESLint as part of CI pipeline
   - Reports code quality metrics over time

## Implementation Commands

Use the batch fixing script with various options:

```bash
# Fix React Hook dependency issues
./fix-eslint-issues.sh hooks

# Fix anonymous default exports
./fix-eslint-issues.sh exports

# Fix unused variables
./fix-eslint-issues.sh unused

# Fix all issues at once (use with caution)
./fix-eslint-issues.sh all

# Run batch fixes by directory with custom warning limits
./fix-eslint-issues.sh batch

# Check issues without fixing
./fix-eslint-issues.sh check
```

## Progress Tracking

Track ESLint issue resolution over time:

| Date       | Total Warnings | Total Errors | Notes                        |
|------------|----------------|--------------|------------------------------|
| YYYY-MM-DD | 885            | 42           | Initial audit                |
| -          | -              | -            | Hooks & default exports fixed|
| -          | -              | -            | Core utilities fixed         |
| -          | -              | -            | Components fixed             |

## Conclusion

By following this systematic approach, we can gradually improve code quality without disrupting functionality. The plan prioritizes:

1. Critical infrastructure first
2. Core components second
3. Page-level components last
4. Testing improvements throughout
5. Prevention of future issues

Each phase should include thorough testing to ensure no regressions are introduced. 