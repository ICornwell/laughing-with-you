// Signal-based testing utilities
import { getLocalDeps, addLocalDeps } from './asyncLocalDeps';
import { waitFor, signalDone } from './waitForSignals';

/**
 * Create a signal-based test environment
 * This helps with testing asynchronous code that needs coordination
 */
export function createSignalTestEnv() {
  const signals = {};
  const waiters = {};
  
  // Create signal handler
  const signalHandler = {
    // Wait for a signal to be triggered
    wait: async (signalName, timeout = 5000) => {
      return waitFor(signalName, timeout);
    },
    
    // Signal that a condition has been met
    signal: (signalName, value) => {
      signalDone(signalName, value);
      return value;
    },
    
    // Create a signal waiter that can be used as a promise
    createWaiter: (signalName, timeout = 5000) => {
      if (!waiters[signalName]) {
        waiters[signalName] = waitFor(signalName, timeout);
      }
      return waiters[signalName];
    },
    
    // Reset all signals and waiters
    reset: () => {
      Object.keys(waiters).forEach(key => {
        signalDone(key, null);
      });
      Object.keys(signals).forEach(key => {
        delete signals[key];
      });
      Object.keys(waiters).forEach(key => {
        delete waiters[key];
      });
    }
  };
  
  // Add to local dependencies
  addLocalDeps({ signals: signalHandler }, true);
  
  return signalHandler;
}

/**
 * Create a test that waits for a specific signal before completing
 */
export function createSignalTest(testFn, signalName, timeout = 5000) {
  return async (...args) => {
    const signalHandler = createSignalTestEnv();
    
    // Create a promise that waits for the signal
    const signalPromise = signalHandler.createWaiter(signalName, timeout);
    
    // Run the test function
    const result = await testFn(...args);
    
    // Wait for the signal
    await signalPromise;
    
    return result;
  };
}

export default {
  createSignalTestEnv,
  createSignalTest
};
