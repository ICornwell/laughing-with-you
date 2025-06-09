/**
 * Simple async control utilities for coordinating test setup and teardown
 */
const signals = new Map();
const cleanupFunctions = new Set();

/**
 * Wait for a signal to be triggered
 */
export function waitFor(signalName, timeout = 5000, continueOnTimeout = false) {
  //  console.log(`Waiting for signal: ${signalName} with timeout: ${timeout}ms`);
  return new Promise((resolve, reject) => {
    // Check if signal already exists
    if (signals.has(signalName) && signals.get(signalName).value !== undefined) {
      resolve(signals.get(signalName).value);
      //   console.log(`Signal ${signalName} already resolved with value:`, signals.get(signalName).value);
      return;
    }

    // Set up a waiter
    const existingSignal = signals.get(signalName) || { waiters: [] };
    existingSignal.waiters = [...(existingSignal.waiters || []), resolve];
    signals.set(signalName, existingSignal);

    // Add timeout
    const timeoutId = setTimeout(() => {
      if (!continueOnTimeout) {
        reject(new Error(`Timeout waiting for signal: ${signalName}`));
      } else {
        resolve(undefined);
      }
    }, timeout);

    // Store the timeout ID
    existingSignal.timeoutIds = [...(existingSignal.timeoutIds || []), timeoutId];
  });
}

/**
 * Signal that a condition is met
 */
export function signalDone(signalName, value, keepPreviousValue = false, removeAfterDone = false) {
  console.log(`Signaling done for: ${signalName} with value:`, value);
  const existingSignal = signals.get(signalName) || { waiters: [] };

  if (removeAfterDone) {
    // Remove the signal from the map if requested
    signals.delete(signalName);
  //  console.log(`Signal ${signalName} removed after done.`);
  }

  // Store the value
  if (!keepPreviousValue || existingSignal.value === undefined) {
    existingSignal.value = value;
  }
  // If keepValue is true, we do not overwrite the existing value
  else {
    existingSignal.value = existingSignal.value || value;
  }

  // Resolve all waiters
  (existingSignal.waiters || []).forEach(resolver => resolver(value));

  // Clear all timeouts
  (existingSignal.timeoutIds || []).forEach(timeoutId => clearTimeout(timeoutId));

   if (!removeAfterDone) {

    // Update the signal (keep the value for late waiters)
    existingSignal.waiters = [];
    existingSignal.timeoutIds = [];
    signals.set(signalName, existingSignal);
  }
}

export async function withSignalMutex(signalName, fn, timeout = 5000, maxWaits = 10) {
  if (!signalName || typeof signalName !== 'string') {
    throw new Error('Signal name must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new Error('Function must be a valid function');
  }
  const startTime = Date.now();
  let done = false;
  do {
    if (!signals.has(signalName)) {
      signals.set(signalName, { waiters: [] });
      try {
        //console.log(`${Date.now()}.Acquired mutex for signal: ${signalName}`);
        await fn()
        //await waitFor('no such signal', 2000, true); // Simulate some work
      } finally {
        console.log(`releasing mutex for signal: ${signalName}`);
        done = true;
        signalDone(signalName, true, false, true);

      }
    } else {
      console.log(`Waiting for signal: ${signalName} to be done`);
      // Wait for the signal to be done
      await waitFor(signalName, timeout / maxWaits, true);
    }
  } while (!done && (Date.now() - startTime < timeout));
}

/**
 * Reset all signals
 */
export function resetSignals() {
  // Clear all timeouts first
  for (const signal of signals.values()) {
    (signal.timeoutIds || []).forEach(timeoutId => clearTimeout(timeoutId));
  }
  signals.clear();
}

/**
 * Register a cleanup function to be run later
 */
export function registerCleanup(fn) {
  cleanupFunctions.add(fn);
  return () => cleanupFunctions.delete(fn);
}

/**
 * Run all registered cleanup functions
 */
export function runAllCleanup() {
  for (const cleanup of cleanupFunctions) {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  }
  cleanupFunctions.clear();
}

export default {
  waitFor,
  signalDone,
  withSignalMutex,
  resetSignals,
  registerCleanup,
  runAllCleanup
};