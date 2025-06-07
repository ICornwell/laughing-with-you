# laughing-with-you

> **Extensions for Jest and Vitest testing libraries focused on dependency management and test wrappers.**

---

This library provides tools to make testing with Jest and Vitest more powerful and flexible through dependency injection, test wrappers, analytics, and proxies. Key features include:

- **AsyncLocalStorage-based Dependency Management**: Store and retrieve dependencies across different test functions
- **Test Wrappers**: Extensions for Jest and Vitest that automatically handle local dependencies
- **Analytics**: Record function calls and performance metrics
- **Proxy Generation**: Create proxies for dependencies to allow mocking or modification during tests
- **Signal-based Testing**: Coordinate asynchronous test operations with signals and waiters
- **Mock Timers**: Control time in tests for reliable testing of timers and scheduling
- **Dependency Snapshots**: Capture, restore, and diff dependency states

## Why this library exists

Testing in modern JavaScript applications often requires:

1. Sharing dependencies across test files and functions
2. Tracking performance metrics of service calls
3. Mocking dependencies in a consistent way
4. Handling asynchronous operations correctly

This library provides solutions to these problems through a simple and consistent API that works with both Jest and Vitest testing frameworks.

## Installation

```bash
npm install laughing-with-you
```

## Usage

### Basic Example

```javascript
// Import the base functions
const { setUpLocalDeps, getLocalDeps } = require('laughing-with-you');
// Import the test wrappers for your framework
const { describeWithLocalDeps, itWithLocalDeps } = require('laughing-with-you/jest');
// Or for Vitest
// const { describeWithLocalDeps, itWithLocalDeps } = require('laughing-with-you/vite');

// Set up dependencies
const myDb = {
  fetchData: () => Promise.resolve(['item1', 'item2']),
  saveData: (data) => Promise.resolve(true)
};

// Create a test suite with local dependencies
describeWithLocalDeps('My Test Suite', () => {
  setUpLocalDeps({ db: myDb });
  
  itWithLocalDeps('should fetch data from DB', async () => {
    // Access the local dependency
    const { db } = getLocalDeps();
    const data = await db.fetchData();
    expect(data).toEqual(['item1', 'item2']);
  });
});
```

### Recording Analytics

```javascript
const { recordCalls } = require('laughing-with-you/analytics');

// Wrap a dependency for analytics
const { getStats } = recordCalls('db', ['fetchData', 'saveData']);

// Run your tests that use the db dependency

// Get performance stats after tests complete
console.log(getStats()); 
// Example output:
// { 'db.fetchData': { calls: 5, avgTime: 12.4, totalTime: 62 } }
```

### Controlling Time with Mock Timers

```javascript
const { useMockTimer } = require('laughing-with-you/timer');

describe('Timer Tests', () => {
  it('should test setTimeout behavior', () => {
    // Create and install a mock timer
    const mockTimer = useMockTimer();
    
    // Set up a delayed operation
    const callback = jest.fn();
    setTimeout(callback, 1000);
    
    // Callback hasn't been called yet
    expect(callback).not.toHaveBeenCalled();
    
    // Advance time by 1 second
    mockTimer.advanceTime(1000);
    
    // Now the callback should have been called
    expect(callback).toHaveBeenCalled();
    
    // Clean up
    mockTimer.uninstall();
  });
});
```

### Using Dependency Snapshots

```javascript
const { createSnapshot, withSnapshot } = require('laughing-with-you/snapshot');

describe('Snapshot Tests', () => {
  beforeEach(() => {
    // Set up initial dependencies
    setUpLocalDeps({
      service: {
        getValue: () => 'original'
      }
    });
  });
  
  it('should temporarily modify dependencies', async () => {
    // Take a snapshot
    const snapshot = createSnapshot();
    
    // Modify dependencies
    setUpLocalDeps({
      service: {
        getValue: () => 'modified'
      }
    });
    
    // Use the modified dependency
    expect(getLocalDeps().service.getValue()).toBe('modified');
    
    // Restore the snapshot
    snapshot.restore();
    
    // Original should be restored
    expect(getLocalDeps().service.getValue()).toBe('original');
  });
  
  // Or use the withSnapshot helper
  it('should run code with temporary dependencies', async () => {
    const result = await withSnapshot(async () => {
      // This code runs with temporary dependencies
      setUpLocalDeps({
        service: {
          getValue: () => 'temporary'
        }
      });
      
      return getLocalDeps().service.getValue();
    });
    
    // Result from the temporary context
    expect(result).toBe('temporary');
    
    // Original deps are restored
    expect(getLocalDeps().service.getValue()).toBe('original');
  });
});
```

### Signal-based Testing

```javascript
const { createSignalTestEnv, createSignalTest } = require('laughing-with-you/signal');

describe('Signal Tests', () => {
  it('should coordinate async operations', async () => {
    const signals = createSignalTestEnv();
    
    // Start an async operation
    setTimeout(() => {
      // Signal when it's done
      signals.signal('operationComplete', { status: 'success' });
    }, 100);
    
    // Wait for the operation to complete
    const result = await signals.wait('operationComplete');
    
    expect(result.status).toBe('success');
  });
  
  // Or create a test that waits for a signal
  const signalTest = createSignalTest(async () => {
    const { signals } = getLocalDeps();
    
    // Start background task
    setTimeout(() => {
      signals.signal('testDone', 'done');
    }, 100);
    
    return 'test result';
  }, 'testDone');
  
  it('should wait for signal automatically', signalTest);
});
```

## API Reference

### Core Functions

- `setUpLocalDeps(deps)`: Set up dependencies in AsyncLocalStorage
- `getLocalDeps()`: Get current dependencies from AsyncLocalStorage
- `addLocalDeps(newDeps)`: Add new dependencies to existing ones
- `runWithLocalDeps(deps, fn, timeout)`: Run a function with specific dependencies

### Test Wrappers

Both Jest and Vitest provide the same wrapper functions:

- `describeWithLocalDeps(name, fn, timeout)`
- `itWithLocalDeps(name, fn, timeout)`
- `beforeEachWithLocalDeps(fn, timeout)`
- `beforeAllWithLocalDeps(fn, timeout)`
- `afterEachWithLocalDeps(fn, timeout)`
- `afterAllWithLocalDeps(fn, timeout)`
- `testWithLocalDeps(name, fn, timeout)`
- `specWithLocalDeps(name, fn, timeout)`

### Analytics

- `recordCalls(name, methodNames)`: Record function calls and performance metrics
- `analytics.getStats()`: Get recorded analytics data
- `analytics.reset()`: Reset analytics data

### Mock Timer

- `useMockTimer()`: Create and install a mock timer
- `mockTimer.advanceTime(ms)`: Advance time by a specific amount
- `mockTimer.runAll()`: Run all pending timers
- `mockTimer.runUntil(timestamp)`: Run timers until a specific timestamp
- `mockTimer.uninstall()`: Remove the mock timer

### Dependency Snapshots

- `createSnapshot()`: Create a snapshot of current dependencies
- `snapshot.restore()`: Restore dependencies from a snapshot
- `snapshot.getDependency(name)`: Get a specific dependency from snapshot
- `snapshot.diff()`: Compare current dependencies to snapshot
- `withSnapshot(fn)`: Run a function with temporary dependencies

### Signal Testing

- `createSignalTestEnv()`: Create a signal-based test environment
- `signals.wait(name, timeout)`: Wait for a signal
- `signals.signal(name, value)`: Signal that a condition has been met
- `createSignalTest(fn, signalName, timeout)`: Create a test that waits for a signal

### Proxy Functions

- `proxyDep(dep, name)`: Create a proxy for a dependency
- `proxyModule(module, name)`: Create proxies for all exports of a module
- `generateProxies(targetDir, deps)`: Generate proxy modules for common dependencies

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT
