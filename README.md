# Laughing With You

All jesting aside, we're not mocking, we're laughing with you, not at you.

A lightweight testing utility library that helps with dependency injection, mocking, and testing infrastructure for modern JavaScript applications. Works seamlessly with both Jest and Vitest.

It started with a /very/ light weight DI approach for dependency substitution that uses async local storage to allow async (or subsequent sync) code flows to share a dependency substitution set indepentent of others. It uses javascript Proxy to create a delegation wrapper, with automatic fall-back to the original dependency where no substitution is provided.

Is this better or more useful than jest.mock or vi.mock? Sometimes - these mocking frameworks are powerful and comprehensive, and sometimes more than you need, and can be tricky with node module caching and order of imports / requires, working out issues with 'surprise' shared resources across tests can be lengthy and frustrating, there is quite a lot of misleading and contradictory advise on the internet (which Copilot, ChatGPT, Claude and other LLMs will base answers on).

LWY is small, its easy to find things and add your own breakpoints and logging output, it's built to be as 'open box' and transparent as possible, it isn't very sneaky and likes you to import from a folder of dependency proxies in quite a manual way (although there are a couple of scripts and utilities to do this). It is built for dev and test, so there are no guarantees of production safety (in fact I can probably guarantee that it isn't). I use vitest and jest a lot, so it supports both, with just the specific 'it' 'describe' '(before|after)(Each|All)' wrappers having a different version for each framework.

### Side note on 'it'|'test' and 'describe'
This is probably the worst documented thing about jest/vitest, that leads to a lot of confusion about execution order, and many strange explanations on forums and blogs. The official documentation is 'correct' but doesn't really explain:

'desribe' Is a factory that generates test fixtures, not tests. All the 'describe' sections are executed before /any/ test is run, which is why adding console logging into them can be really confusing when you try to run a single test and get logs about lots of others. As the 'describe' functions are run (which will happen on module loading if they are top module level) they will run lots all the before, after, it, test fucntions - these just register the tests, their execution funtions and their set-up and tear-down functions. This is the discover phase. Once everything has been discovered, the tests can be sorted and filtered and executed, with the relevant setups/teardowns. This is why the order looks weird or wrong, a describe runs first, whereever it is.

This two phase execution allows describe function blocks to generate tests, setups and teardowns as programmatically as you like, as deeply nested, abstracted, async-awaited, allowing run-time calcualted names, loops to produce 100s of tests from a single 'it' in an iterator, conditional tests. This has 'interesting' consequences on shared resources, and causes a lot of confusion. The order of code in the file is not necessarily the order of execution.

Code in beforeAll is not part of the discovery phase, it can not generate test function instances, if it goes and find lots of data, and store is in a module level variable (or any other shared resource) a 'describe' function block beneath won't can't use this. The describe has already run. If it tries to use a list from BeforeAll to loop around an 'it', your logging will show the data found, and tell you there are no tests in the fixture. Ask me how I know.

Once you get all this (and apologise for patronising those that knew all along and are thing 'doh! what did you think it meant, moron'), Using it for building fixtures with absolute certainly of execution order and dynamic test generation and parameterisation is a joy.

TLDR: 'describe' describes a test fixture factory and ALL describes run before ANY beforeXXX, test, it, afterXXX. Order of code blocks is largely irrelevant.

### Sidenote on Github Copilot
I used Github Copilot on this package as my pair programming other. I wrote the original code (asyncLocalDeps.js & proxyDeps.js, waitForSignal.js), and showed it to copilot (using Claude 3.7 Sonnet) and it got /really/ excited and decided we needed lots of other utilities and just wrote them, then (thankfully) it decided we needed lots of units and wrote them. Very few passed. I used them to work out what it was thinking when it wrote the utilities, most seemed like not a bad idea, based on the test usage, so I started fixing the tests, fixing the code, working out which tests needed specific vitest/jest versions, and creating those. In around 20 minutes of enthusiastic excitment copilot gave me a solid two days work to make sense of it, to make it make sense, to run and to pass tests. Thanks coding buddy. Like pair programming with a over-educated puppy.

For a package who's name is all about NOT mocking, copilot really loves mocking, doing all sorts of wonderful things with jest.mock, jest.fn, consoleSpy I hadn't seen or tried before, least not in some of these combinations. So I learned a lot, found the internet didn't know quite a few things, found some interesting difference between jest and vitest when it comes to test execution context isolation with dependency level module mocking. I also learned that trying to mock the mocking framework is not a good idea. Bad Copilot. So it wrote most tests than I can usually muster the enthusiasm for outside of production code for business critical stuff, which is brilliant. But I had to analyse, debug, re-run and fix them, often twice under both jest and vitest. AI - making you do more work. I did like some of its ideas though, and once it wrote the tests it seemed very rude to just delete the non-working ones, so it forced me onto a journey of learning, which is never a bad thing. So thanks to Copilot-Claude who co-authored this package, and wrote the README.md except for this top bit.

## Features

- **Async Local Storage for Dependency Injection**: Elegantly manage dependencies in your tests without global state
- **Framework-Agnostic Test Support**: Fully compatible with both Jest and Vitest testing frameworks
- **Logger with Context**: Advanced logging with buffering, prefixes, and test context awareness
- **Mock Timer**: Utility for precise control over timers in your tests
- **Signal and Wait**: Coordination utilities for asynchronous testing
- **Test Isolation**: Strong isolation between tests with mutex support
- **Snapshot Dependencies**: Capture and restore application state during tests
- **TypeScript Support**: Full TypeScript declarations for better IDE support

## Installation

```bash
npm install --save-dev laughing-with-you
```

## Quick Start

### Basic Setup with Jest

```javascript
// setup-jest.js
import { AsyncLocalStorage } from 'node:async_hooks';
import { setUpLocalDeps } from 'laughing-with-you';

// Ensure AsyncLocalStorage is properly initialized for Jest
if (!global.__appAls) {
  global.__appAls = new AsyncLocalStorage();
}

beforeEach(() => {
  // Initialize AsyncLocalStorage for each test
  setUpLocalDeps({
    // Initial dependencies
    config: {
      apiUrl: 'https://api.example.com'
    }
  });
});
```

Add to your Jest configuration:

```javascript
// jest.config.cjs
module.exports = {
  setupFilesAfterEnv: ['./setup-jest.js'],
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'], // For ESM support
  // other Jest configuration...
};
```

### Basic Setup with Vitest

```javascript
// setup-vitest.js
import { AsyncLocalStorage } from 'node:async_hooks';
import { setUpLocalDeps } from 'laughing-with-you';

// Ensure AsyncLocalStorage is properly initialized for Vitest
if (!global.__appAls) {
  global.__appAls = new AsyncLocalStorage();
}

beforeEach(() => {
  // Initialize AsyncLocalStorage for each test
  setUpLocalDeps({
    // Initial dependencies
    config: {
      apiUrl: 'https://api.example.com'
    }
  });
});
```

Add to your Vitest configuration:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./setup-vitest.js'],
    // other Vitest configuration...
  }
});
```

### Using the Helper Utilities

You can also use our helper utilities for more convenient test setup:

```javascript
// For Jest
import { ensureALSInitialized, withALS, describeWithALS } from 'laughing-with-you/test/testUtils/als-utils';

// Option 1: Wrap entire test suite
describeWithALS('My Test Suite', {
  // Initial dependencies
  config: { apiUrl: 'https://api.example.com' }
}, () => {
  test('my test', () => {
    // ALS is already initialized
  });
});

// Option 2: Per-test initialization
test('another test', withALS(() => {
  // This test has ALS initialized
}, { customDep: 'value' }));
```

## Core Features

### Async Local Dependency Management

The library provides a clean way to manage dependencies without polluting the global scope:

```javascript
import { getLocalDeps, setUpLocalDeps, runWithLocalDeps } from 'laughing-with-you';

// Set up dependencies
setUpLocalDeps({
  database: createMockDatabase(),
  api: createMockApi(),
  logger: createLogger()
});

// Access dependencies anywhere in the call stack
function businessLogic() {
  const { api, logger } = getLocalDeps();
  logger.info('Calling API...');
  return api.getData();
}

// Run with temporary dependencies
await runWithLocalDeps({ api: specialMockApi }, async () => {
  // Inside this function, getLocalDeps() will return specialMockApi
  await businessLogic();
});
```

### Advanced Logger

The logger utility provides rich features for application and test logging:

```javascript
import { createLogger } from 'laughing-with-you';

// Create a logger with custom settings
const logger = createLogger({
  level: 'debug',
  timestamps: true
});

// Basic logging
logger.info('Server started');
logger.debug('Connection details', { port: 3000, secure: true });

// Buffering logs for later inspection
logger.startBuffering();
logger.warn('This won't appear in console immediately');
const bufferedLogs = logger.buffer(); // Get buffered logs
logger.flushLogs(); // Output buffered logs to console

// Child loggers with context
const userLogger = logger.child('UserService');
userLogger.info('User logged in'); // Outputs: [UserService] User logged in

// Test context integration
const testLogger = logger.withTestContext();
testLogger.info('Test stage'); // Outputs: [CurrentTestName] Test stage
```

### Mock Timer

Control time in your tests with precision:

```javascript
import { useMockTimer } from 'laughing-with-you';

describe('Timer tests', () => {
  let mockTimer;
  
  beforeEach(() => {
    mockTimer = useMockTimer();
  });
  
  afterEach(() => {
    mockTimer.uninstall();
  });
  
  it('should handle setTimeout', () => {
    let called = false;
    setTimeout(() => { called = true }, 1000);
    
    // Fast-forward time
    mockTimer.advanceTime(1000);
    
    expect(called).toBe(true);
  });
  
  it('supports runAllTimers', () => {
    let counter = 0;
    const interval = setInterval(() => counter++, 1000);
    
    mockTimer.runAllTimers();
    clearInterval(interval);
    
    expect(counter).toBeGreaterThan(0);
  });
});
```

### Signal and Wait Utilities

Coordinate asynchronous operations in tests:

```javascript
import { signalDone, waitFor, withSignalMutex } from 'laughing-with-you';

it('waits for async operations', async () => {
  // Start an operation that will signal when done
  startAsyncOperation('data-loaded');
  
  // Wait for the operation to complete
  const result = await waitFor('data-loaded', 1000);
  expect(result).toBeDefined();
});

// Use mutex to serialize test execution
it('runs tests sequentially when needed', async () => {
  await withSignalMutex('database-access', async () => {
    // Only one test can enter this section at a time
    await testDatabaseOperation();
  });
});
```

### Dependency Snapshots

Capture and restore application state during tests:

```javascript
import { createSnapshot, withSnapshot } from 'laughing-with-you';

it('restores state after test', async () => {
  // Set up initial state
  setUpLocalDeps({ counter: { value: 0 } });
  
  await withSnapshot(async () => {
    // Modify state during test
    const { counter } = getLocalDeps();
    counter.value = 42;
    
    // Do assertions with modified state
    expect(getLocalDeps().counter.value).toBe(42);
  });
  
  // State is restored after test
  expect(getLocalDeps().counter.value).toBe(0);
});
```

## CLI Usage

The library includes a CLI tool for generating proxy modules:

### Generate Proxies for Specific Modules

```bash
npx laughing-with-you generate-proxies ./src/deps fs path http
```

This generates proxy modules for Node's built-in fs, path, and http modules in the `./src/deps` directory.

### Generate Proxies from package.json

```bash
npx laughing-with-you generate-from-package ./package.json ./src/deps
```

This generates proxy modules for all dependencies listed in your package.json.

## Logging

Context-aware logging for tests.

```javascript
const { createLogger, LogLevel } = require('laughing-with-you/logger');

// Create a logger
const logger = createLogger({
  level: LogLevel.DEBUG,
  prefix: 'UserTest'
});

// Use in tests
logger.debug('Setting up test', { userId: 123 });
logger.info('Test running');
logger.warn('Resource not cleaned up');
logger.error('Test failed', { error: new Error('Something went wrong') });
```

## How We Solved Testing Framework Compatibility

### The Challenge

Different testing frameworks handle JavaScript modules and test execution environments differently:

- **Jest** uses a complex module system with built-in mocking and hoisting behaviors
- **Vitest** is more aligned with the ESM ecosystem and runs tests in a different environment
- **AsyncLocalStorage** can be particularly challenging to manage across test boundaries

### Our Solution

#### 1. Unified AsyncLocalStorage Initialization

We implemented a framework-agnostic approach to ensure AsyncLocalStorage works correctly in both environments:

```javascript
// Common foundation
if (!global.__appAls) {
  global.__appAls = new AsyncLocalStorage();
}
```

#### 2. Framework-Specific Helpers

We created specialized helpers for each framework while maintaining a consistent API:

```javascript
// Jest helper
export function ensureALSInitialized(initialDeps = {}) {
  if (!global.__appAls) {
    global.__appAls = new AsyncLocalStorage();
  }
  setUpLocalDeps(initialDeps);
  return initialDeps;
}

// These work the same way for both Jest and Vitest
export function withALS(testFn, deps = {}) {
  return async function wrappedTestFn(...args) {
    ensureALSInitialized(deps);
    return await testFn(...args);
  };
}
```

#### 3. Test Isolation with Mutex

We implemented a mutex pattern for coordinating tests that require sequential execution:

```javascript
export async function withSignalMutex(signalName, fn, timeout = 5000, maxWaits = 10) {
  // Serializes execution of async operations
  // Uses a simple signal-based mutex to ensure only one function runs at a time
  // Important for tests that access shared resources
}
```

#### 4. Proper ESM Configuration

Our Jest configuration properly handles ESM modules:

```javascript
// jest.config.cjs
module.exports = {
  // ...
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
}
```

#### 5. Removed Custom Mocks

We eliminated custom mock implementations in favor of using the actual testing framework APIs:

```javascript
// Before: Custom mock files and moduleNameMapper entries
// After: Direct imports from frameworks
import { jest } from '@jest/globals';
import { describe, test, expect, vi } from 'vitest';
```

This approach provides a clean, maintainable testing experience with both Jest and Vitest while ensuring proper isolation and state management.

## Framework Compatibility Details

### AsyncLocalStorage Implementation

The library handles AsyncLocalStorage (ALS) differently for Jest and Vitest to ensure proper test isolation and state management:

#### Jest Considerations
- Jest requires special handling for AsyncLocalStorage due to its test runner behavior
- The library provides `ensureALSInitialized()` to properly set up global ALS for Jest tests
- Setup files handle the initialization automatically for a smooth experience

#### Vitest Considerations
- Vitest has better ESM support and more consistent ALS behavior
- The library still provides equivalent utilities for Vitest for consistency
- Both frameworks share the same underlying API while handling implementation differences

### Test Isolation Patterns

The library provides several patterns for managing test isolation:

1. **Per-suite initialization** using `describeWithALS`
2. **Per-test initialization** using `withALS`
3. **Manual initialization** in `beforeEach`/`beforeAll` hooks
4. **Signal mutex** for coordinating resource access across tests

## Example: Testing with Both Frameworks

This example demonstrates how to write the same test for both Jest and Vitest - basically, you can usually just swap jest. for vi. or vice-versa:

### Jest Version (`example.test.jest.js`)

```javascript
// Test for signal testing with Jest
import { createSignalTestEnv, createSignalTest } from '../src/signalTesting.js';
import { setUpLocalDeps, getLocalDeps } from '../src/asyncLocalDeps.js';
import { waitFor, signalDone } from '../src/waitForSignals.js';
import { jest } from '@jest/globals';
import { ensureALSInitialized } from './testUtils/als-utils.js';

describe('Signal Testing', () => {
  beforeAll(() => {
    // Initialize the async local storage with empty dependencies
    ensureALSInitialized();
  });
  
  beforeEach(() => {
    // Reset all signals and mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
```

### Vitest Version (`example.test.vitest.js`)

```javascript
// Test for signal testing
import { createSignalTestEnv, createSignalTest } from '../src/signalTesting';
import { setUpLocalDeps, getLocalDeps } from '../src/asyncLocalDeps';
import { waitFor, signalDone } from '../src/waitForSignals';

describe('Signal Testing', () => {
  beforeAll(() => {
    // Initialize the async local storage with empty dependencies
    setUpLocalDeps();
  });
  
  beforeEach(() => {
    // Reset all signals
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
```

### Sometimes things are not exactly the same...

The vitest implementation of the jest API is pretty damn near compatible - there were some cases where everything ran in vitest, and the tests passed individually in Jest, but the fixture failed, as Jest didn't reset ALS contexts like vitest did. I guess Jest came first, so vitest is wrong, but their approach felt more intuitive.

### Running Tests with Both Frameworks

```bash
# Run Jest tests
npx jest

# Run Vitest tests
npx vitest
```

Both test suites will work correctly with the same underlying code, maintaining full compatibility across frameworks.

## API Reference

For detailed API documentation, see the [API Reference](./API.md) file.

### Core Utilities

- `setUpLocalDeps(deps)` - Set up initial local dependencies
- `getLocalDeps()` - Get the current local dependencies
- `runWithLocalDeps(deps, fn)` - Run a function with temporary dependencies
- `ensureALSInitialized(deps)` - Ensure AsyncLocalStorage is properly initialized
- `withALS(testFn, deps)` - Wrap a test function with ALS initialization
- `describeWithALS(description, deps, definitionFn)` - Wrap a describe block with ALS initialization
- `withSignalMutex(signalName, fn, timeout, maxWaits)` - Ensure sequential execution of critical test sections

### Logging Utilities

- `createLogger(options)` - Create a new logger with the specified options
- `logger.debug/info/warn/error(message, data)` - Log at various levels
- `logger.startBuffering()` - Start capturing logs in memory
- `logger.buffer()` - Get the current buffer of logs
- `logger.flushLogs()` - Output buffered logs and clear the buffer
- `logger.child(prefix)` - Create a child logger with a prefix
- `logger.withTestContext()` - Create a logger that includes test names

### Signal Utilities

- `waitFor(signalName, timeout, continueOnTimeout)` - Wait for a signal
- `signalDone(signalName, value)` - Trigger a signal with a value
- `withSignalMutex(signalName, fn)` - Ensure sequential execution
- `resetSignals()` - Clear all signal state

### Mock Timer Utilities

- `useMockTimer()` - Create and install a mock timer
- `mockTimer.advanceTime(ms)` - Advance virtual time by milliseconds
- `mockTimer.runAllTimers()` - Run all pending timers
- `mockTimer.uninstall()` - Restore original timer functions

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT