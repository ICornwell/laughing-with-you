// Tests for E2E test environment
import { getLocalDeps, setUpLocalDeps } from '../src/asyncLocalDeps';
import { LogLevel } from '../src/logger';

// Detect which testing framework we're using



describe('E2E Test Environment', () => {
  let mockResourceCleanup;
  let mockSnapshot;
  let mockLogger;
  let mockTimer;
  let mocks

  beforeAll(() => {
    // Initialize the ALS with empty dependencies
     // setUpLocalDeps();
  });

  beforeEach(() => {
    // Mock resource cleanup
   // const mocks = jest.hoisted(() => {
      const mockFn = jest.fn;
      mocks = {
        mockResourceCleanup: mockFn().mockResolvedValue(),

        // Mock dependencies
        mockSnapshot: {
          capture: mockFn(),
          restore: mockFn()
        },

        mockLogger: {
          debug: mockFn(),
          info: mockFn(),
          warn: mockFn(),
          error: mockFn()
        },

        mockTimer: {
          uninstall: mockFn()
        },
      }
 //   })

    // Mock createResourceManager to return a controlled resource manager
    jest.mock('../src/resourceManager', () => ({
      __esModule: true,
       createResourceManager: jest.fn(() => ({
        add: jest.fn().mockImplementation((resource, cleanupFn) => ({ resource, cleanupFn })),
        cleanup: jest.fn().mockImplementation(mockResourceCleanup),
        cleanupAll: jest.fn().mockImplementation(() => Promise.resolve())
      })),
      default: {
        createResourceManager: jest.fn(() => ({
          add: jest.fn().mockImplementation((resource, cleanupFn) => ({ resource, cleanupFn })),
          cleanup: jest.fn().mockImplementation(mocks.mockResourceCleanup),
          cleanupAll: jest.fn().mockImplementation(() => Promise.resolve())
        }))
      }
    }));

    // Mock createSnapshot
    jest.mock('../src/depSnapshot', () => ({
      __esModule: true,
      createSnapshot: jest.fn(() => mocks.mockSnapshot),
      default: { createSnapshot: jest.fn(() => mocks.mockSnapshot) }
    }));

    // Mock createLogger
    jest.mock('../src/logger', () => ({
      __esModule: true,
      createLogger: () => mocks.mockLogger,
      LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
      default: { LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }, createLogger: jest.fn(() => mocks.mockLogger) }
    }));

    // Mock useMockTimer
    jest.mock('../src/mockTimer', () => ({
      useMockTimer: () => mocks.mockTimer,
      default: { useMockTimer: () => mocks.mockTimer },
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should create an E2E test environment with default options', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();

    expect(env.resources).toBeDefined();
    expect(env.snapshot).toBe(mocks.mockSnapshot);
    expect(env.logger).toBe(mocks.mockLogger);
    expect(env.mockTimer).toBe(mocks.mockTimer);
    expect(env.state).toEqual({
      name: 'unnamed-test',
      isSetUp: false,
      isTornDown: false
    });
  });

  it('should create an E2E test environment with custom options', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment({
      name: 'custom-test',
      logLevel: LogLevel.DEBUG,
      mockTime: false,
      dependencies: { customDep: 'value' }
    });

    expect(env.resources).toBeDefined();
    expect(env.snapshot).toBe(mocks.mockSnapshot);
    expect(env.logger).toBe(mocks.mockLogger);
    expect(env.mockTimer).toBe(null);
    expect(env.state).toEqual({
      name: 'custom-test',
      isSetUp: false,
      isTornDown: false
    });
    expect(env.initialDeps).toEqual({ customDep: 'value' });
  });

  it('should set up the test environment', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment({
      name: 'setup-test',
      dependencies: { testDep: 'value' }
    });

    const result = await env.setup();

    expect(result).toBe(env);
    expect(env.state.isSetUp).toBe(true);
    expect(mocks.mockSnapshot.capture).toHaveBeenCalled();
    expect(mocks.mockLogger.debug).toHaveBeenNthCalledWith(1, 'Setting up test environment', { name: 'setup-test' });
    expect(mocks.mockLogger.debug).toHaveBeenNthCalledWith(2, 'Test environment set up complete');
  });

  it('should warn if setting up an already set up environment', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();
    env.state.isSetUp = true;

    await env.setup();

    expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already set up');
    expect(mocks.mockSnapshot.capture).not.toHaveBeenCalled();
  });

  it('should tear down the test environment', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment({
      name: 'teardown-test'
    });

    await env.teardown();

    expect(env.state.isTornDown).toBe(true);
    expect(env.resources.cleanupAll).toHaveBeenCalled();
    expect(mocks.mockSnapshot.restore).toHaveBeenCalled();
    expect(mocks.mockTimer.uninstall).toHaveBeenCalled();
    expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Tearing down test environment', { name: 'teardown-test' });
    expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Test environment tear down complete');
  });

  it('should warn if tearing down an already torn down environment', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();
    env.state.isTornDown = true;

    await env.teardown();

    expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already torn down');
    expect(env.resources.cleanupAll).not.toHaveBeenCalled();
    expect(mocks.mockSnapshot.restore).not.toHaveBeenCalled();
    expect(mocks.mockTimer.uninstall).not.toHaveBeenCalled();
  });

  it('should register resources for cleanup', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();
    const resource = { name: 'test-resource' };
    const cleanupFn = () => { };

    const result = env.registerResource(resource, cleanupFn);

    expect(env.resources.add).toHaveBeenCalledWith(resource, cleanupFn);
    expect(result).toEqual({ resource, cleanupFn });
  });

  it('should run a test with the environment', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();
    const testFn = jest.fn().mockResolvedValue('test-result');

    const result = await env.runTest(testFn);

    expect(env.state.isSetUp).toBe(true);
    expect(env.state.isTornDown).toBe(true);
    expect(testFn).toHaveBeenCalled();
    expect(result).toBe('test-result');
  });

  it('should handle test errors and still tear down', async () => {
    const { createE2ETestEnvironment } = await import('../src/e2e');
    const env = createE2ETestEnvironment();
    const testError = new Error('Test failed');
    const testFn = jest.fn().mockRejectedValue(testError);

    await expect(env.runTest(testFn)).rejects.toThrow(testError);

    expect(env.state.isSetUp).toBe(true);
    expect(env.state.isTornDown).toBe(true);
    expect(testFn).toHaveBeenCalled();
    expect(mocks.mockLogger.error).toHaveBeenCalledWith('Test error', { error: testError });
  });
});
