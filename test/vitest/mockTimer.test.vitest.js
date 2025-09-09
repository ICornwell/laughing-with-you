// Test for mock timer with Vitest
import { useMockTimer } from '../../src/mockTimer';
import { setUpLocalDeps } from '../../src/asyncLocalDeps';
import { describe, test, expect, vi, beforeAll, beforeEach, afterEach, it } from 'vitest';

// Check if performance is available in this environment
const hasPerformance = typeof performance !== 'undefined' && 
                      typeof performance.now === 'function';

describe('Mock Timer with Vitest', () => {
  let mockTimer;
  
  beforeAll(() => {
    // Initialize the async local storage with empty dependencies
    setUpLocalDeps();
  });
  
  beforeEach(() => {
    mockTimer = useMockTimer();
  });
  
  afterEach(() => {
    mockTimer.uninstall();
  });
  
  describe('Vitest-specific timer mocking', () => {
    it('should allow setting timeout in milliseconds', () => {
      const callback = vi.fn();
      const timeoutId = setTimeout(callback, 1000);
      
      expect(typeof timeoutId).toBe('number');
      expect(callback).not.toHaveBeenCalled();
      
      mockTimer.advanceTime(500);
      expect(callback).not.toHaveBeenCalled();
      
      mockTimer.advanceTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

     test('should mock setInterval, multi callbacks for intervals x(2+) delay', () => {
          const callback = vi.fn();
          const id = setInterval(callback, 500);
          
          // Advance time multiple times
          mockTimer.advanceTime(500);
          expect(callback).toHaveBeenCalledTimes(1);
          
          mockTimer.advanceTime(500);
          expect(callback).toHaveBeenCalledTimes(2);
          // two more calls for twice the delay
          mockTimer.advanceTime(1000);
          expect(callback).toHaveBeenCalledTimes(4);
          // four more calls for four times the delay
          mockTimer.advanceTime(2000);
          expect(callback).toHaveBeenCalledTimes(8);
          
          clearInterval(id);
          mockTimer.advanceTime(2000);
          // interval cleared so no more calls
          expect(callback).toHaveBeenCalledTimes(8); // Should not increase
        });
    
    it('should handle Vitest timers and spies correctly', () => {
      // Using our mockTimer instead of vi's timers
      // Don't call vi.useFakeTimers() as it conflicts with our implementation
      
      const callback = vi.fn();
      setTimeout(callback, 1000);
      
      mockTimer.advanceTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  
  
  describe('Combining mockTimer with Vitest features', () => {
    it('should work with Vitest mocks and spies', () => {
      const obj = {
        method: () => 'original'
      };
      
      const spy = vi.spyOn(obj, 'method');
      
      setTimeout(() => {
        obj.method();
      }, 1000);
      
      expect(spy).not.toHaveBeenCalled();
      
      mockTimer.advanceTime(1000);
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle Vitest async utilities', async () => {
      const promiseFn = vi.fn().mockResolvedValue('result');
      
      setTimeout(() => {
        promiseFn();
      }, 1000);
      
      mockTimer.advanceTime(1000);
      
      // Wait for promises to resolve
      await vi.waitFor(() => {
        expect(promiseFn).toHaveBeenCalledTimes(1);
      });
    });
  });
  
  describe('Date and performance API mocking', () => {
    it('should mock Date.now', () => {
      const initialTime = Date.now();
      mockTimer.advanceTime(1000);
      expect(Date.now()).toBe(initialTime + 1000);
    });
    
    // Only run performance tests if the API is available
    if (hasPerformance) {
      it('should mock performance.now', () => {
        const initialPerf = performance.now();
        mockTimer.advanceTime(1000);
        expect(performance.now()).toBe(initialPerf + 1000);
      });
    } else {
      it.skip('should mock performance.now - SKIPPED (performance API not available)', () => {
        // This test will be skipped when performance is not available
      });
    }
  });
});
