/**
 * Simple async control utilities for coordinating test setup and teardown
 */
const signals = new Map();
const cleanupFunctions = new Set();

/**
 * Wait for a signal to be triggered
 */
function waitFor(signalName, timeout = 5000) {
  console.log(`Waiting for signal: ${signalName} with timeout: ${timeout}ms`);
  return new Promise((resolve, reject) => {
    // Check if signal already exists
    if (signals.has(signalName) && signals.get(signalName).value !== undefined) {
      resolve(signals.get(signalName).value);
      console.log(`Signal ${signalName} already resolved with value:`, signals.get(signalName).value);
      return;
    }
    
    // Set up a waiter
    const existingSignal = signals.get(signalName) || { waiters: [] };
    existingSignal.waiters = [...(existingSignal.waiters || []), resolve];
    signals.set(signalName, existingSignal);
    
    // Add timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for signal: ${signalName}`));
    }, timeout);
    
    // Store the timeout ID
    existingSignal.timeoutIds = [...(existingSignal.timeoutIds || []), timeoutId];
  });
}

/**
 * Signal that a condition is met
 */
function signalDone(signalName, value, keepPreviousValue = false) {
  console.log(`Signaling done for: ${signalName} with value:`, value);
  const existingSignal = signals.get(signalName) || { waiters: [] };
  
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
  
  // Update the signal (keep the value for late waiters)
  existingSignal.waiters = [];
  existingSignal.timeoutIds = [];
  signals.set(signalName, existingSignal);
}

/**
 * Reset all signals
 */
function resetSignals() {
  // Clear all timeouts first
  for (const signal of signals.values()) {
    (signal.timeoutIds || []).forEach(timeoutId => clearTimeout(timeoutId));
  }
  signals.clear();
}

/**
 * Register a cleanup function to be run later
 */
function registerCleanup(fn) {
  cleanupFunctions.add(fn);
  return () => cleanupFunctions.delete(fn);
}

/**
 * Run all registered cleanup functions
 */
function runAllCleanup() {
  for (const cleanup of cleanupFunctions) {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  }
  cleanupFunctions.clear();
}

module.exports = {
  waitFor,
  signalDone,
  resetSignals,
  registerCleanup,
  runAllCleanup
};