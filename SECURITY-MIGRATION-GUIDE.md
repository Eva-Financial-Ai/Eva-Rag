# Security Migration Guide: Replacing eval() with Secure Onclick Handler

## 🚨 Security Issue: eval() Usage

The `eval()` function poses serious security risks as highlighted in our recent security analysis. This guide shows how to migrate from dangerous `eval()` calls to our new secure onclick handler.

## 📋 Migration Steps

### 1. Import the Secure Handler

Replace any file that uses `eval()`:

```typescript
// Add this import at the top of your file
import { executeOnclickSafely } from '../utils/secureOnclickHandler';
```

### 2. Replace eval() Calls

#### Before (Dangerous ❌):

```javascript
// This is vulnerable to XSS attacks
const executeOnclick = onclick => {
  eval(onclick); // DANGEROUS!
};
```

#### After (Secure ✅):

```javascript
// Safe, secure execution
const executeOnclick = async onclick => {
  const result = await executeOnclickSafely(onclick);

  if (result.success) {
    console.log(`✅ Executed via ${result.method} method`);
  } else {
    console.error(`❌ Execution failed: ${result.error}`);
  }

  return result.success;
};
```

### 3. Update React Components

#### Before (Dangerous ❌):

```typescript
const NavigationComponent = () => {
  const handleClick = (onclickString: string) => {
    // Dangerous eval usage
    try {
      eval(onclickString);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  return <button onClick={() => handleClick("navigateTo('page')")}>Navigate</button>;
};
```

#### After (Secure ✅):

```typescript
import { executeOnclickSafely } from '../utils/secureOnclickHandler';

const NavigationComponent = () => {
  const handleClick = async (onclickString: string) => {
    const result = await executeOnclickSafely(onclickString);

    if (!result.success) {
      console.error('Navigation failed:', result.error);
    }
  };

  return <button onClick={() => handleClick("navigateTo('page')")}>Navigate</button>;
};
```

## 🔍 Finding eval() Usage in Your Codebase

Use these commands to find potential eval() usage:

```bash
# Find direct eval() calls
grep -r "eval(" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"

# Find potential dynamic code execution
grep -r "new Function" src/ --include="*.ts" --include="*.tsx"

# Find setTimeout/setInterval with strings (also dangerous)
grep -r "setTimeout.*['\"]" src/ --include="*.ts" --include="*.tsx"
```

## 🛡️ Security Benefits

Our new secure onclick handler provides:

### ✅ Input Sanitization

- Removes `javascript:` protocols
- Strips `<script>` tags
- Filters dangerous event handlers

### ✅ Safe Parsing Method

- Validates function names (alphanumeric + underscore only)
- Safely parses parameters without eval()
- Checks function existence before execution

### ✅ DOM-Based Fallback

- Creates isolated temporary elements
- Proper cleanup after execution
- Error handling and recovery

### ✅ Comprehensive Error Handling

- Detailed error reporting
- Multiple execution strategies
- Graceful degradation

## 📖 Supported Onclick Patterns

The secure handler supports these common patterns:

```javascript
// Simple function calls
'refreshPage()';
'closeModal()';

// Functions with string parameters
"navigateTo('dashboard')";
"showAlert('Hello World')";

// Functions with multiple parameters
"updateUser('john', 25, true)";
"createRecord('user', {name: 'John', age: 25})";

// Functions with complex parameters
"processData([1,2,3], {format: 'json'})";
```

## 🚫 Patterns NOT Supported (By Design)

These patterns are intentionally blocked for security:

```javascript
// Script tags (XSS prevention)
"<script>alert('xss')</script>";

// JavaScript protocols
"javascript:alert('xss')";

// Other event handlers
"onclick=alert('xss')";

// Invalid function names
'123invalid()';
'function-with-dashes()';
```

## 🧪 Testing Your Migration

Add these tests to verify your migration:

```typescript
import { executeOnclickSafely } from '../utils/secureOnclickHandler';

describe('Secure Onclick Migration', () => {
  it('should execute valid function calls', async () => {
    // Mock a global function
    (window as any).testFunction = jest.fn();

    const result = await executeOnclickSafely('testFunction("param")');

    expect(result.success).toBe(true);
    expect((window as any).testFunction).toHaveBeenCalledWith('param');
  });

  it('should reject dangerous patterns', async () => {
    const result = await executeOnclickSafely('javascript:alert("xss")');

    expect(result.success).toBe(false);
    expect(result.error).toContain('empty after sanitization');
  });
});
```

## 📋 Checklist

- [ ] Search for all `eval()` usage in codebase
- [ ] Replace each `eval()` call with `executeOnclickSafely()`
- [ ] Update imports to include the secure handler
- [ ] Test all navigation and onclick functionality
- [ ] Add error handling for failed executions
- [ ] Update documentation for team members
- [ ] Run security audit to verify no eval() remains

## 🔗 Additional Resources

- [React XSS Prevention Best Practices](https://dev-academy.com/react-xss/)
- [JavaScript eval Security Best Practices](https://www.codiga.io/blog/javascript-eval-best-practices/)
- [Snyk React Security Guide](https://snyk.io/blog/10-react-security-best-practices/)

## 🆘 Need Help?

If you encounter issues during migration:

1. Check console logs for detailed error messages
2. Verify function names follow naming conventions
3. Test with simple function calls first
4. Use the DOM fallback method for complex cases
5. Reach out to the security team for assistance

---

**Remember**: Security is not optional in financial applications. Every eval() replacement makes our platform more secure! 🛡️
