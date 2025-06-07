/**
 * Example of how to use the vitest-als-helper to make tests work with proper ALS initialization
 * without modifying the core codebase
 */
import { createSignalTestEnv } from '../src/signalTesting.js';
import { getLocalDeps } from '../src/asyncLocalDeps.js';
import { ensureALSInitialized, withALS, describeWithALS } from './testUtils/vitest-als-helper.js';
import { describe, test, expect, vi, beforeAll } from 'vitest';

// Option 1: Use the describeWithALS helper for the entire suite
describeWithALS('Signal Testing Example (With ALS Helper)', {
  // Initial dependencies for all tests
  initialValue: 'test'
}, () => {
  test('should create a signal environment with handler methods', () => {
    const signalHandler = createSignalTestEnv();
    
    // Test can use ALS without errors
    expect(signalHandler).toHaveProperty('wait');
    expect(signalHandler).toHaveProperty('signal');
    expect(getLocalDeps().signals).toBe(signalHandler);
  });
});

// Option 2: Use beforeAll/beforeEach with ensureALSInitialized
describe('Signal Testing Example (Manual Initialization)', () => {
  beforeAll(() => {
    // Initialize ALS once for all tests
    ensureALSInitialized({
      setupValue: 'initialized in beforeAll'
    });
  });
  
  test('should access ALS without errors', () => {
    const deps = getLocalDeps();
    expect(deps).toHaveProperty('setupValue');
    
    // Can modify deps
    deps.testValue = 'modified in test';
  });
  
  // This test will see changes from the previous test if they share the ALS context
  test('should see if ALS context is shared between tests', () => {
    const deps = getLocalDeps();
    console.log('Deps in second test:', deps);
  });
});

// Option 3: Wrap individual tests with withALS
describe('Signal Testing Example (Individual Test Wrapping)', () => {
  test('should wrap test function with ALS initialization', withALS(() => {
    const signalHandler = createSignalTestEnv();
    expect(signalHandler).toHaveProperty('wait');
    
    // Can access the deps that were passed to withALS
    const deps = getLocalDeps();
    expect(deps).toHaveProperty('wrappedTest');
  }, { wrappedTest: 'test value' })); // These deps are available in the test
});
