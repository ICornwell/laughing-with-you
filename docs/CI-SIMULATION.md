# Simulating CI Environment Locally (Node.js 18+)

This document explains how to set up a local environment that closely mimics the CI environment for testing purposes. This helps identify and fix issues that only manifest in CI but not in local development.

## Node.js Compatibility

The laughing-with-you library requires **Node.js 18 or higher**. This is because:

1. AsyncLocalStorage features have stabilized in Node.js 18+
2. Modern JavaScript features like top-level await are used throughout
3. Performance and security improvements in Node.js 18+ benefit our testing tools

All CI simulation tools are designed to work specifically with Node.js 18+ and will fail gracefully if run on older versions.

## Why Simulate CI?

Even with modern Node.js versions, CI environments differ from local development in several ways:
- Clean/minimal environment variables
- Process isolation patterns
- Permission restrictions
- Different OS or container environment
- Multiple test worker processes

## Quick Start

To diagnose and fix CI-only issues:

```bash
# Step 1: Run the simple CI simulation (recommended primary approach)
npm run test:ci:simple

# Step 2: Run the enhanced AsyncLocalStorage diagnostics
npm run test:als-diagnostics

# Step 3: For detailed AsyncLocalStorage debugging
npm run test:als-debug
npm run test:als-trace  # Traces AsyncLocalStorage initialization

# Step 4: Debug specific problem tests
npm run test:problem-tests

# Step 5: Try with Docker for full environment isolation
npm run test:docker
```

### Diagnostics Reports

The diagnostics tools create reports in the `logs/` directory with timestamps:

- `als-diag-[timestamp].log`: Comprehensive AsyncLocalStorage compatibility report
- `als-init-trace.log`: Trace of AsyncLocalStorage initialization process
- `als-debug.log`: Debug information from failed AsyncLocalStorage operations

These logs help identify patterns that might cause issues in CI environments.

## Available Options

This project provides several methods to simulate CI environments:

### 1. CI Simulation Script

Run tests with CI-like settings:

```bash
# Run both Jest and Vitest tests
npm run test:ci

# Run only Jest tests
npm run test:ci:jest

# Run only Vitest tests
npm run test:ci:vitest
```

This approach:
- Sets `CI=true` and `NODE_ENV=test`
- Runs tests with stricter Node.js options
- Uses similar test isolation patterns as CI
- Clears module caches

### 2. Docker-based CI Simulation

For the most accurate CI simulation:

```bash
npm run test:docker
```

This approach:
- Creates a clean Docker container
- Uses Node.js 18 (same as in CI)
- Runs tests in a completely isolated environment

### 3. AsyncLocalStorage Diagnostics

To diagnose AsyncLocalStorage behavior differences:

```bash
npm run test:als-diagnostics
```

## Test Patterns for CI Compatibility

When writing tests, follow these patterns to ensure they work in CI:

1. **Initialize AsyncLocalStorage properly**:
   ```javascript
   // Don't assume ALS initializes the same way in all environments
   // Use defensive initialization with fallbacks
   try {
     ensureALSInitialized(initialDeps);
   } catch (error) {
     // Use fallback mechanism
   }
   ```

2. **Handle different store structures**:
   ```javascript
   // Handle both Map and Object storage formats
   if (store instanceof Map) {
     return store.get('dependencies') || {};
   } else if (typeof store === 'object') {
     return store.dependencies || store || {};
   }
   ```

3. **Clean up between tests**:
   ```javascript
   afterEach(() => {
     // Clean up ALS to prevent test contamination
     clearAllLocalDeps();
   });
   ```

4. **Use test wrapper functions**:
   ```javascript
   // For Jest:
   itWithLocalDeps('test name', () => {
     // Test code with proper ALS context
   });
   
   // For Vitest:
   itWithLocalDeps('test name', () => {
     // Test code with proper ALS context
   });
   ```

## Common CI-Only Issues

### 1. AsyncLocalStorage Differences

AsyncLocalStorage can behave differently across environments due to:

- **Node.js version differences**: Implementation details changed between Node.js 16, 18, and 20
- **Initialization timing**: When tests run in parallel, ALS initialization may happen in different orders
- **Store structure handling**: Some environments handle Map objects differently than plain objects
- **Object immutability**: In some CI environments, certain objects may be more immutable than in local development

Robust handling includes:
```javascript
// Always check if the store exists first
const store = als.getStore();
if (!store) {
  // Initialize with fallbacks
  try {
    als.enterWith(new Map([['key', 'value']]));
  } catch (e) {
    // Fallback to plain object
    als.enterWith({ key: 'value' });
  }
}
```

### 2. Built-In Object Differences

- **Read-only built-ins**: Some properties that can be modified locally are read-only in CI
- **Performance API limitations**: `performance.now()` might be read-only or have different precision
- **Browser APIs**: APIs like `localStorage` might not be available or behave differently

### 3. Execution Environment Differences

- **Worker isolation**: Tests running in parallel workers may have initialization timing issues
- **Environment variables**: Different CI systems set different environment variables
- **File system permissions**: CI may have stricter filesystem permissions
- **Memory constraints**: CI environments often have lower memory limits than development machines

## Debugging CI Issues

When a test fails in CI but passes locally:

1. Run with the Docker simulation first
2. Check for environment variable dependencies
3. Run the ALS diagnostics to identify differences
4. Add more logging in the failing tests
5. Run tests in sequence rather than parallel

## TypeScript Support for Testing Utilities

All testing utilities now include TypeScript type definitions for better IDE integration and type checking:

```typescript
// Example: Using the robust AsyncLocalStorage utilities with TypeScript
import { 
  createRobustALS, 
  runWithRobustALS, 
  getDepsRobustly 
} from '../test/testUtils/robust-als';

// Full type checking for parameters and return values
const als = createRobustALS();
await runWithRobustALS({ key: 'value' }, async () => {
  const deps = getDepsRobustly();
  // deps is typed as Record<string, any>
});
```

The included type definitions provide:
- Parameter and return type information
- Proper function overloads for improved IntelliSense
- Documentation comments that appear in tooltips

## Further Reading

- [CI Quick Reference](CI-QUICKREF.md): Short reference guide for CI testing
- [Jest Documentation](https://jestjs.io/docs/configuration): Jest configuration options
- [Vitest Documentation](https://vitest.dev/guide/): Vitest guide and API reference
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#class-asynclocalstorage): Official AsyncLocalStorage documentation
