"use strict";

var {addLocalDeps} = require("./asyncLocalDeps");
// Time mocking utilities for testing
// This module has been updated to work in both browser and CI environments,
// handling cases where performance.now might be read-only or not available

/**
 * Create and install a mock timer for testing
 */
function useMockTimer() {
  // Private state
  let currentTime = 0;
  let timers = [];
  let nextTimerId = 1;

  // Store original timer functions
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  const originalDateNow = Date.now;

  // Check if performance is available in this environment
  let originalPerformanceNow;
  let hasPerformance = typeof performance !== 'undefined' && typeof performance.now === 'function';
  if (hasPerformance) {
    try {
      originalPerformanceNow = performance.now;
    } catch (e) {
      // In some environments, accessing performance.now might throw
      hasPerformance = false;
    }
  }

  // Create the timer API
  const mockTimer = {
    /**
     * Install the mock timer
     */
    install() {
      // Mock setTimeout
      global.setTimeout = (callback, delay, ...args) => {
        const id = nextTimerId++;
        timers.push({
          id,
          callback,
          delay,
          args,
          time: currentTime + delay,
          repeat: false
        });
        return id;
      };

      // Mock clearTimeout
      global.clearTimeout = id => {
        timers = timers.filter(timer => timer.id !== id);
      };

      // Mock setInterval
      global.setInterval = (callback, delay, ...args) => {
        const id = nextTimerId++;
        timers.push({
          id,
          callback,
          delay,
          args,
          time: currentTime + delay,
          repeat: true
        });
        return id;
      };

      // Mock clearInterval
      global.clearInterval = id => {
        timers = timers.filter(timer => timer.id !== id);
      };

      // Mock Date.now()
      try {
        Object.defineProperty(Date, 'now', {
          value: () => currentTime,
          writable: true,
          configurable: true
        });
      } catch (error) {
        // Fallback to direct assignment if defining property fails
        Date.now = () => currentTime;
      }

      // Mock performance.now()
      // Only attempt to mock performance.now if it exists
      if (hasPerformance) {
        try {
          // Use Object.defineProperty for read-only properties
          Object.defineProperty(performance, 'now', {
            value: () => currentTime,
            writable: true,
            configurable: true
          });
        } catch (error) {
          // In some environments (like CI), performance might be non-configurable
          console.warn('Could not mock performance.now:', error.message);
          // We still want to continue with the rest of the functionality
        }
      }

      // Add to local dependencies
      addLocalDeps({
        mockTimer
      });
    },
    /**
     * Uninstall the mock timer
     */
    uninstall() {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;

      // Restore Date.now carefully
      try {
        Object.defineProperty(Date, 'now', {
          value: originalDateNow,
          writable: true,
          configurable: true
        });
      } catch (error) {
        // Fallback to direct assignment
        Date.now = originalDateNow;
      }

      // Only attempt to restore performance.now if it exists
      if (hasPerformance && originalPerformanceNow) {
        try {
          // Restore original performance.now
          Object.defineProperty(performance, 'now', {
            value: originalPerformanceNow,
            writable: true,
            configurable: true
          });
        } catch (error) {
          // If we couldn't mock it initially, we don't need to restore it
          console.warn('Could not restore performance.now:', error.message);
        }
      }
    },
    /**
     * Advance time by a specified amount of ms
     */
    advanceTime(ms) {
      const originalTime = currentTime;
      currentTime += ms;

      // Find timers to run
      const timersToRun = timers.filter(timer => timer.time <= currentTime).sort((a, b) => a.time - b.time);

      // Remove timers that are about to be executed
      // that is - keep the future ones!
      timers = timers.filter(timer => timer.time > currentTime);

      // Execute timers
      for (const timer of timersToRun) {
        timer.callback(...timer.args);

        // Repeat if needed, and re-register interval timers
        if (timer.repeat) {
          // repeated delays may have more than one trigger in the interval
          const repeats = Math.floor(ms / timer.delay);
          // one call is already done, so start from 1 not 0
          // nb for (i=1;i<1;i++) runs for 0 iterations, that is, not at all
          for (let i = 1; i < repeats; i++) {
            timer.callback(...timer.args);
          }
          timers.push({
            ...timer,
            time: currentTime + timer.delay
          });
        }
      }
      return mockTimer;
    },
    /**
     * Run all pending timers
     */
    runAll() {
      while (timers.length > 0) {
        const nextTimer = timers.reduce((earliest, timer) => timer.time < earliest.time ? timer : earliest, {
          time: Infinity
        });
        if (nextTimer.time === Infinity) {
          break;
        }
        this.advanceTime(nextTimer.time - currentTime);
      }
      return mockTimer;
    },
    /**
     * Run only pending timers that should execute before a specific time
     */
    runUntil(timestamp) {
      while (timers.length > 0) {
        const nextTimer = timers.reduce((earliest, timer) => timer.time < earliest.time ? timer : earliest, {
          time: Infinity
        });
        if (nextTimer.time === Infinity || nextTimer.time > timestamp) {
          break;
        }
        this.advanceTime(nextTimer.time - currentTime);
      }

      // Advance to final timestamp
      if (timestamp > currentTime) {
        currentTime = timestamp;
      }
      return mockTimer;
    },
    /**
     * Get the current mock time
     */
    getTime() {
      return currentTime;
    },
    /**
     * Reset the mock timer
     */
    reset() {
      currentTime = 0;
      timers = [];
      return mockTimer;
    }
  };

  // Install on creation
  mockTimer.install();
  return mockTimer;
}
module.exports = {
  useMockTimer
};