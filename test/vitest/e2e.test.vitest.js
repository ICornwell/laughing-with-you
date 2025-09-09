// Tests for E2E test environment

import { itWithLocalDeps, beforeAllWithLocalDeps } from '#lwy/vitest/testWrappers.js';
import { expect } from 'vitest';
import { getLocalDeps, clearAllLocalDeps, setUpLocalDeps, runWithLocalDeps } from '../../src/asyncLocalDeps';
import { LogLevel } from '../../src/logger';
// import { createE2ETestEnvironment } from '../../src/e2e'
// Detect which testing framework we're using

const it = itWithLocalDeps;

describe('E2E Test Environment', () => {

  runWithLocalDeps({}, () => {

    beforeAll(() => {
      // Initialize the ALS with empty dependencies

    });

    beforeAllWithLocalDeps(() => {

      const mockFn = vi.fn;
      const mocks = {
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

      const mockDeps = {
        'depSnapshot': {
          createSnapshot: vi.fn(() => mocks.mockSnapshot),
          default: { createSnapshot: vi.fn(() => mocks.mockSnapshot) }
        },

        // Mock createLogger
        'logger': {
          createLogger: () => mocks.mockLogger,
          LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
          default: { LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }, createLogger: vi.fn(() => mocks.mockLogger) }
        },

        // Mock useMockTimer
        'mockTimer': {
          useMockTimer: () => mocks.mockTimer,
          default: { useMockTimer: () => mocks.mockTimer },
        },

        // Mock createResourceManager to return a controlled resource manager
        'resourceManager': {
          /* createResourceManager: () => ({
            add: vi.fn().mockImplementation((resource, cleanupFn) => ({ resource, cleanupFn })),
            cleanup: vi.fn().mockImplementation(mockResourceCleanup),
            cleanupAll: vi.fn().mockImplementation(() => Promise.resolve())
          }), */
          default: {
            createResourceManager: vi.fn(() => ({
              add: vi.fn().mockImplementation((resource, cleanupFn) => ({ resource, cleanupFn })),
              cleanup: vi.fn().mockImplementation(mocks.mockResourceCleanup),
              cleanupAll: vi.fn().mockImplementation(() => Promise.resolve())
            }))
          }
        },
        'allMocks': mocks
      }
      setUpLocalDeps(mockDeps);
    });

    afterEach(() => {
      clearAllLocalDeps();
    });

    it('should create an E2E test environment with default options', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      const mocks = getLocalDeps()['allMocks'];
      expect(env).toBeDefined();
      expect(mocks).toBeDefined();
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
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment({
        name: 'custom-test',
        logLevel: LogLevel.DEBUG,
        mockTime: false,
        dependencies: { customDep: 'value' }
      });
      const mocks = getLocalDeps();
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

    itWithLocalDeps('should set up the test environment', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment({
        name: 'setup-test',
        dependencies: { testDep: 'value' }
      });
      const mocks = getLocalDeps();
      const result = await env.setup();

      expect(result).toBe(env);
      expect(env.state.isSetUp).toBe(true);
      expect(mocks.mockSnapshot.capture).toHaveBeenCalled();
      expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Setting up test environment', { name: 'setup-test' });
      expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Test environment set up complete');
    });

    itWithLocalDeps('should warn if setting up an already set up environment', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      const mocks = getLocalDeps();
      env.state.isSetUp = true;

      await env.setup();

      expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already set up');
      expect(mocks.mockSnapshot.capture).not.toHaveBeenCalled();
    });

    itWithLocalDeps('should tear down the test environment', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment({
        name: 'teardown-test'
      });
      const mocks = getLocalDeps();
      await env.teardown();

      expect(env.state.isTornDown).toBe(true);
      expect(env.resources.cleanupAll).toHaveBeenCalled();
      expect(mocks.mockSnapshot.restore).toHaveBeenCalled();
      expect(mocks.mockTimer.uninstall).toHaveBeenCalled();
      expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Tearing down test environment', { name: 'teardown-test' });
      expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Test environment tear down complete');
    });

    itWithLocalDeps('should warn if tearing down an already torn down environment', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      env.state.isTornDown = true;
      const mocks = getLocalDeps();
      await env.teardown();

      expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already torn down');
      expect(env.resources.cleanupAll).not.toHaveBeenCalled();
      expect(mocks.mockSnapshot.restore).not.toHaveBeenCalled();
      expect(mocks.mockTimer.uninstall).not.toHaveBeenCalled();
    });

    itWithLocalDeps('should register resources for cleanup', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      const resource = { name: 'test-resource' };
      const cleanupFn = () => { };
      const mocks = getLocalDeps();
      const result = env.registerResource(resource, cleanupFn);

      expect(env.resources.add).toHaveBeenCalledWith(resource, cleanupFn);
      expect(result).toEqual({ resource, cleanupFn });
    });

    itWithLocalDeps('should run a test with the environment', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      const testFn = vi.fn().mockResolvedValue('test-result');
      const mocks = getLocalDeps();
      const result = await env.runTest(testFn);

      expect(env.state.isSetUp).toBe(true);
      expect(env.state.isTornDown).toBe(true);
      expect(testFn).toHaveBeenCalled();
      expect(result).toBe('test-result');
    });

    itWithLocalDeps('should handle test errors and still tear down', async () => {
      const { createE2ETestEnvironment } = await import('../../src/e2e')
      const env = createE2ETestEnvironment();
      const testError = new Error('Test failed');
      const testFn = vi.fn().mockRejectedValue(testError);
      const mocks = getLocalDeps();
      await expect(env.runTest(testFn)).rejects.toThrow(testError);

      expect(env.state.isSetUp).toBe(true);
      expect(env.state.isTornDown).toBe(true);
      expect(testFn).toHaveBeenCalled();
      expect(mocks.mockLogger.error).toHaveBeenCalledWith('Test error', { error: testError });
    });
  });
});
