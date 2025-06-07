/**
 * Helper for Jest tests to properly handle AsyncLocalStorage initialization
 * This helper ensures AsyncLocalStorage is properly set up for Jest tests
 * without modifying the core functionality of the library.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { setUpLocalDeps, runWithLocalDeps } from '../../src/asyncLocalDeps.js';

/**
 * Ensures that AsyncLocalStorage is initialized for Jest tests
 * Call this in beforeAll or beforeEach hooks to guarantee initialization
 * @param {Object} [initialDeps={}] Initial dependencies to set up
 */
export function ensureALSInitialized(initialDeps = {}) {
  // Make sure global.__appAls exists
  if (!global.__appAls) {
    global.__appAls = new AsyncLocalStorage();
  }
  
  // Set up dependencies
  setUpLocalDeps(initialDeps);
  
  return initialDeps;
}

/**
 * Wraps a test function with AsyncLocalStorage initialization
 * Use this when you need to ensure ALS is available within a specific test
 * @param {Function} testFn The test function to wrap
 * @param {Object} [deps={}] Dependencies to inject
 * @returns {Function} Wrapped test function
 */
export function withALS(testFn, deps = {}) {
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
export function describeWithALS(description, deps, definitionFn) {
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
export function cleanupALS() {
  // Clear the ALS if it exists
  const als = global.__appAls;
  if (als && typeof als.exit === 'function') {
    als.exit(() => {});
  }
}
