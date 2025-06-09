
/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger options
 */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  buffering?: boolean;
  colors?: boolean;
  timestamps?: boolean;
}

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  formatted: string;
}

/**
 * Logger class for test debugging with context awareness
 */
export class Logger {
  level: LogLevel;
  prefix: string;
  buffer: LogEntry[];
  buffering: boolean;
  colorEnabled: boolean;
  timestamps: boolean;
  
  constructor(options?: LoggerOptions);
  
  /**
   * Format a log message with timestamp, level, and prefix
   */
  format(level: LogLevel, message: string, context?: Record<string, any>): string;
  
  /**
   * Log a message if the level is sufficient
   */
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
  
  /**
   * Debug level log
   */
  debug(message: string, context?: Record<string, any>): Logger;
  
  /**
   * Info level log
   */
  info(message: string, context?: Record<string, any>): Logger;
  
  /**
   * Warn level log
   */
  warn(message: string, context?: Record<string, any>): Logger;
  
  /**
   * Error level log
   */
  error(message: string, context?: Record<string, any>): Logger;
  
  /**
   * Start buffering logs instead of outputting them
   */
  startBuffering(): Logger;
  
  /**
   * Flush all buffered logs
   */
  flush(): Logger;
  
  /**
   * Clear buffered logs without outputting them
   */
  clear(): Logger;
  
  /**
   * Stop buffering and return to normal output
   */
  stopBuffering(flush?: boolean): Logger;
  
  /**
   * Set the current log level
   */
  setLevel(level: LogLevel): Logger;
  
  /**
   * Create a child logger with inherited settings
   */
  child(prefix: string): Logger;
  
  /**
   * Create a logger for testing that uses the current test context
   */
  withTestContext(): Logger;
}

/**
 * Create a new logger
 */
export function createLogger(options?: LoggerOptions): Logger;

/**
 * Get the logger from local dependencies or create a new one
 */
export function getLogger(): Logger;
