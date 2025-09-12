"use strict";

var {useMockTimer} = require("../../srccjs/mockTimer.cjs");

var {testWithLocalDeps,
   beforeAllWithLocalDeps, beforeEachWithLocalDeps,
  afterEachWithLocalDeps} = require("../../srccjs/jest/testWrappers.cjs");
var globals = require("@jest/globals");
var alsUtils = require("./testUtils/als-utils.cjs");
var {executionAsyncId} = require("node:async_hooks");
const { getLocalDeps } = require("../../srccjs/asyncLocalDeps.cjs");
// Test for mock timer with Jest

// Check if performance is available in this environment
const hasPerformance = typeof performance !== 'undefined' && typeof performance.now === 'function';
console.log(`mt module has eid: ${executionAsyncId()}`);
describe('Mock Timer with Jest', () => {
  
  console.log(`mt describe has eid: ${executionAsyncId()}`);
  beforeAllWithLocalDeps(() => {
    // Initialize the async local storage with empty dependencies
    console.log(`mt ba has eid: ${executionAsyncId()}`);
    alsUtils.ensureALSInitialized({});
  }, -1);
  beforeEachWithLocalDeps(() => {
    // Create a new mockTimer for each test
    console.log(`mt be has eid: ${executionAsyncId()}, ts:${Date.now() }`);
    const mockTimer = useMockTimer();
    mockTimer.install(); // Install the mock timer - adds to localDeps
    console.log(`be done, eid: ${executionAsyncId()}, ts:${Date.now() }`);
  }, -1);
  afterEachWithLocalDeps(() => {
    console.log(`mt ae has eid: ${executionAsyncId()}`);
    const mockTimer = getLocalDeps().mockTimer;
    mockTimer.uninstall();
  },-1);
  describe('setTimeout mocking', () => {
    console.log(`mt describe2 has eid: ${executionAsyncId()}`);
    testWithLocalDeps('should mock setTimeout', async () => {
      const mockTimer = getLocalDeps().mockTimer;
      console.log(`mt test has eid: ${executionAsyncId()}`);
      const callback = globals.jest.fn();
      setTimeout(callback, 1000);
      expect(callback).not.toHaveBeenCalled();
      mockTimer.advanceTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
  describe('setInterval mocking', () => {
    testWithLocalDeps('should mock setInterval', () => {
      const mockTimer = getLocalDeps().mockTimer;
      const callback = globals.jest.fn();
      const id = setInterval(callback, 500);

      // Advance time multiple times
      mockTimer.advanceTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
      mockTimer.advanceTime(500);
      expect(callback).toHaveBeenCalledTimes(2);
      mockTimer.advanceTime(1000);
      expect(callback).toHaveBeenCalledTimes(4);
      clearInterval(id);
      mockTimer.advanceTime(500);
      expect(callback).toHaveBeenCalledTimes(4); // Should not increase
    });
  });
  describe('Date and performance API mocking', () => {
    testWithLocalDeps('should mock Date.now', () => {
      const mockTimer = getLocalDeps().mockTimer;
      const initialTime = Date.now();
      mockTimer.advanceTime(1000);
      expect(Date.now()).toBe(initialTime + 1000);
    });

    // Only run performance tests if the API is available
    if (hasPerformance) {
      testWithLocalDeps('should mock performance.now', () => {
        const mockTimer = getLocalDeps().mockTimer;
        const initialPerf = performance.now();
        mockTimer.advanceTime(1000);
        expect(performance.now()).toBe(initialPerf + 1000);
      });
    } else {
      test.skip('should mock performance.now - SKIPPED (performance API not available)', () => {
        // This test will be skipped when performance is not available
      });
    }
  });
  describe('Timer execution order', () => {
    testWithLocalDeps('should execute timers in the correct order', () => {
      const mockTimer = getLocalDeps().mockTimer;
      const results = [];
      setTimeout(() => {
        results.push('timeout 1');
      }, 100);
      setTimeout(() => {
        results.push('timeout 2');
      }, 50);
      setTimeout(() => {
        results.push('timeout 3');
      }, 200);

      // Running all should execute in the correct order
      mockTimer.runAll();
      expect(results).toEqual(['timeout 2', 'timeout 1', 'timeout 3']);
    },-1);
  });
  describe('runUntil functionality', () => {
    testWithLocalDeps('should run until a specific timestamp', () => {
      const mockTimer = getLocalDeps().mockTimer;
      const callback1 = globals.jest.fn();
      const callback2 = globals.jest.fn();
      const callback3 = globals.jest.fn();
      setTimeout(callback1, 50);
      setTimeout(callback2, 100);
      setTimeout(callback3, 200);

      // Run until 150ms
      mockTimer.runUntil(150);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).not.toHaveBeenCalled();

      // Current time should be advanced to exactly 150
      expect(Date.now()).toBe(150);
    });
  });
  describe('Nested timeouts', () => {
    testWithLocalDeps('should handle nested timeouts correctly', () => {
      const mockTimer = getLocalDeps().mockTimer;
      const results = [];
      setTimeout(() => {
        results.push('outer');
        setTimeout(() => {
          results.push('inner');
        }, 100);
      }, 100);
      mockTimer.advanceTime(100);
      expect(results).toEqual(['outer']);
      mockTimer.advanceTime(100);
      expect(results).toEqual(['outer', 'inner']);
    });
  });
});