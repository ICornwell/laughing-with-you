"use strict";

var _testWrappers = require("../../srccjs/jest/testWrappers.js");
var _asyncLocalDeps = require("../../srccjs/asyncLocalDeps.js");
var _globals = require("@jest/globals");
var _alsUtils = require("./testUtils/als-utils.js");
// Test for Jest-specific wrapper functionality

// Jest-specific test functionality
describe('Jest-specific test wrappers', () => {
  let beforeAllCalled = false;
  let afterAllCalled = false;
  let beforeEachCalled = false;
  let afterEachCalled = false;
  const deps = {
    jestSpecific: {
      getValue: () => 'jest value'
    }
  };
  describe('Test lifecycle hooks', () => {
    // jest does not allow async functions for 'desribe' so
    // runWithLocalDeps is not used here
    // Instead, we set up the local dependencies directly
    // and use the provided hooks to test them.
    (0, _asyncLocalDeps.setUpLocalDeps)(deps);
    (0, _testWrappers.beforeAllWithLocalDeps)(() => {
      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps).toHaveProperty('jestSpecific');
      beforeAllCalled = true;
    });
    (0, _testWrappers.beforeEachWithLocalDeps)(() => {
      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps).toHaveProperty('jestSpecific');
      beforeEachCalled = true;
    });
    (0, _testWrappers.afterEachWithLocalDeps)(() => {
      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps).toHaveProperty('jestSpecific');
      afterEachCalled = true;
    });
    (0, _testWrappers.afterAllWithLocalDeps)(() => {
      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps).toHaveProperty('jestSpecific');
      afterAllCalled = true;
    });
    (0, _testWrappers.itWithLocalDeps)('should execute all lifecycle hooks', () => {
      expect(beforeAllCalled).toBe(true);
      expect(beforeEachCalled).toBe(true);
      // Cannot test after hooks here

      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps).toHaveProperty('jestSpecific');
      expect(deps.jestSpecific.getValue()).toBe('jest value');
    });

    // Use a separate test to verify that afterEach was called
    it('should verify afterEach was called', () => {
      expect(afterEachCalled).toBe(true);
    });
  });

  // After the describe block completes, afterAll should have been called
  it('should verify afterAll was called', () => {
    expect(afterAllCalled).toBe(true);
  });

  // Test passing custom dependencies
  describe('Custom dependencies in tests', () => {
    (0, _asyncLocalDeps.runWithLocalDeps)({
      customValue: 42,
      vitestSpecific: {
        getValue: () => 'vitest value'
      }
    }, () => (0, _testWrappers.itWithLocalDeps)('should support custom dependencies per test', () => {
      const customValue = (0, _asyncLocalDeps.getLocalDeps)().customValue;
      expect(customValue).toBeDefined();
      expect(customValue).toBe(42);

      // Original deps should still be available
      const deps = (0, _asyncLocalDeps.getLocalDeps)();
      expect(deps.jestSpecific).toBeDefined();
    }, {
      customValue: 42
    }));
  });
});