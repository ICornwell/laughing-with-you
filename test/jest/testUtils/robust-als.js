"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRobustALS = createRobustALS;
exports.default = void 0;
exports.getDepsRobustly = getDepsRobustly;
exports.runWithRobustALS = runWithRobustALS;
exports.setDepsRobustly = setDepsRobustly;
var _nodeAsync_hooks = require("node:async_hooks");
/**
 * Robust AsyncLocalStorage utilities for CI compatibility
 * 
 * These utilities provide enhanced compatibility for AsyncLocalStorage across
 * different environments (local development, CI systems, different Node versions),
 * focused on ensuring consistent behavior across all platforms.
 */

/**
 * Creates a robust AsyncLocalStorage that works consistently across environments
 */
function createRobustALS() {
  if (global.__appAls) {
    return global.__appAls;
  }
  try {
    global.__appAls = new _nodeAsync_hooks.AsyncLocalStorage();
    return global.__appAls;
  } catch (error) {
    console.error('Failed to create AsyncLocalStorage:', error);
    // Return a mock implementation that won't break tests
    return createALSMock();
  }
}

/**
 * Creates a fallback mock for environments where ALS doesn't work
 */
function createALSMock() {
  console.warn('Using AsyncLocalStorage mock due to environment limitations');

  // Create a simple shared store that mimics ALS behavior
  const sharedStore = {
    current: null
  };
  return {
    getStore: () => sharedStore.current,
    run: (store, callback) => {
      const oldStore = sharedStore.current;
      sharedStore.current = store;
      try {
        return callback();
      } finally {
        sharedStore.current = oldStore;
      }
    },
    enterWith: store => {
      sharedStore.current = store;
    },
    exit: callback => {
      const result = callback();
      sharedStore.current = null;
      return result;
    },
    // Identify this as a mock
    __isMock: true
  };
}

/**
 * Runs a function with robust AsyncLocalStorage setup
 */
async function runWithRobustALS(deps, callback) {
  const als = createRobustALS();

  // Check if we're using the mock
  if (als.__isMock) {
    als.enterWith(new Map([['testContext', {}], ['dependencies', deps]]));
    try {
      return await callback();
    } finally {
      als.exit(() => {});
    }
  }

  // Using real ALS
  try {
    // Standard approach with Map
    return await als.run(new Map([['testContext', {}], ['dependencies', deps]]), callback);
  } catch (mapError) {
    console.warn('ALS with Map failed, trying object format:', mapError.message);
    try {
      // Try with plain object
      return await als.run({
        testContext: {},
        dependencies: deps
      }, callback);
    } catch (objError) {
      console.warn('ALS with plain object failed, using direct approach:', objError.message);

      // Last resort: minimal approach
      als.enterWith(deps);
      try {
        return await callback();
      } finally {
        als.exit(() => {});
      }
    }
  }
}

/**
 * Gets dependencies from ALS with robust error handling
 */
function getDepsRobustly() {
  const als = global.__appAls || createRobustALS();
  const store = als.getStore();
  if (!store) {
    return {};
  }
  if (store instanceof Map) {
    return store.get('dependencies') || {};
  }
  if (typeof store === 'object' && store !== null) {
    return store.dependencies || store || {};
  }
  return {};
}

/**
 * Sets dependencies in ALS with robust error handling
 */
function setDepsRobustly(deps) {
  const als = global.__appAls || createRobustALS();
  const store = als.getStore();
  if (!store) {
    try {
      // If no store, create one
      als.enterWith(new Map([['testContext', {}], ['dependencies', deps]]));
      return;
    } catch (mapError) {
      try {
        // Try plain object
        als.enterWith({
          testContext: {},
          dependencies: deps
        });
        return;
      } catch (objError) {
        // Last resort
        als.enterWith(deps);
        return;
      }
    }
  }

  // Store exists, update it
  if (store instanceof Map) {
    store.set('dependencies', deps);
    return;
  }
  if (typeof store === 'object' && store !== null) {
    store.dependencies = deps;
    return;
  }
}
var _default = exports.default = {
  createRobustALS,
  runWithRobustALS,
  getDepsRobustly,
  setDepsRobustly
};