// Test for logger utility with vitest
import { setUpLocalDeps, getLocalDeps, clearAllLocalDeps } from '../../src/asyncLocalDeps.js';
import { ensureALSInitialized } from './testUtils/als-utils.js';
import { withSignalMutex } from '../../src/waitForSignals.js';

describe('Logger', () => {
  async function createLoggerAndSpy(includeConsoleSpy = true) {
    
    const { LogLevel, createLogger } = await import('../../src/logger.js')
   // const loggerConsole = console; // Use the global console for logging
   const loggerConsole =  {
      debug: () => { },
      info: () => { },
      warn: () => { },
      error: () => { },
      log: console.log
    } 
   
    const logger = createLogger({
      level: LogLevel.DEBUG,
      timestamps: false, // Disable timestamps for easier testing
      console: loggerConsole,
    });

    // Create a logger instance// Mock console methods
    const consoleSpy = includeConsoleSpy ? {
      debug: vi.spyOn(loggerConsole, 'debug').mockImplementation(() => { }),
      info: vi.spyOn(loggerConsole, 'info').mockImplementation(() => { }),
      warn: vi.spyOn(loggerConsole, 'warn').mockImplementation(() => { }),
      error: vi.spyOn(loggerConsole, 'error').mockImplementation(() => { })
    } : null;

    // Create a fresh logger for each test
    
    return { logger, consoleSpy, LogLevel };
  }

  function clearConsole(consoleSpy) {
   
  }

  beforeAll(() => {
    // Initialize AsyncLocalStorage
    ensureALSInitialized();

  });

  beforeEach(() => {
    // Initialize fresh ALS state for each test
    ensureALSInitialized();
  //  vi.resetAllMocks()
  //  vi.restoreAllMocks()
  });

  afterEach(() => {
    // Clear all local dependencies after each test
    clearAllLocalDeps();
  
  })

  test('should create a logger with default settings', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {

      const { logger: defaultLogger, LogLevel } = await createLoggerAndSpy();

      expect(defaultLogger.level()).toBe(LogLevel.INFO);
      expect(defaultLogger.prefix).toBe('');
      expect(defaultLogger.buffering()).toBe(false);
      expect(defaultLogger.colorEnabled).toBe(true);
      // We're manipulating timestamps in the test setup, so we don't make assumptions about it here
      expect(defaultLogger.buffer()).toEqual([]);

    }, 1000, 20)
  });

  test('should log messages at the appropriate level', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.setLevel(LogLevel.DEBUG);

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('DEBUG'));
      expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining('Debug message'));

      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('INFO'));
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('Info message'));

      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('WARN'));
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should respect log level thresholds', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {

      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.setLevel(LogLevel.WARN);

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // These should be filtered out
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();

      // These should be logged
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should include context in log messages', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {

      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.info('Message with context', { user: 'test', action: 'login' });

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('"user":"test"')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('"action":"login"')
      );
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should buffer logs when buffering is enabled', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {

      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.startBuffering();

      logger.info('First message');
      logger.info('Second message');

      // Nothing should be logged yet
      expect(consoleSpy.info).not.toHaveBeenCalled();

      // Buffer should contain the messages
      expect(logger.buffer()).toHaveLength(2);
      expect(logger.buffer()[0].message).toBe('First message');
      expect(logger.buffer()[1].message).toBe('Second message');
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should flush buffered logs', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.startBuffering();

      logger.info('First message');
      logger.warn('Second message');

      // Flush the buffer
      logger.flush();

      // Messages should now be logged
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();

      // Buffer should be empty
      expect(logger.buffer()).toHaveLength(0);
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should clear buffered logs without outputting them', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();
      logger.startBuffering();

      logger.info('Test message');

      // Clear the buffer
      logger.clear();

      // Nothing should be logged
      expect(consoleSpy.info).not.toHaveBeenCalled();

      // Buffer should be empty
      expect(logger.buffer()).toHaveLength(0);
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should create a child logger with a prefix', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      const { logger, consoleSpy, LogLevel } = await createLoggerAndSpy();

      const con1 = logger.getLoggerConsole();
      const child = logger.child('Module');
      const con2 = logger.getLoggerConsole();
      child.info('Child logger message');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[Module]')
      );
      clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should createLogger and add to dependencies', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      // Set up initial dependencies
      setUpLocalDeps({});

      // Create logger
      const { logger } = await createLoggerAndSpy();

      // Check it was added to dependencies
      const deps = getLocalDeps();
      expect(deps.loggerInstance).toBe(logger);
      //clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should get existing logger from dependencies', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      // Create a logger and add to dependencies
      const { logger: initialLogger } = await createLoggerAndSpy();
      setUpLocalDeps({ loggerInstance: initialLogger });

      // Get logger should return the existing one
      const { logger } = await createLoggerAndSpy(false);

      expect(logger).toBe(initialLogger);
      //clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should create a new logger if none exists in dependencies', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      // Set up dependencies without a logger
      setUpLocalDeps({});

      // Get logger should create a new one
      const { logger } = await createLoggerAndSpy(false);

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(getLocalDeps().loggerInstance).toBe(logger);
      //clearConsole(consoleSpy)
    }, 1000, 20)
  });

  test('should use test context for prefixed logging', async () => {
    await withSignalMutex('mutexLoggerTests', async () => {
      
      // Set up test context
      setUpLocalDeps({
        testContext: {
          currentTest: 'TestName'
        }
      });

      // Create a logger with test context
      const { logger, consoleSpy } = await createLoggerAndSpy();
      const contextLogger = logger.withTestContext();

      contextLogger.info('Test message');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestName]')
      );
      clearConsole(consoleSpy)
    });
  });


  test('spy identity test', () => {
    const spy1 = vi.spyOn(console, 'log');
    const spy2 = vi.spyOn(console, 'log');

    console.log('Test');

    expect(spy2).toHaveBeenCalled(); // This should pass
    expect(spy1).toHaveBeenCalled(); // This should pass
  });
})
