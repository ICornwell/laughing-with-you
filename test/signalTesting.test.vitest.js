// Test for signal testing
import { createSignalTestEnv, createSignalTest } from '../src/signalTesting';
import { setUpLocalDeps, getLocalDeps } from '../src/asyncLocalDeps';
import { waitFor, signalDone } from '../src/waitForSignals';

describe('Signal Testing', () => {
  beforeAll(() => {
    // Initialize the async local storage with empty dependencies
    setUpLocalDeps();
  });
  
  beforeEach(() => {
    // Reset all signals
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  it('should create a signal environment with handler methods', () => {
    const signalHandler = createSignalTestEnv();
    
    expect(signalHandler).toHaveProperty('wait');
    expect(signalHandler).toHaveProperty('signal');
    expect(signalHandler).toHaveProperty('createWaiter');
    expect(signalHandler).toHaveProperty('reset');
    
    // Check if it was added to local dependencies
    expect(getLocalDeps().signals).toBe(signalHandler);
  });
  
  it('should wait for and receive signals', async () => {
    const signalHandler = createSignalTestEnv();
    const signalName = 'testSignal';
    const signalValue = { data: 'test data' };
    
    // Create a promise that waits for the signal
    const waitPromise = signalHandler.wait(signalName, 1000);
    
    // Signal that the condition has been met
    signalHandler.signal(signalName, signalValue);
    
    // Wait for the signal
    const result = await waitPromise;
    
    expect(result).toEqual(signalValue);
  });
  
  it('should create a waiter that resolves when signaled', async () => {
    const signalHandler = createSignalTestEnv();
    const signalName = 'waiterTest';
    
    // Create a waiter
    const waiterPromise = signalHandler.createWaiter(signalName, 1000);
    
    // Signal in the future
    setTimeout(() => {
      signalHandler.signal(signalName, 'waiter result');
    }, 10);
    
    // Wait for the result
    const result = await waiterPromise;
    expect(result).toBe('waiter result');
  });
  
  it('should reset all signals and waiters', async () => {
    const signalHandler = createSignalTestEnv();
    
    // Create some waiters
    const waiter1 = signalHandler.createWaiter('signal1', 1000);
    
    // Signal it
    signalHandler.signal('signal1', 'done');
    
    // Value should be "done"
    expect(await waiter1).toBe('done');
    
    // Reset all signals (this should clear the internal state)
    signalHandler.reset();
    
    // Signal with a new value after reset
    signalHandler.signal('signal1', 'new value');
    
    // Create a new waiter for the same signal name
    const waiter2 = signalHandler.createWaiter('signal1', 1000);
    
    // It should get the new value, not the old one
    expect(await waiter2).toBe('new value');
  });
  
  it('should create a test that waits for a signal', async () => {
    // Create a signal test
    const testFn = vi.fn().mockImplementation(async () => {
      // Get the signals from dependencies
      const signals = getLocalDeps().signals;
      
      // Signal completion in the future
      setTimeout(() => {
        signals.signal('testComplete', 'test result');
      }, 10);
      
      return 'function result';
    });
    
    // Create the signal test
    const signalTest = createSignalTest(testFn, 'testComplete', 1000);
    
    // Run the test
    const result = await signalTest();
    
    // Test function should have been called
    expect(testFn).toHaveBeenCalled();
    
    // The result should be the function's return value
    expect(result).toBe('function result');
  });
});
