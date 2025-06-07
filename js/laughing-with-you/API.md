# API Reference

## Core Modules

### Async Local Storage

Provides dependency injection using AsyncLocalStorage.

```javascript
const { setUpLocalDeps, getLocalDeps, runWithLocalDeps, addLocalDeps } = require('laughing-with-you');
```

- **setUpLocalDeps(deps: object)**: Set up dependencies in AsyncLocalStorage
- **getLocalDeps()**: Get current dependencies from AsyncLocalStorage
- **addLocalDeps(newDeps: object)**: Add new dependencies to existing ones
- **runWithLocalDeps(deps: object, callback: Function, timeout?: number)**: Run a function with specific dependencies
- **runWithTestContext(callback: Function, timeout?: number)**: Run a function with a test context
- **getTestContext()**: Get the current test context

### Signal Testing

Coordinate asynchronous test operations with signals.

```javascript
const { createSignalTestEnv, createSignalTest } = require('laughing-with-you/signal');
```

- **createSignalTestEnv()**: Create a signal-based test environment with the following methods:
  - **wait(signalName: string, timeout?: number)**: Wait for a signal to be triggered
  - **signal(signalName: string, value: any)**: Signal that a condition has been met
  - **createWaiter(signalName: string, timeout?: number)**: Create a signal waiter that can be used as a promise
  - **reset()**: Reset all signals and waiters
- **createSignalTest(testFn: Function, signalName: string, timeout?: number)**: Create a test that waits for a specific signal

### Mock Timer

Control time in your tests.

```javascript
const { useMockTimer } = require('laughing-with-you/timer');
```

- **useMockTimer()**: Create and install a mock timer with these methods:
  - **advanceTime(ms: number)**: Advance time by a specific number of milliseconds
  - **runAll()**: Run all pending timers
  - **runOnlyPendingTimers()**: Run only pending timers, not newly created ones
  - **getTime()**: Get the current mock time
  - **reset()**: Reset the mock timer
  - **uninstall()**: Uninstall the mock timer and restore original timing functions

### Dependency Snapshot

Capture and restore dependency states.

```javascript
const { createSnapshot, withSnapshot } = require('laughing-with-you/snapshot');
```

- **createSnapshot()**: Create a new dependency snapshot with these methods:
  - **capture()**: Capture the current state
  - **restore()**: Restore the captured state
  - **addField(obj: object, key: string)**: Add a specific field to track
  - **addObject(obj: object)**: Add all fields of an object to track
- **withSnapshot(fn: Function)**: Run a function with a snapshot that is automatically restored afterward

### Resource Manager

Manage resources for automatic cleanup.

```javascript
const { createResourceManager } = require('laughing-with-you/resource');
```

- **createResourceManager()**: Create a resource manager with these methods:
  - **add(resource: any, cleanupFn: Function)**: Add a resource with its cleanup function
  - **cleanup(resource: any)**: Clean up a specific resource
  - **cleanupAll()**: Clean up all resources
  - **cleanupAllIgnoreErrors()**: Clean up all resources, ignoring errors

### Logger

Context-aware logging for tests.

```javascript
const { createLogger, LogLevel } = require('laughing-with-you/logger');
```

- **LogLevel**: Enum with DEBUG, INFO, WARN, ERROR levels
- **createLogger(options: object)**: Create a logger with the following methods:
  - **debug(message: string, context?: object)**: Log a debug message
  - **info(message: string, context?: object)**: Log an info message
  - **warn(message: string, context?: object)**: Log a warning message
  - **error(message: string, context?: object)**: Log an error message
  - **setLevel(level: LogLevel)**: Set the logging level
  - **setPrefix(prefix: string)**: Set the log prefix
  - **createChild(prefix: string)**: Create a child logger with an extended prefix

## Framework Integrations

### Jest Integration

Extensions for Jest.

```javascript
const { describeWithLocalDeps, itWithLocalDeps, beforeAllWithLocalDeps, afterAllWithLocalDeps, beforeEachWithLocalDeps, afterEachWithLocalDeps } = require('laughing-with-you/jest');
```

- **describeWithLocalDeps(name: string, fn: Function, deps?: object)**: Jest describe with local dependencies
- **itWithLocalDeps(name: string, fn: Function, deps?: object)**: Jest test with local dependencies
- **beforeAllWithLocalDeps(fn: Function, deps?: object)**: Jest beforeAll with local dependencies
- **afterAllWithLocalDeps(fn: Function, deps?: object)**: Jest afterAll with local dependencies
- **beforeEachWithLocalDeps(fn: Function, deps?: object)**: Jest beforeEach with local dependencies
- **afterEachWithLocalDeps(fn: Function, deps?: object)**: Jest afterEach with local dependencies

### Vitest Integration

Extensions for Vitest.

```javascript
const { describeWithLocalDeps, itWithLocalDeps, beforeAllWithLocalDeps, afterAllWithLocalDeps, beforeEachWithLocalDeps, afterEachWithLocalDeps } = require('laughing-with-you/vite');
```

- **describeWithLocalDeps(name: string, fn: Function, deps?: object)**: Vitest describe with local dependencies
- **itWithLocalDeps(name: string, fn: Function, deps?: object)**: Vitest test with local dependencies
- **beforeAllWithLocalDeps(fn: Function, deps?: object)**: Vitest beforeAll with local dependencies
- **afterAllWithLocalDeps(fn: Function, deps?: object)**: Vitest afterAll with local dependencies
- **beforeEachWithLocalDeps(fn: Function, deps?: object)**: Vitest beforeEach with local dependencies
- **afterEachWithLocalDeps(fn: Function, deps?: object)**: Vitest afterEach with local dependencies

## Proxy Generation

Tools for creating and managing proxies.

```javascript
const { proxyDep, proxyModule, generateProxies } = require('laughing-with-you');
```

- **proxyDep(dep: object, name: string)**: Create a proxy for a dependency
- **proxyModule(module: object, name: string)**: Auto-generate proxies for all exports of a module
- **generateProxies(targetDir?: string, deps?: string[])**: Generate proxy modules for common dependencies

## Analytics

Record and analyze function calls.

```javascript
const { recordCalls } = require('laughing-with-you/analytics');
```

- **recordCalls(name: string, methodNames?: string[])**: Record function calls with these methods:
  - **getStats()**: Get the recorded statistics
  - **reset()**: Reset the recorded statistics

## E2E Testing

End-to-end testing utilities.

```javascript
const { createE2ETestEnvironment, withE2ETestEnvironment } = require('laughing-with-you/e2e');
```

- **createE2ETestEnvironment(options?: object)**: Create an E2E test environment with these methods:
  - **setup()**: Set up the test environment
  - **teardown()**: Tear down the test environment
  - **registerResource(resource: any, cleanupFn: Function)**: Register a resource for cleanup
  - **setDependencies(dependencies: object)**: Set dependencies for the test
  - **advanceTime(ms: number)**: Advance time when using mock timer
  - **runAllTimers()**: Run all pending timers when using mock timer
  - **createFixture(setupFn?: Function, teardownFn?: Function)**: Create a helper function for setup/teardown
  - **runTest(testFn: Function)**: Run a test with this environment
- **createE2ETestEnvironment(options?: object)**: Create an E2E test environment
- **withE2ETestEnvironment(fn: Function, options?: object)**: Run a function with an E2E test environment

## CLI Tools

Command-line interface tools.

```bash
npx laughing-with-you [command] [arguments]
```

- **generate-proxies [targetDir] [deps...]**: Generate proxy modules for dependencies
- **generate-from-package [packageJsonPath] [targetDir]**: Generate proxies from package.json
- **help**: Show help message
- **version**: Show version
