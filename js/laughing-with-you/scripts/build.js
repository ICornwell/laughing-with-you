// @ts-check
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Simple build script to create TypeScript declarations
 */
function build() {
  console.log('Building library...');
  
  // Create lib directory
  const libDir = path.join(__dirname, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // Copy source files
  execSync('cp -r src/* lib/', { stdio: 'inherit' });
  
  // Create type declarations
  createTypeDeclarations();
  
  console.log('Build complete!');
}

/**
 * Create TypeScript declaration files (.d.ts) for better IDE support
 * Even though this is a JavaScript project, declaration files help with IDE intellisense
 */
function createTypeDeclarations() {
  console.log('Creating type declarations...');
  
  // Create the lib directory and subdirectories if they don't exist
  const libDir = path.join(__dirname, '..', 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // asyncLocalDeps.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/asyncLocalDeps.d.ts'), `
/**
 * Run a function with specific dependencies in AsyncLocalStorage
 */
export function runWithLocalDeps(deps: Record<string, any>, callback: Function, timeout?: number): Promise<any>;

/**
 * Set up dependencies in AsyncLocalStorage
 */
export function setUpLocalDeps(deps: Record<string, any>): void;

/**
 * Add new dependencies to existing ones in AsyncLocalStorage
 */
export function addLocalDeps(newDeps: Record<string, any>): void;

/**
 * Get current dependencies from AsyncLocalStorage
 */
export function getLocalDeps(): Record<string, any> | null;

/**
 * Run a function with a test context
 */
export function runWithTestContext(callback: Function, timeout?: number): Promise<any>;

/**
 * Get the current test context
 */
export function getTestContext(): Record<string, any> | null;
`);

  // analytics.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/analytics.d.ts'), `
export interface AnalyticsCallData {
  args: any[];
  result: any;
  duration: number;
}

export interface AnalyticsStats {
  count: number;
  totalTime: number;
  samples: AnalyticsCallData[];
}

export interface AnalyticsResult {
  [key: string]: {
    calls: number;
    avgTime: number;
    totalTime: number;
    samples: AnalyticsCallData[];
  }
}

export interface Analytics {
  calls: Map<string, AnalyticsStats>;
  recordCall(name: string, prop: string, args: any[], result: any, duration: number): void;
  getStats(): AnalyticsResult;
  reset(): void;
}

export interface RecordCallsResult {
  getStats(): AnalyticsResult;
  reset(): void;
}

/**
 * Record function calls for analytics
 */
export function recordCalls(name: string, methodNames?: string[]): RecordCallsResult;

export const analytics: Analytics;
`);

  // proxyDeps.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/proxyDeps.d.ts'), `
/**
 * Create a proxy for a dependency
 */
export function proxyDep<T extends object>(dep: T, name: string): T;
`);

  // signalTesting.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/signalTesting.d.ts'), `
/**
 * Signal handler for coordinating asynchronous tests
 */
export interface SignalHandler {
  wait(signalName: string, timeout?: number): Promise<any>;
  signal(signalName: string, value?: any): any;
  createWaiter(signalName: string, timeout?: number): Promise<any>;
  reset(): void;
}

/**
 * Create a signal-based test environment
 */
export function createSignalTestEnv(): SignalHandler;

/**
 * Create a test that waits for a specific signal before completing
 */
export function createSignalTest(
  testFn: (...args: any[]) => Promise<any>, 
  signalName: string, 
  timeout?: number
): (...args: any[]) => Promise<any>;
`);

  // mockTimer.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/mockTimer.d.ts'), `
export interface Timer {
  id: number;
  callback: Function;
  delay: number;
  args: any[];
  time: number;
  repeat: boolean;
}

/**
 * Mock timer for testing time-based functions
 */
export class MockTimer {
  currentTime: number;
  timers: Timer[];
  nextTimerId: number;
  
  constructor();
  
  /**
   * Install the mock timer
   */
  install(): void;
  
  /**
   * Uninstall the mock timer
   */
  uninstall(): void;
  
  /**
   * Advance time by a specified amount of ms
   */
  advanceTime(ms: number): void;
  
  /**
   * Run all pending timers
   */
  runAll(): void;
  
  /**
   * Run only pending timers that should execute before a specific time
   */
  runUntil(timestamp: number): void;
}

/**
 * Create and install a mock timer for testing
 */
export function useMockTimer(): MockTimer;
`);

  // depSnapshot.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/depSnapshot.d.ts'), `
export interface DiffResult {
  added: string[];
  removed: string[];
  changed: string[];
}

/**
 * Dependency snapshot for capturing and restoring dependency state
 */
export class DependencySnapshot {
  snapshot: Record<string, any> | null;
  
  constructor(deps?: Record<string, any> | null);
  
  /**
   * Take a snapshot of current dependencies
   */
  capture(): DependencySnapshot;
  
  /**
   * Restore dependencies from snapshot
   */
  restore(): DependencySnapshot;
  
  /**
   * Get a specific dependency from the snapshot
   */
  getDependency(name: string): any | null;
  
  /**
   * Compare current dependencies to snapshot
   */
  diff(): DiffResult;
}

/**
 * Create a new dependency snapshot
 */
export function createSnapshot(): DependencySnapshot;

/**
 * Run a function with a dependency snapshot and restore after
 */
export function withSnapshot<T>(fn: () => Promise<T> | T): Promise<T>;
`);

  // logger.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/logger.d.ts'), `
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
`);

  // resourceManager.d.ts
  fs.writeFileSync(path.join(__dirname, '..', 'lib/resourceManager.d.ts'), `
/**
 * A class to manage resources that need to be cleaned up after tests
 */
export class ResourceManager {
  resources: Array<{ resource: any; cleanupFn: (resource: any) => Promise<void> | void }>;
  
  /**
   * Add a resource with a cleanup function
   */
  add<T>(resource: T, cleanupFn: (resource: T) => Promise<void> | void): T;
  
  /**
   * Clean up all resources in reverse order of addition
   */
  cleanupAll(): Promise<void>;
  
  /**
   * Get the count of managed resources
   */
  get count(): number;
}

/**
 * Create a resource manager for a test
 */
export function createResourceManager(): ResourceManager;

/**
 * Create a temporary file that will be deleted after the test
 */
export function createTempFile(content: string, fileName?: string): {
  path: string;
  cleanup(): Promise<void>;
};

/**
 * Create a function that will run after the test and clean up resources
 */
export function withCleanup<T extends (...args: any[]) => any>(
  setupFn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>>;
`);

  console.log('Type declarations created');
}

build();
