"use strict";

var _nodeAsync_hooks = require("node:async_hooks");
var _asyncLocalDeps = require("../../srccjs/asyncLocalDeps.cjs");
var _alsUtils = require("./testUtils/als-utils.cjs");

var _globals = require("@jest/globals");
// setup-jest-ci.js - Special setup file for CI environments

// Apply ALS patches early

global.jest = _globals.jest;
console.log('[CI Setup] Initializing test environment for CI');

// Create global.__appAls using the safe method
if (!global.__appAls) {
  if (typeof global.ensureSafeAppAls === 'function') {
    global.__appAls = global.ensureSafeAppAls();
  } else {
    global.__appAls = new _nodeAsync_hooks.AsyncLocalStorage();
  }
  console.log('[CI Setup] AsyncLocalStorage initialized');
}

// Setup for handling store recreation between tests
const setupStore = () => {
  try {
    // Try to create a store using runWithLocalDeps
    return (0, _asyncLocalDeps.runWithLocalDeps)({}, () => {
      console.log('[CI Setup] Successfully initialized dependencies with runWithLocalDeps');
      return true;
    });
  } catch (error) {
    console.error('[CI Setup] Error in runWithLocalDeps:', error.message);
    try {
      // Fallback to direct initialization
      global.__appAls.enterWith({});
      console.log('[CI Setup] Used direct enterWith as fallback');
      return Promise.resolve(true);
    } catch (nestedError) {
      console.error('[CI Setup] Direct initialization failed:', nestedError.message);
      return Promise.resolve(false);
    }
  }
};

// Execute setup
setupStore().catch(error => {
  console.error('[CI Setup] Async setup failed:', error);
});

// Add global beforeEach to ensure consistent initialization
beforeEach(() => {
  try {
    if (!global.__appAls) {
      global.__appAls = new _nodeAsync_hooks.AsyncLocalStorage();
      console.log('[CI beforeEach] AsyncLocalStorage re-initialized');
    }

    // Check if store exists
    const store = global.__appAls.getStore();
    if (!store) {
      console.log('[CI beforeEach] No store found, creating a new one');
      global.__appAls.enterWith({
        testContext: {},
        dependencies: {}
      });
    }
  } catch (error) {
    console.warn('[CI beforeEach] ALS initialization error:', error.message);
    // This is a non-fatal error, tests can still continue
  }
});

// Create an alternative test utility that's safer for CI
global.runTestSafely = async (testFn, initialDeps = {}) => {
  try {
    // First try using the normal mechanism
    return await (0, _asyncLocalDeps.runWithLocalDeps)(initialDeps, testFn);
  } catch (error) {
    console.warn('[CI runTestSafely] Error with runWithLocalDeps:', error.message);

    // Direct approach
    if (global.__appAls) {
      try {
        global.__appAls.enterWith({
          testContext: {},
          dependencies: initialDeps
        });
        return await testFn();
      } catch (innerError) {
        console.error('[CI runTestSafely] All approaches failed:', innerError.message);
        throw innerError;
      }
    } else {
      // Last resort
      return await testFn();
    }
  }
};