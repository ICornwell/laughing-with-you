"use strict";

var _signalTesting = require("../../srccjs/signalTesting.cjs");
var _asyncLocalDeps = require("../../srccjs/asyncLocalDeps.cjs");
var _alsUtils = require("./testUtils/als-utils.cjs");
var _globals = require("@jest/globals");
/**
 * Example of how to use the jest-als-helper to make tests work with proper ALS initialization
 * without modifying the core codebase
 */

// Option 1: Use the describeWithALS helper for the entire suite
(0, _alsUtils.describeWithALS)('Signal Testing Example (With ALS Helper)', {
  // Initial dependencies for all tests
  initialValue: 'test'
}, () => {
  test('should create a signal environment with handler methods', () => {
    const signalHandler = (0, _signalTesting.createSignalTestEnv)();

    // Test can use ALS without errors
    expect(signalHandler).toHaveProperty('wait');
    expect(signalHandler).toHaveProperty('signal');
    expect((0, _asyncLocalDeps.getLocalDeps)().signals).toBe(signalHandler);
  });
});

// Option 2: Use beforeAll/beforeEach with ensureALSInitialized
describe('Signal Testing Example (Manual Initialization)', () => {
  beforeAll(() => {
    // Initialize ALS once for all tests
    (0, _alsUtils.ensureALSInitialized)({
      setupValue: 'initialized in beforeAll'
    });
  });
  test('should access ALS without errors', () => {
    const deps = (0, _asyncLocalDeps.getLocalDeps)();
    expect(deps).toHaveProperty('setupValue');

    // Can modify deps
    deps.testValue = 'modified in test';
  });

  // This test will see changes from the previous test if they share the ALS context
  test('should see if ALS context is shared between tests', () => {
    const deps = (0, _asyncLocalDeps.getLocalDeps)();
    console.log('Deps in second test:', deps);
  });
});

// Option 3: Wrap individual tests with withALS
describe('Signal Testing Example (Individual Test Wrapping)', () => {
  test('should wrap test function with ALS initialization', (0, _alsUtils.withALS)(() => {
    const signalHandler = (0, _signalTesting.createSignalTestEnv)();
    expect(signalHandler).toHaveProperty('wait');

    // Can access the deps that were passed to withALS
    const deps = (0, _asyncLocalDeps.getLocalDeps)();
    expect(deps).toHaveProperty('wrappedTest');
  }, {
    wrappedTest: 'test value'
  })); // These deps are available in the test
});