"use strict";

const logger = require("../../srccjs/deps/logger.cjs");
const alsUtils = require("./testUtils/als-utils.cjs");
const asyncLocalDeps = require("../../srccjs/asyncLocalDeps");
const { beforeEachWithLocalDeps, itWithLocalDeps } = require("../../srccjs/jest/testWrappers.cjs");

const resourceManager = require("../../srccjs/resourceManager.cjs");

// Use the wrapped 'it' function for more 'usual' syntax
const it = itWithLocalDeps



describe('E2E Test Environment', () => {


    beforeAll(() => {
      // Initialize the ALS with empty dependencies
      alsUtils.ensureALSInitialized({});;
    });
    beforeEachWithLocalDeps(() => {
      // Mock resource cleanup
      // const mocks = jest.hoisted(() => {
      console.log(`Before each setting up the local dependencies`);
      jest.resetModules();
      jest.clearAllMocks();
      const mockFn = jest.fn;

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
        }
      };
      //   })
      
      asyncLocalDeps.setUpLocalDeps({
        // Mock resource manager
        resourceManager: {
          createResourceManager: jest.fn(() => ({
            add: jest.fn().mockImplementation((resource, cleanupFn) => ({
              resource,
              cleanupFn
            })),
            cleanup: jest.fn().mockImplementation(mocks.mockResourceCleanup),
            cleanupAll: jest.fn().mockImplementation(() => Promise.resolve())
          })),
          default: {
            createResourceManager: jest.fn(() => ({
              add: jest.fn().mockImplementation((resource, cleanupFn) => ({
                resource,
                cleanupFn
              })),
              cleanup: jest.fn().mockImplementation(mocks.mockResourceCleanup),
              cleanupAll: jest.fn().mockImplementation(() => Promise.resolve())
            }))
          }
        },
        depSnapshot: {
          createSnapshot: jest.fn(() => mocks.mockSnapshot),
          default: {
            createSnapshot: jest.fn(() => mocks.mockSnapshot)
          }
        },
        logger: {
          createLogger: () => mocks.mockLogger,
          LogLevel: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
          },
          default: {
            LogLevel: {
              DEBUG: 0,
              INFO: 1,
              WARN: 2,
              ERROR: 3
            },
            createLogger: jest.fn(() => mocks.mockLogger)
          }
        },
        mockTimer: {
          useMockTimer: () => mocks.mockTimer,
          default: {
            useMockTimer: () => mocks.mockTimer
          }
        },
        allMocks: mocks
      });
    });

    afterEach(() => {
      console.log(`After each clearing the local dependencies`);
      asyncLocalDeps.clearAllLocalDeps();
      jest.resetModules();
      jest.clearAllMocks();
      
    });

    it('should create an E2E test environment with default options', async () => {
      console.log('start 1')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        expect(env.resources).toBeDefined();
        expect(env.snapshot).toBe(mocks.mockSnapshot);
        expect(env.logger).toBe(mocks.mockLogger);
        expect(env.mockTimer).toBe(mocks.mockTimer);
        expect(env.state).toEqual({
          name: 'unnamed-test',
          isSetUp: false,
          isTornDown: false
        });
      } finally {
        console.log('end 1')
      }
    });
    it('should create an E2E test environment with custom options', async () => {
      console.log('start 2')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment({
          name: 'custom-test',
          logLevel: logger.LogLevel.DEBUG,
          mockTime: false,
          dependencies: {
            customDep: 'value'
          }
        });
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        expect(env.resources).toBeDefined();
        expect(env.snapshot).toBe(mocks.mockSnapshot);
        expect(env.logger).toBe(mocks.mockLogger);
        expect(env.mockTimer).toBe(null);
        expect(env.state).toEqual({
          name: 'custom-test',
          isSetUp: false,
          isTornDown: false
        });
        expect(env.initialDeps).toEqual({
          customDep: 'value'
        });
      } finally {
        console.log('end 2')
      }
    });
    it('should set up the test environment', async () => {
      console.log('start 3')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment({
          name: 'setup-test',
          dependencies: {
            testDep: 'value'
          }
        });
        const result = await env.setup();
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        expect(result).toBe(env);
        expect(env.state.isSetUp).toBe(true);
        expect(mocks.mockSnapshot.capture).toHaveBeenCalled();
        expect(mocks.mockLogger.debug).toHaveBeenNthCalledWith(1, 'Setting up test environment', {
          name: 'setup-test'
        });
        expect(mocks.mockLogger.debug).toHaveBeenNthCalledWith(2, 'Test environment set up complete');
      } finally {
        console.log('end 3')
      }
    });

    it('should warn if setting up an already set up environment', async () => {
      console.log('start 4')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        env.state.isSetUp = true;
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        await env.setup();
        expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already set up');
        expect(mocks.mockSnapshot.capture).not.toHaveBeenCalled();
      } finally {
        console.log('end 4')
      }
    });

    it('should tear down the test environment', async () => {
      console.log('start 5')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment({
          name: 'teardown-test'
        });
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        await env.teardown();
        expect(env.state.isTornDown).toBe(true);
        expect(env.resources.cleanupAll).toHaveBeenCalled();
        expect(mocks.mockSnapshot.restore).toHaveBeenCalled();
        expect(mocks.mockTimer.uninstall).toHaveBeenCalled();
        expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Tearing down test environment', {
          name: 'teardown-test'
        });
        expect(mocks.mockLogger.debug).toHaveBeenCalledWith('Test environment tear down complete');
      } finally {
        console.log('end 5')
      }
    });

    it('should warn if tearing down an already torn down environment', async () => {
      console.log('start 6')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        env.state.isTornDown = true;
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        await env.teardown();
        expect(mocks.mockLogger.warn).toHaveBeenCalledWith('Test environment already torn down');
        expect(env.resources.cleanupAll).not.toHaveBeenCalled();
        expect(mocks.mockSnapshot.restore).not.toHaveBeenCalled();
        expect(mocks.mockTimer.uninstall).not.toHaveBeenCalled();
      } finally {
        console.log('end 6')
      }
    });

    it('should register resources for cleanup', async () => {
      console.log('start 7')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        const resource = {
          name: 'test-resource'
        };
        const cleanupFn = () => { };
        const result = env.registerResource(resource, cleanupFn);
        expect(env.resources.add).toHaveBeenCalledWith(resource, cleanupFn);
        expect(result).toEqual({
          resource,
          cleanupFn
        });
      } finally {
        console.log('end 7')
      }
    });

    it('should run a test with the environment', async () => {
      console.log('start 8')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        const testFn = jest.fn().mockResolvedValue('test-result');
        const result = await env.runTest(testFn);
        expect(env.state.isSetUp).toBe(true);
        expect(env.state.isTornDown).toBe(true);
        expect(testFn).toHaveBeenCalled();
        expect(result).toBe('test-result');
      } finally {
        console.log('end 8')
      }
    });

    it('should handle test errors and still tear down', async () => {
      console.log('start 9')
      try {
        const { createE2ETestEnvironment } = require("../../srccjs/deps/e2e");
        const env = createE2ETestEnvironment();
        const mocks = asyncLocalDeps.getLocalDeps()['allMocks'];
        const testError = new Error('Test failed');
        const testFn = jest.fn().mockRejectedValue(testError);
        await expect(env.runTest(testFn)).rejects.toThrow(testError);
        expect(env.state.isSetUp).toBe(true);
        expect(env.state.isTornDown).toBe(true);
        expect(testFn).toHaveBeenCalled();
        expect(mocks.mockLogger.error).toHaveBeenCalledWith('Test error', {
          error: testError
        });
      } finally {
        console.log('end 9')
      }
    });
  });
