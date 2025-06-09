/**
 * End-to-end test helpers that combine multiple utilities
 */
import utils from './index';
const {
  getLocalDeps, setUpLocalDeps, createResourceManager, useMockTimer, createSnapshot, createLogger, LogLevel
} = utils;

/**
 * Create an E2E test environment
 */
export function createE2ETestEnvironment(options = {}) {
  // Initialize resources and tools
  const resources = createResourceManager();
  const snapshot = createSnapshot();
  const logger = createLogger({
    level: options.logLevel || LogLevel.INFO,
    prefix: options.name || 'E2ETest'
  });
  
  // Initialize mock timer if needed
  let mockTimer = null;
  if (options.mockTime !== false) {
    mockTimer = useMockTimer();
  }
  
  // State tracking
  const state = {
    name: options.name || 'unnamed-test',
    isSetUp: false,
    isTornDown: false
  };
  
  // Optional initial dependencies
  const initialDeps = options.dependencies || {};
  
  // Create the environment API
  const env = {
    // Expose core components
    resources,
    snapshot,
    logger,
    mockTimer,
    state,
    initialDeps,
    
    /**
     * Set up the test environment
     */
    async setup() {
      if (state.isSetUp) {
        logger.warn('Test environment already set up');
        return env;
      }
      
      logger.debug('Setting up test environment', { name: state.name });
      
      // Set up dependencies
      setUpLocalDeps({
        ...initialDeps,
        logger,
        testResources: resources,
        testEnv: env
      });
      
      // Take a snapshot of initial state
      snapshot.capture();
      
      state.isSetUp = true;
      logger.debug('Test environment set up complete');
      
      return env;
    },
    
    /**
     * Tear down the test environment
     */
    async teardown() {
      if (state.isTornDown) {
        logger.warn('Test environment already torn down');
        return;
      }
      
      logger.debug('Tearing down test environment', { name: state.name });
      
      // Clean up resources
      await resources.cleanupAll();
      
      // Restore original dependencies
      snapshot.restore();
      
      // Clean up mock timer if used
      if (mockTimer) {
        mockTimer.uninstall();
      }
      
      state.isTornDown = true;
      logger.debug('Test environment tear down complete');
    },
    
    /**
     * Register a resource for cleanup
     */
    registerResource(resource, cleanupFn) {
      return resources.add(resource, cleanupFn);
    },
    
    /**
     * Create a helper function that sets up and tears down the environment
     */
    createFixture(setupFn, teardownFn) {
      return async (...args) => {
        // Set up base environment
        await env.setup();
        
        try {
          // Run custom setup if provided
          if (setupFn) {
            await setupFn(...args);
          }
          
          // Return a cleanup function
          return async () => {
            try {
              // Run custom teardown if provided
              if (teardownFn) {
                await teardownFn();
              }
            } finally {
              // Always tear down the environment
              await env.teardown();
            }
          };
        } catch (error) {
          // If setup fails, tear down and rethrow
          await env.teardown();
          throw error;
        }
      };
    },
    
    /**
     * Set dependencies for this test
     */
    setDependencies(dependencies) {
      setUpLocalDeps({
        ...getLocalDeps(),
        ...dependencies
      });
      return env;
    },
    
    /**
     * Run a test function with this environment
     * Sets up the environment, runs the test, then tears down
     * even if the test fails
     */
    async runTest(testFn) {
      await env.setup();
      
      try {
        // Run the test function
        return await testFn();
      } catch (error) {
        logger.error('Test error', { error });
        throw error;
      } finally {
        // Always tear down, even if the test fails
        await env.teardown();
      }
    },
    
    /**
     * Advance time if using mock timer
     */
    advanceTime(ms) {
      if (!mockTimer) {
        throw new Error('Cannot advance time: mock timer not enabled');
      }
      
      logger.debug(`Advancing time by ${ms}ms`);
      mockTimer.advanceTime(ms);
      return env;
    },
    
    /**
     * Run all pending timers if using mock timer
     */
    runAllTimers() {
      if (!mockTimer) {
        throw new Error('Cannot run timers: mock timer not enabled');
      }
      
      logger.debug('Running all pending timers');
      mockTimer.runAll();
      return env;
    }
  };
  
  return env;
}

/**
 * Run a function with an E2E test environment
 */
export async function withE2ETestEnvironment(fn, options = {}) {
  const env = createE2ETestEnvironment(options);
  await env.setup();
  
  try {
    return await fn(env);
  } finally {
    await env.teardown();
  }
}


