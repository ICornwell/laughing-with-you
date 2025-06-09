// Test for mock timer with Jest
import { useMockTimer } from '../src/mockTimer.js';
import { setUpLocalDeps } from '../src/asyncLocalDeps.js';
import { jest } from '@jest/globals';
import { ensureALSInitialized } from './testUtils/als-utils.js';

// Check if performance is available in this environment
const hasPerformance = typeof performance !== 'undefined' && 
                      typeof performance.now === 'function';

describe('Mock Timer with Jest', () => {
  let mockTimer;
  
  beforeAll(() => {
    // Initialize the async local storage with empty dependencies
    ensureALSInitialized({});
  });
  
  beforeEach(() => {
    // Create a new mockTimer for each test
    ensureALSInitialized({}); // Ensure fresh deps for each test with proper ALS
    mockTimer = useMockTimer();
  });
  
  afterEach(() => {
    mockTimer.uninstall();
  });
  
  describe('setTimeout mocking', () => {
    test('should mock setTimeout', async () => {
      const callback = jest.fn();
      setTimeout(callback, 1000);
      
      expect(callback).not.toHaveBeenCalled();
      
      mockTimer.advanceTime(1000);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('setInterval mocking', () => {
    test('should mock setInterval', () => {
      const callback = jest.fn();
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
    test('should mock Date.now', () => {
      const initialTime = Date.now();
      mockTimer.advanceTime(1000);
      expect(Date.now()).toBe(initialTime + 1000);
    });
    
    // Only run performance tests if the API is available
    if (hasPerformance) {
      test('should mock performance.now', () => {
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
    test('should execute timers in the correct order', () => {
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
    });
  });
  
  describe('runUntil functionality', () => {
    test('should run until a specific timestamp', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      
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
    test('should handle nested timeouts correctly', () => {
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
