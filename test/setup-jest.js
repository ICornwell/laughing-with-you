// Setup file for Jest tests
import { AsyncLocalStorage, executionAsyncId } from 'node:async_hooks';
import { setUpLocalDeps } from '../src/asyncLocalDeps.js';
import { jest } from '@jest/globals';

const eid = executionAsyncId()

global.jest = jest// Ensure AsyncLocalStorage is properly initialized for Jest tests
if (!global.__appAls) {
  global.__appAls = new AsyncLocalStorage();
  console.log('Jest setup: AsyncLocalStorage initialized');
}

// Initialize empty dependencies
setUpLocalDeps();

// Handle modules that may have default vs named exports differently in Jest
const fixImportCompat = () => {
  // Fix potential modules that might be imported differently in Jest vs Vitest
  const moduleFixers = {
    // Add any modules that need fixing here
  };
  
  // Apply the fixes
  for (const [modulePath, fixer] of Object.entries(moduleFixers)) {
    try {
      fixer();
    } catch (err) {
      console.error(`Error fixing module ${modulePath}:`, err);
    }
  }
};

fixImportCompat();

// Ensure Jest-specific globals and utilities are available
if (typeof global.jest === 'undefined') {
  console.log('Jest setup: Real Jest globals not found. This might indicate a configuration issue.');
  console.warn('Make sure to run tests with Jest and not directly with Node.');
} else {
  console.log('Jest setup: Using native Jest environment');
  
  // Ensure stringContaining works correctly
  if (!global.expect.stringContaining) {
    console.log('Jest setup: Adding missing stringContaining matcher');
    global.expect.stringContaining = (string) => ({
      asymmetricMatch: actual => typeof actual === 'string' && actual.includes(string),
      toString: () => `StringContaining(${string})`,
      toJSON: () => `StringContaining(${string})`
    });
  }
}
