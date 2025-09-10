"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSignalTest = createSignalTest;
exports.createSignalTestEnv = createSignalTestEnv;
exports.default = void 0;
var _asyncLocalDeps = require("./asyncLocalDeps");
var _waitForSignals = require("./waitForSignals");
// Signal-based testing utilities

/**
 * Create a signal-based test environment
 * This helps with testing asynchronous code that needs coordination
 */
function createSignalTestEnv() {
  const signals = {};
  const waiters = {};

  // Create signal handler
  const signalHandler = {
    // Wait for a signal to be triggered
    wait: async (signalName, timeout = 5000) => {
      return (0, _waitForSignals.waitFor)(signalName, timeout);
    },
    // Signal that a condition has been met
    signal: (signalName, value) => {
      (0, _waitForSignals.signalDone)(signalName, value);
      return value;
    },
    // Create a signal waiter that can be used as a promise
    createWaiter: (signalName, timeout = 5000) => {
      if (!waiters[signalName]) {
        waiters[signalName] = (0, _waitForSignals.waitFor)(signalName, timeout);
      }
      return waiters[signalName];
    },
    // Reset all signals and waiters
    reset: () => {
      Object.keys(waiters).forEach(key => {
        (0, _waitForSignals.signalDone)(key, null);
      });
      Object.keys(signals).forEach(key => {
        delete signals[key];
      });
      Object.keys(waiters).forEach(key => {
        delete waiters[key];
      });
    }
  };

  // Add to local dependencies
  (0, _asyncLocalDeps.addLocalDeps)({
    signals: signalHandler
  }, true);
  return signalHandler;
}

/**
 * Create a test that waits for a specific signal before completing
 */
function createSignalTest(testFn, signalName, timeout = 5000) {
  return async (...args) => {
    const signalHandler = createSignalTestEnv();

    // Create a promise that waits for the signal
    const signalPromise = signalHandler.createWaiter(signalName, timeout);

    // Run the test function
    const result = await testFn(...args);

    // Wait for the signal
    await signalPromise;
    return result;
  };
}
var _default = exports.default = {
  createSignalTestEnv,
  createSignalTest
};