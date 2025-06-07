// Test for mock timer
import { useMockTimer } from '../src/mockTimer';
import { setUpLocalDeps } from '../src/asyncLocalDeps';

function createCallbackHandler() {
    let hasBeenCalled = false;
    let callCount = 0;

    return {
      callback: function () {
        hasBeenCalled = true;
        callCount++;
      },
      hasBeenCalled: () => hasBeenCalled,
      callCount: () => callCount
    }
  }

describe('Mock Timer', () => {
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

  describe('setTimeout mocking', () => {
    it('should mock setTimeout', async () => {
      const callbackHandler = createCallbackHandler();
      const callback = callbackHandler.callback;
      setTimeout(callback, 1000);

      expect(callbackHandler.hasBeenCalled()).toBe(false);

      mockTimer.advanceTime(1000);

      expect(callbackHandler.callCount()).toEqual(1);
    });
  });

  describe('setInterval mocking', () => {
    it('should mock setInterval', () => {
      const callbackHandler = createCallbackHandler();
      const callback = callbackHandler.callback;
      const id = setInterval(callback, 500);

      // Advance time multiple times
      mockTimer.advanceTime(500);
      expect(callbackHandler.callCount()).toEqual(1);

      mockTimer.advanceTime(500);
      expect(callbackHandler.callCount()).toEqual(2);
      // Advancing by 1000ms should trigger callbacks at 1000ms and 1500ms (2 more times)
      mockTimer.advanceTime(2000);
      expect(callbackHandler.callCount()).toEqual(6);
      mockTimer.advanceTime(2000);
      expect(callbackHandler.callCount()).toEqual(10);

      clearInterval(id);
      mockTimer.advanceTime(500);
      expect(callbackHandler.callCount()).toEqual(10); // Should not increase
    });
  });

  describe('Date and performance API mocking', () => {
    it('should mock Date.now and performance.now', () => {
      const initialTime = Date.now();
      const initialPerf = performance.now();

      mockTimer.advanceTime(1000);

      expect(Date.now()).toBe(initialTime + 1000);
      expect(performance.now()).toBe(initialPerf + 1000);
    });
  });

  describe('Timer execution order', () => {
    it('should execute timers in the correct order', () => {
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
    it('should run until a specific timestamp', () => {
      const callbackHandler1 = createCallbackHandler();
      const callbackHandler2 = createCallbackHandler();
      const callbackHandler3 = createCallbackHandler();


      setTimeout(callbackHandler1.callback, 50);
      setTimeout(callbackHandler2.callback, 100);
      setTimeout(callbackHandler3.callback, 200);

      // Run until 150ms
      mockTimer.runUntil(150);

      expect(callbackHandler1.callCount()).toEqual(1);
      expect(callbackHandler2.callCount()).toEqual(1);
      expect(callbackHandler3.hasBeenCalled()).toBe(false);

      // Current time should be advanced to exactly 150
      expect(Date.now()).toBe(150);
    });
  });

  describe('Nested timeouts', () => {
    it('should handle nested timeouts correctly', () => {
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

  describe('Uninstallation', () => {
    it('should uninstall correctly', () => {
      // Store references to the mocked functions
      const mockedSetTimeout = global.setTimeout;
      const mockedClearTimeout = global.clearTimeout;

      mockTimer.uninstall();

      // After uninstallation, they should be different functions
      expect(global.setTimeout).not.toBe(mockedSetTimeout);
      expect(global.clearTimeout).not.toBe(mockedClearTimeout);
    });
  });
});

describe('useMockTimer helper', () => {
  describe('Factory function', () => {
    it('should create and install a mock timer', () => {
      const mockTimer = useMockTimer();
      const callbackHandler1 = createCallbackHandler();
      const callback = callbackHandler1.callback;
      setTimeout(callback, 100);

      mockTimer.advanceTime(100);
      expect(callbackHandler1.hasBeenCalled()).toBe(true);

      mockTimer.uninstall();
    });
  });
});
