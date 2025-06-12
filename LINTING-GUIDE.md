# ESLint Fixing Guide

A practical guide for resolving ESLint issues in the codebase without breaking functionality.

## Quick Reference

| Issue Type | Example | Fix Strategy |
|------------|---------|--------------|
| Unused imports | `import X from 'Y'` but X is never used | Remove the import |
| Unused variables | `const x = 5` but x is never used | Remove the variable or prefix with underscore `_x` |
| React Hook dependencies | Missing dependencies in useEffect | Add all required dependencies or use useCallback/useMemo |
| Anonymous default exports | `export default { ... }` | Assign to variable first: `const x = {...}; export default x` |
| Anchor tag issues | `<a onClick={...}>` without href | Use `<button>` or add proper href value |

## Running the ESLint Fixer

We've created a tool to help fix ESLint issues in batches:

```bash
# Fix a specific type of issue across the codebase
./fix-eslint-issues.sh hooks    # Fix React Hook dependencies
./fix-eslint-issues.sh exports  # Fix anonymous exports
./fix-eslint-issues.sh unused   # Fix unused variables/imports

# Fix issues by directory with appropriate warning limits
./fix-eslint-issues.sh batch

# Check issues without fixing
./fix-eslint-issues.sh check
```

## React Hook Dependency Issues

### Problem:
```tsx
// Missing dependencies in useEffect
useEffect(() => {
  doSomethingWith(prop1, prop2);
}, []); // prop1 and prop2 are missing in dependencies
```

### Solution:
```tsx
// Add all dependencies
useEffect(() => {
  doSomethingWith(prop1, prop2);
}, [prop1, prop2]);

// OR use useCallback for functions that would otherwise cause infinite loops
const handleChange = useCallback(() => {
  doSomethingWith(prop1, prop2);
}, [prop1, prop2]);

useEffect(() => {
  handleChange();
}, [handleChange]);
```

## Unused Imports/Variables

### Problem:
```tsx
import React, { useState, useEffect, useMemo } from 'react';
// ... but useMemo is never used

function Component() {
  const [state, setState] = useState('');
  const unused = 'never used';
  // ...
}
```

### Solution:
```tsx
import React, { useState, useEffect } from 'react';
// Removed useMemo

function Component() {
  const [state, setState] = useState('');
  // Removed unused variable
  // ...
}
```

## Anonymous Default Exports

### Problem:
```tsx
export default {
  method1,
  method2,
  // ...
};
```

### Solution:
```tsx
const moduleExports = {
  method1,
  method2,
  // ...
};

export default moduleExports;
```

## Testing Library Best Practices

### Problem:
```tsx
// Direct node access
expect(screen.getByTestId('element').textContent).toBe('text');

// Multiple assertions in waitFor
await waitFor(() => {
  expect(something).toBe(true);
  expect(somethingElse).toBe(false);
});

// Using queryBy for elements that should exist
expect(queryByText('element')).toBeInTheDocument();
```

### Solution:
```tsx
// Use Testing Library queries and matchers
expect(screen.getByTestId('element')).toHaveTextContent('text');

// Separate assertions or use findBy queries
await waitFor(() => expect(something).toBe(true));
await waitFor(() => expect(somethingElse).toBe(false));
// OR
expect(await screen.findByText('text')).toBeInTheDocument();

// Use getBy for elements that should exist
expect(getByText('element')).toBeInTheDocument();
```

## React Component Optimization

### Pattern to Follow

```tsx
// Extract complex objects outside of render functions
const options = useMemo(() => ({
  value1: complexCalculation(props.data),
  value2: anotherCalculation(props.data),
}), [props.data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomethingWith(props.value);
}, [props.value]);

// Memoize expensive calculations
const processedData = useMemo(() => {
  return props.items.map(item => complexProcess(item));
}, [props.items]);
```

## Handling Anchor Tags

### Problem:
```tsx
<a onClick={handleClick} className="btn">
  Click me
</a>
```

### Solution:
```tsx
// For navigation links:
<a href="/some-path" className="btn">
  Navigate
</a>

// For actions that don't navigate:
<button onClick={handleClick} className="btn">
  Click me
</button>

// If you must use an anchor for styling reasons:
<a href="#" onClick={(e) => { 
  e.preventDefault(); 
  handleClick(); 
}} className="btn">
  Click me
</a>
```

## Troubleshooting

### Infinite Renders

If fixing a React Hook dependency introduces an infinite loop:

1. Check if a function is being recreated on every render
2. Move the function inside the useEffect or use useCallback
3. For objects/arrays, use useMemo to prevent recreation

### Breaking Changes After Fixes

If functionality breaks after linting fixes:

1. Check if you've removed any essential code
2. Verify that all dependencies are correctly included
3. Test the specific feature that was modified
4. Consider rolling back changes to that specific component if needed

## Getting Help

If you're stuck on a specific linting issue:

1. Reference the ESLint rules documentation
2. Check our common patterns in `/src/hooks` and `/src/components/common`
3. Ask for help in the #dev-frontend channel 