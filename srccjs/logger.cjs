"use strict";

var {addLocalDeps, getLocalDeps} = require("./asyncLocalDeps");
/**
 * Logger utility with contextual awareness
 */

/**
 * Log levels
 */
const LogLevel = exports.LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Logger class for test debugging with context awareness
 */
function createLogger(options) {
  const existingLogger = getLocalDeps()?.loggerInstance; // the name 'logger' refers to the module with createLogger function
  if (existingLogger && !options?.forceNew) {
    // If a logger already exists in local dependencies, return it
    console.log('Using existing logger from local dependencies');
    return existingLogger;
  } else {
    console.log('Creating new logger instance');
  }
  let loggerConsole = options?.console ?? console;
  let minLevel = LogLevel.INFO;
  let prefix = '';
  let buffer = [];
  let buffering = false;
  let colorEnabled = true;
  let timestamps = true;
  if (options) {
    minLevel = options.level || LogLevel.INFO;
    prefix = options.prefix || '';
    buffering = options.buffering || false;
    colorEnabled = options.colors !== false;
    timestamps = options.timestamps !== false;
  }

  /**
  * Format a log message with timestamp, level, and prefix
  */
  function format(level, message, context = {}) {
    const ftimestamp = timestamps ? `[${new Date().toISOString()}] ` : '';
    const fprefix = prefix ? `[${prefix}] ` : '';
    const flevelStr = Object.keys(LogLevel).find(key => LogLevel[key] === level);
    const flevelColor = getLevelColor(level);
    const fcontextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const formattedLevel = colorEnabled ? `${flevelColor}[${flevelStr}]\x1b[0m` : `[${flevelStr}]`;
    return `${ftimestamp}${fprefix}${formattedLevel} ${message}${fcontextStr}`;
  }

  /**
   * Get color code for a log level
   */
  function getLevelColor(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[90m';
      // Gray
      case LogLevel.INFO:
        return '\x1b[32m';
      // Green
      case LogLevel.WARN:
        return '\x1b[33m';
      // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m';
      // Red
      default:
        return '\x1b[0m';
      // Reset
    }
  }

  /**
   * Log a message if the level is sufficient
   */
  function log(level, message, context = {}) {
    if (level < minLevel) return;
    const formatted = format(level, message, context);
    if (buffering) {
      buffer.push({
        level,
        message,
        context,
        formatted
      });
    } else {
      _output(level, formatted);
    }
  }

  /**
   * Output a message to the appropriate loggerConsole method
   */
  function _output(level, message) {
    switch (level) {
      case LogLevel.DEBUG:
        loggerConsole.debug(message);
        break;
      case LogLevel.INFO:
        loggerConsole.info(message);
        break;
      case LogLevel.WARN:
        loggerConsole.warn(message);
        break;
      case LogLevel.ERROR:
        loggerConsole.error(message);
        break;
    }
  }

  /**
   * Debug level log
   */
  function debug(message, context = {}) {
    log(LogLevel.DEBUG, message, context);
    // return this;
  }

  /**
   * Info level log
   */
  function info(message, context = {}) {
    log(LogLevel.INFO, message, context);
    // return this;
  }

  /**
   * Warn level log
   */
  function warn(message, context = {}) {
    log(LogLevel.WARN, message, context);
    // return this;
  }

  /**
   * Error level log
   */
  function error(message, context = {}) {
    log(LogLevel.ERROR, message, context);
    // return this;
  }

  /**
   * Start buffering logs instead of outputting them
   */
  function startBuffering() {
    buffering = true;
    // return this;
  }

  /**
   * Flush all buffered logs
   */
  function flush() {
    if (!buffering) return; // this;

    buffer.forEach(item => {
      _output(item.level, item.formatted);
    });
    buffer = [];
    // return this;
  }

  /**
   * Clear buffered logs without outputting them
   */
  function clear() {
    buffer = [];
    // return this;
  }

  /**
   * Stop buffering and return to normal output
   */
  function stopBuffering(flush = true) {
    buffering = false;
    if (flush) flush();
    // return this;
  }

  /**
   * Set the current log level
   */
  function setLevel(level) {
    minLevel = level;
    // return this;
  }

  /**
   * Create a child logger with inherited settings
   */
  function child(newPrefix) {
    const childPrefix = prefix ? `${prefix}:${newPrefix}` : newPrefix;
    return createLogger({
      level: minLevel,
      prefix: childPrefix,
      buffering: buffering,
      colors: colorEnabled,
      timestamps: timestamps,
      console: loggerConsole,
      forceNew: true
    });
  }

  /**
   * Create a logger for testing that uses the current test context
   */
  function withTestContext() {
    const testContext = getLocalDeps()?.testContext;
    if (!testContext) return this;

    // Create a logger with the current test name as prefix
    if (testContext.currentTest) {
      return child(testContext.currentTest);
    }

    // return this;
  }
  const logger = {
    debug: (message, context) => {
      debug(message, context);
      return this;
    },
    info: (message, context) => {
      info(message, context);
      return this;
    },
    warn: (message, context) => {
      warn(message, context);
      return this;
    },
    error: (message, context) => {
      error(message, context);
      return this;
    },
    startBuffering: () => {
      startBuffering();
      return this;
    },
    flush: () => {
      flush();
      return this;
    },
    clear: () => {
      clear();
      return this;
    },
    stopBuffering: (flush = true) => {
      stopBuffering(flush);
      return this;
    },
    setLevel: newLevel => {
      setLevel(newLevel);
      return this;
    },
    child: newPrefix => {
      return child(newPrefix);
    },
    stopBuffering: (flush = true) => {
      stopBuffering(flush);
      return this;
    },
    withTestContext: () => {
      return withTestContext();
    },
    buffer: () => buffer,
    level: () => minLevel,
    prefix: prefix,
    buffering: () => buffering,
    colorEnabled: colorEnabled,
    timestamps: timestamps,
    setLoggerConsole: newLoggerConsole => {
      loggerConsole = newLoggerConsole;
      return this;
    },
    getLoggerConsole: () => loggerConsole
  };
  if (!options?.doNotCache) {
    // Add the logger to local dependencies
    addLocalDeps({
      loggerInstance: logger
    }, true);
  }
  return logger;
}

/**
 * Get the logger from local dependencies or create a new one
 */
function getLogger() {
  const deps = getLocalDeps() || {};
  if (deps.loggerInstance) {
    return deps.loggerInstance;
  }
  return createLogger();
}
module.exports = {
  LogLevel,
  createLogger,
  getLogger
};