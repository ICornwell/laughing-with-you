"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanupALS = cleanupALS;
exports.describeWithALS = describeWithALS;
exports.ensureALSInitialized = ensureALSInitialized;
exports.withALS = withALS;
var _nodeAsync_hooks = require("node:async_hooks");
var _asyncLocalDeps = require("../../../srccjs/asyncLocalDeps.js");
/**
 * Helper for Jest tests to properly handle AsyncLocalStorage initialization
 * This helper ensures AsyncLocalStorage is properly set up for Jest tests
 * without modifying the core functionality of the library.
 */

/**
 * Ensures that AsyncLocalStorage is initialized for Jest tests
 * Call this in beforeAll or beforeEach hooks to guarantee initialization
 * @param {Object} [initialDeps={}] Initial dependencies to set up
 */
function ensureALSInitialized(initialDeps = {}) {
  // Make sure global.__appAls exists
  if (!global.__appAls) {
    global.__appAls = new _nodeAsync_hooks.AsyncLocalStorage();
    console.log('ALS-Utils: Created new AsyncLocalStorage instance');
  }
  try {
    // First check if store already exists
    const store = global.__appAls.getStore();
    if (store) {
      // Store exists, update dependencies
      store.set('dependencies', {
        ...(store.get('dependencies') || {}),
        ...initialDeps
      });
      return initialDeps;
    }

    // No store exists, try runWithLocalDeps
    return (0, _asyncLocalDeps.runWithLocalDeps)({}, () => {
      // Now set up dependencies within the context of a store
      (0, _asyncLocalDeps.setUpLocalDeps)(initialDeps);
      return initialDeps;
    });
  } catch (error) {
    console.error('ALS-Utils: Error initializing dependencies:', error);
    try {
      // First fallback: try enterWith with Map structure
      global.__appAls.enterWith(new Map([['testContext', {}], ['dependencies', initialDeps]]));
    } catch (nestedError) {
      console.error('ALS-Utils: First fallback failed, trying direct initialization:', nestedError);

      // Last resort: direct initialization with just dependencies
      global.__appAls.enterWith(initialDeps);
    }
  }
  return initialDeps;
}

/**
 * Wraps a test function with AsyncLocalStorage initialization
 * Use this when you need to ensure ALS is available within a specific test
 * @param {Function} testFn The test function to wrap
 * @param {Object} [deps={}] Dependencies to inject
 * @returns {Function} Wrapped test function
 */
function withALS(testFn, deps = {}) {
  return async function wrappedTestFn(...args) {
    ensureALSInitialized(deps);
    return await testFn(...args);
  };
}

/**
 * Wrap Jest's describe to ensure ALS initialization for all tests within
 * @param {string} description Test suite description
 * @param {Object} [deps={}] Shared dependencies for all tests in the suite
 * @param {Function} definitionFn Function containing test definitions
 */
function describeWithALS(description, deps, definitionFn) {
  // Handle case where deps is omitted
  if (typeof deps === 'function') {
    definitionFn = deps;
    deps = {};
  }
  describe(description, () => {
    beforeAll(() => {
      ensureALSInitialized(deps);
    });
    definitionFn();
  });
}

/**
 * Clear ALS after tests to prevent leakage
 * Call this in afterAll if you need to clean up
 */
function cleanupALS() {
  // Clear the ALS if it exists
  const als = global.__appAls;
  if (als && typeof als.exit === 'function') {
    als.exit(() => {});
  }
}