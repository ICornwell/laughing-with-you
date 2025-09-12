"use strict";

var _signalTesting = require("../../srccjs/signalTesting.cjs");
var _asyncLocalDeps = require("../../srccjs/asyncLocalDeps.cjs");
var _waitForSignals = require("../../srccjs/waitForSignals.cjs");
var _globals = require("@jest/globals");
var _alsUtils = require("./testUtils/als-utils.cjs");
var _testWrappers = require("../../srccjs/jest/testWrappers.cjs");
// Test for signal testing with Jest

describe('Signal Testing', () => {
  // Initialize ALS before any tests run
  beforeAll(() => {
    if (!global.__appAls) {
      global.__appAls = new AsyncLocalStorage();
      console.log('SignalTesting: Created new ALS instance in beforeAll');
    }
  });
  beforeEach(() => {
    // Check for and clean up any existing store first to avoid conflicts
    try {
      const existingStore = global.__appAls.getStore();
      if (existingStore) {
        console.log('SignalTesting: Store already exists, cleaning up first');
        global.__appAls.exit(() => {});
      }
    } catch (err) {
      console.error('SignalTesting: Error cleaning up existing store:', err);
    }

    // Always re-initialize the AsyncLocalStorage for each test with multiple fallbacks
    try {
      // Primary approach
      (0, _alsUtils.ensureALSInitialized)({});
    } catch (error) {
      console.error('SignalTesting: Primary ALS initialization failed:', error);
      try {
        // First fallback: direct enterWith using Map structure
        global.__appAls.enterWith(new Map([['testContext', {}], ['dependencies', {}]]));
        console.log('SignalTesting: Used direct Map initialization as fallback');
      } catch (innerError) {
        console.error('SignalTesting: Fallback initialization failed:', innerError);

        // Last resort: simple object
        global.__appAls.enterWith({});
        console.log('SignalTesting: Used simple object initialization as last resort');
      }
    }

    // Reset all signals and mock console.log
    _globals.jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  (0, _asyncLocalDeps.runWithLocalDeps)({}, () => {
    (0, _testWrappers.testWithLocalDeps)('should create a signal environment with handler methods', () => {
      const signalHandler = (0, _signalTesting.createSignalTestEnv)();
      expect(signalHandler).toHaveProperty('wait');
      expect(signalHandler).toHaveProperty('signal');
      expect(signalHandler).toHaveProperty('createWaiter');
      expect(signalHandler).toHaveProperty('reset');

      // Check if it was added to local dependencies
      expect((0, _asyncLocalDeps.getLocalDeps)().signals).toBe(signalHandler);
    });
  });
  test('should wait for and receive signals', async () => {
    const signalHandler = (0, _signalTesting.createSignalTestEnv)();
    const signalName = 'testSignal';
    const signalValue = {
      data: 'test data'
    };

    // Create a promise that waits for the signal
    const waitPromise = signalHandler.wait(signalName, 1000);

    // Signal that the condition has been met
    signalHandler.signal(signalName, signalValue);

    // Wait for the signal
    const result = await waitPromise;
    expect(result).toEqual(signalValue);
  });
  test('should create a waiter that resolves when signaled', async () => {
    const signalHandler = (0, _signalTesting.createSignalTestEnv)();
    const signalName = 'waiterTest';

    // Create a waiter
    const waiterPromise = signalHandler.createWaiter(signalName, 1000);

    // Signal in the future
    setTimeout(() => {
      signalHandler.signal(signalName, 'waiter result');
    }, 10);

    // Wait for the result
    const result = await waiterPromise;
    expect(result).toBe('waiter result');
  });
  test('should reset all signals and waiters', async () => {
    const signalHandler = (0, _signalTesting.createSignalTestEnv)();

    // Create some waiters
    const waiter1 = signalHandler.createWaiter('signal1', 1000);

    // Signal it
    signalHandler.signal('signal1', 'done');

    // Value should be "done"
    expect(await waiter1).toBe('done');

    // Reset all signals (this should clear the internal state)
    signalHandler.reset();

    // Signal with a new value after reset
    signalHandler.signal('signal1', 'new value');

    // Create a new waiter for the same signal name
    const waiter2 = signalHandler.createWaiter('signal1', 1000);

    // It should get the new value, not the old one
    expect(await waiter2).toBe('new value');
  });
  (0, _asyncLocalDeps.runWithLocalDeps)({}, () => {
    (0, _testWrappers.testWithLocalDeps)('should create a test that waits for a signal', async () => {
      // Create a signal test
      const testFn = _globals.jest.fn(async () => {
        // Get the signals from dependencies
        const signals = (0, _asyncLocalDeps.getLocalDeps)().signals;

        // Signal completion in the future
        setTimeout(() => {
          signals.signal('testComplete', 'test result');
        }, 10);
        return 'function result';
      });

      // Create the signal test
      const signalTest = (0, _signalTesting.createSignalTest)(testFn, 'testComplete', 1000);

      // Run the test
      const result = await signalTest();

      // Test function should have been called
      expect(testFn).toHaveBeenCalled();

      // The result should be the function's return value
      expect(result).toBe('function result');
    });
  });
});