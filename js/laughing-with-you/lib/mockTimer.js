// Time mocking utilities for testing
const { addLocalDeps } = require('./asyncLocalDeps');

class MockTimer {
  constructor() {
    this.currentTime = 0;
    this.timers = [];
    this.nextTimerId = 1;
    this.originalSetTimeout = global.setTimeout;
    this.originalClearTimeout = global.clearTimeout;
    this.originalSetInterval = global.setInterval;
    this.originalClearInterval = global.clearInterval;
    this.originalDateNow = Date.now;
    this.originalPerformanceNow = performance.now;
  }

  /**
   * Install the mock timer
   */
  install() {
    // Mock setTimeout
    global.setTimeout = (callback, delay, ...args) => {
      const id = this.nextTimerId++;
      this.timers.push({
        id,
        callback,
        delay,
        args,
        time: this.currentTime + delay,
        repeat: false
      });
      return id;
    };

    // Mock clearTimeout
    global.clearTimeout = (id) => {
      this.timers = this.timers.filter(timer => timer.id !== id);
    };

    // Mock setInterval
    global.setInterval = (callback, delay, ...args) => {
      const id = this.nextTimerId++;
      this.timers.push({
        id,
        callback,
        delay,
        args,
        time: this.currentTime + delay,
        repeat: true
      });
      return id;
    };

    // Mock clearInterval
    global.clearInterval = (id) => {
      this.timers = this.timers.filter(timer => timer.id !== id);
    };

    // Mock Date.now()
    Date.now = () => this.currentTime;
    
    // Mock performance.now()
    performance.now = () => this.currentTime;
    
    // Add to local dependencies
    addLocalDeps({ mockTimer: this });
  }

  /**
   * Uninstall the mock timer
   */
  uninstall() {
    global.setTimeout = this.originalSetTimeout;
    global.clearTimeout = this.originalClearTimeout;
    global.setInterval = this.originalSetInterval;
    global.clearInterval = this.originalClearInterval;
    Date.now = this.originalDateNow;
    performance.now = this.originalPerformanceNow;
  }

  /**
   * Advance time by a specified amount of ms
   */
  advanceTime(ms) {
    this.currentTime += ms;
    
    // Find timers to run
    const timersToRun = this.timers
      .filter(timer => timer.time <= this.currentTime)
      .sort((a, b) => a.time - b.time);
    
    // Remove timers that are about to be executed
    this.timers = this.timers.filter(timer => timer.time > this.currentTime);
    
    // Execute timers
    for (const timer of timersToRun) {
      timer.callback(...timer.args);
      
      // Re-register interval timers
      if (timer.repeat) {
        this.timers.push({
          ...timer,
          time: this.currentTime + timer.delay
        });
      }
    }
  }

  /**
   * Run all pending timers
   */
  runAll() {
    while (this.timers.length > 0) {
      const nextTimer = this.timers.reduce(
        (earliest, timer) => timer.time < earliest.time ? timer : earliest,
        { time: Infinity }
      );
      
      if (nextTimer.time === Infinity) {
        break;
      }
      
      this.advanceTime(nextTimer.time - this.currentTime);
    }
  }

  /**
   * Run only pending timers that should execute before a specific time
   */
  runUntil(timestamp) {
    while (this.timers.length > 0) {
      const nextTimer = this.timers.reduce(
        (earliest, timer) => timer.time < earliest.time ? timer : earliest,
        { time: Infinity }
      );
      
      if (nextTimer.time === Infinity || nextTimer.time > timestamp) {
        break;
      }
      
      this.advanceTime(nextTimer.time - this.currentTime);
    }
    
    // Advance to final timestamp
    if (timestamp > this.currentTime) {
      this.currentTime = timestamp;
    }
  }
}

/**
 * Create and install a mock timer for testing
 */
function useMockTimer() {
  const mockTimer = new MockTimer();
  mockTimer.install();
  return mockTimer;
}

module.exports = {
  MockTimer,
  useMockTimer
};
