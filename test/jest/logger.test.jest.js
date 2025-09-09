"use strict";

const asyncLocalDeps = require("../../srccjs/asyncLocalDeps.js");
const globals = require("@jest/globals");
const alsUtils = require("./testUtils/als-utils.js");
const waitForSignals = require("../../srccjs/waitForSignals.js");
const {createLogger, LogLevel} = require("../../srccjs/logger.js");
describe('Logger', () => {
  async function createLoggerAndSpy(includeConsoleSpy = true) {
    
    // const loggerConsole = console; // Use the global console for logging
    const loggerConsole = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      log: console.log
    };
    const logger = createLogger({
      level: LogLevel.DEBUG,
      timestamps: false,
      // Disable timestamps for easier testing
      console: loggerConsole
    });

    // Create a logger instance// Mock console methods
    const consoleSpy = includeConsoleSpy ? {
      debug: globals.jest.spyOn(loggerConsole, 'debug').mockImplementation(() => {}),
      info: globals.jest.spyOn(loggerConsole, 'info').mockImplementation(() => {}),
      warn: globals.jest.spyOn(loggerConsole, 'warn').mockImplementation(() => {}),
      error: globals.jest.spyOn(loggerConsole, 'error').mockImplementation(() => {})
    } : null;

    // Create a fresh logger for each test

    return {
      logger,
      consoleSpy,
      LogLevel
    };
  }
  function clearConsole(consoleSpy) {}
  beforeAll(() => {
    // Initialize AsyncLocalStorage
    alsUtils.ensureALSInitialized();
  });
  beforeEach(() => {
    // Initialize fresh ALS state for each test
    alsUtils.ensureALSInitialized();
    //  jest.resetAllMocks()
    //  jest.restoreAllMocks()
  });
  afterEach(() => {
    // Clear all local dependencies after each test
    asyncLocalDeps.clearAllLocalDeps();
  });
  test('should create a logger with default settings', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger: defaultLogger,
        LogLevel
      } = await createLoggerAndSpy();
      globals.expect(defaultLogger.level()).toBe(LogLevel.INFO);
      globals.expect(defaultLogger.prefix).toBe('');
      globals.expect(defaultLogger.buffering()).toBe(false);
      globals.expect(defaultLogger.colorEnabled).toBe(true);
      // We're manipulating timestamps in the test setup, so we don't make assumptions about it here
      globals.expect(defaultLogger.buffer()).toEqual([]);
    }, 1000, 20);
  });
  test('should log messages at the appropriate level', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      globals.expect(consoleSpy.debug).toHaveBeenCalledWith(globals.expect.stringContaining('DEBUG'));
      globals.expect(consoleSpy.debug).toHaveBeenCalledWith(globals.expect.stringContaining('Debug message'));
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('INFO'));
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('Info message'));
      globals.expect(consoleSpy.warn).toHaveBeenCalledWith(globals.expect.stringContaining('WARN'));
      globals.expect(consoleSpy.warn).toHaveBeenCalledWith(globals.expect.stringContaining('Warning message'));
      globals.expect(consoleSpy.error).toHaveBeenCalledWith(globals.expect.stringContaining('ERROR'));
      globals.expect(consoleSpy.error).toHaveBeenCalledWith(globals.expect.stringContaining('Error message'));
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should respect log level thresholds', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.setLevel(LogLevel.WARN);
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // These should be filtered out
      globals.expect(consoleSpy.debug).not.toHaveBeenCalled();
      globals.expect(consoleSpy.info).not.toHaveBeenCalled();

      // These should be logged
      globals.expect(consoleSpy.warn).toHaveBeenCalled();
      globals.expect(consoleSpy.error).toHaveBeenCalled();
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should include context in log messages', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.info('Message with context', {
        user: 'test',
        action: 'login'
      });
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('"user":"test"'));
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('"action":"login"'));
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should buffer logs when buffering is enabled', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.startBuffering();
      logger.info('First message');
      logger.info('Second message');

      // Nothing should be logged yet
      globals.expect(consoleSpy.info).not.toHaveBeenCalled();

      // Buffer should contain the messages
      globals.expect(logger.buffer()).toHaveLength(2);
      globals.expect(logger.buffer()[0].message).toBe('First message');
      globals.expect(logger.buffer()[1].message).toBe('Second message');
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should flush buffered logs', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.startBuffering();
      logger.info('First message');
      logger.warn('Second message');

      // Flush the buffer
      logger.flush();

      // Messages should now be logged
      globals.expect(consoleSpy.info).toHaveBeenCalled();
      globals.expect(consoleSpy.warn).toHaveBeenCalled();

      // Buffer should be empty
      globals.expect(logger.buffer()).toHaveLength(0);
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should clear buffered logs without outputting them', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      logger.startBuffering();
      logger.info('Test message');

      // Clear the buffer
      logger.clear();

      // Nothing should be logged
      globals.expect(consoleSpy.info).not.toHaveBeenCalled();

      // Buffer should be empty
      globals.expect(logger.buffer()).toHaveLength(0);
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should create a child logger with a prefix', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        logger,
        consoleSpy,
        LogLevel
      } = await createLoggerAndSpy();
      const con1 = logger.getLoggerConsole();
      const child = logger.child('Module');
      const con2 = logger.getLoggerConsole();
      child.info('Child logger message');
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('[Module]'));
      clearConsole(consoleSpy);
    }, 1000, 20);
  });
  test('should createLogger and add to dependencies', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      // Set up initial dependencies
      asyncLocalDeps.setUpLocalDeps({});

      // Create logger
      const {
        logger
      } = await createLoggerAndSpy();

      // Check it was added to dependencies
      const deps = asyncLocalDeps.getLocalDeps();
      globals.expect(deps.loggerInstance).toBe(logger);
      //clearConsole(consoleSpy)
    }, 1000, 20);
  });
  test('should get existing logger from dependencies', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      // Create a logger and add to dependencies
      const {
        logger: initialLogger
      } = await createLoggerAndSpy();
      asyncLocalDeps.setUpLocalDeps({
        logger: initialLogger
      });

      // Get logger should return the existing one
      const {
        logger
      } = await createLoggerAndSpy(false);
      globals.expect(logger).toBe(initialLogger);
      //clearConsole(consoleSpy)
    }, 1000, 20);
  });
  test('should create a new logger if none exists in dependencies', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      // Set up dependencies without a logger
      asyncLocalDeps.setUpLocalDeps({});

      // Get logger should create a new one
      const {
        logger
      } = await createLoggerAndSpy(false);
      globals.expect(logger).toHaveProperty('debug');
      globals.expect(logger).toHaveProperty('info');
      globals.expect(logger).toHaveProperty('warn');
      globals.expect(logger).toHaveProperty('error');
      globals.expect(asyncLocalDeps.getLocalDeps().loggerInstance).toBe(logger);
      //clearConsole(consoleSpy)
    }, 1000, 20);
  });
  test('should use test context for prefixed logging', async () => {
    await waitForSignals.withSignalMutex('mutexLoggerTests', async () => {
      const {
        consoleSpy
      } = await createLoggerAndSpy();
      // Set up test context
      asyncLocalDeps.setUpLocalDeps({
        testContext: {
          currentTest: 'TestName'
        }
      });

      // Create a logger with test context
      const {
        logger
      } = await createLoggerAndSpy(false);
      const contextLogger = logger.withTestContext();
      contextLogger.info('Test message');
      globals.expect(consoleSpy.info).toHaveBeenCalledWith(globals.expect.stringContaining('[TestName]'));
      clearConsole(consoleSpy);
    });
  });
  test('spy identity test', () => {
    const spy1 = globals.jest.spyOn(console, 'log');
    const spy2 = globals.jest.spyOn(console, 'log');
    console.log('Test');
    globals.expect(spy1).toHaveBeenCalled(); // This should pass
    globals.expect(spy2).toHaveBeenCalled(); // This should pass too
  });
});