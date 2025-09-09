/**
 * Diagnostics for understanding Jest's AsyncLocalStorage behavior
 * This test file explores how AsyncLocalStorage behaves across different test phases
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { getLocalDeps, setUpLocalDeps, runWithLocalDeps } from '../../src/asyncLocalDeps.js';

// Setup import for Jest
// import { jest } from '@jest/globals';

// Utility for displaying ALS state
function logALSState(location) {
  const globalALS = global.__appAls;
  const alsExists = !!globalALS;
  const alsStore = globalALS ? globalALS.getStore() : null;
  const deps = getLocalDeps(true); // pass true to suppress errors
  
  console.log(`[ALS Diagnostic] ${location}:`);
  console.log(`  - global.__appAls exists: ${alsExists}`);
  console.log(`  - ALS store exists: ${!!alsStore}`);
  console.log(`  - getLocalDeps() returns: ${deps ? JSON.stringify(deps) : 'null'}`);
  console.log(`  - global.__appAls === previous reference: ${globalALS === previousALS}`);
  
  // Save reference for next comparison
  previousALS = globalALS;
}

// Track the ALS reference across test phases
let previousALS = null;

describe('AsyncLocalStorage Test Diagnostics - Outer Suite', () => {
  beforeAll(() => {
    console.log("\n=== STARTING DIAGNOSTIC TESTS ===\n");
    logALSState('beforeAll - Outer Suite - Initial state');
  });
  
  beforeEach(() => {
    logALSState('beforeEach - Outer Suite');
  });
  
  afterEach(() => {
    logALSState('afterEach - Outer Suite');
  });
  
  afterAll(() => {
    logALSState('afterAll - Outer Suite');
  });
  
  test('Basic test with no ALS initialization', () => {
    logALSState('Test 1 - No explicit initialization');
  });
  
  test('Test with explicit setUpLocalDeps call', () => {
    logALSState('Test 2 - Before setUpLocalDeps');
    setUpLocalDeps({ testValue: 'initialized in test 2' });
    logALSState('Test 2 - After setUpLocalDeps');
  });
  
  test('Test after previous initialization', () => {
    logALSState('Test 3 - Checking if initialization persists between tests');
  });
  
  describe('Nested test suite', () => {
    beforeAll(() => {
      logALSState('beforeAll - Nested Suite');
    });
    
    beforeEach(() => {
      logALSState('beforeEach - Nested Suite');
    });
    
    test('Nested test - checking ALS inheritance', () => {
      logALSState('Nested Test - Before initialization');
      setUpLocalDeps({ nestedValue: 'initialized in nested test' });
      logALSState('Nested Test - After initialization');
    });
    
    afterEach(() => {
      logALSState('afterEach - Nested Suite');
    });
    
    afterAll(() => {
      logALSState('afterAll - Nested Suite');
    });
  });
  
  test('Test with runWithLocalDeps', async () => {
    logALSState('Test 4 - Before runWithLocalDeps');
    
    await runWithLocalDeps({ runValue: 'inside run context' }, () => {
      logALSState('Test 4 - Inside runWithLocalDeps callback');
      return Promise.resolve();
    });
    
    logALSState('Test 4 - After runWithLocalDeps');
  });
  
  test('Test direct manipulation of global.__appAls', () => {
    logALSState('Test 5 - Before ALS manipulation');
    
    if (!global.__appAls) {
      console.log('  - Creating new global.__appAls');
      global.__appAls = new AsyncLocalStorage();
    }
    
    global.__appAls.run(new Map([['testContext', {}], ['dependencies', { directValue: 'direct' }]]), () => {
      logALSState('Test 5 - Inside global.__appAls.run callback');
    });
    
    logALSState('Test 5 - After ALS manipulation');
  });
});

// A second top-level describe to check if ALS persists between describe blocks
describe('AsyncLocalStorage Test Diagnostics - Second Suite', () => {
  beforeAll(() => {
    logALSState('beforeAll - Second Suite');
  });
  
  test('Test in second suite to check persistence', () => {
    logALSState('Test in second suite - checking if ALS persists across suites');
  });
  
  afterAll(() => {
    console.log("\n=== DIAGNOSTIC TESTS COMPLETED ===\n");
  });
});
