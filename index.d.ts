// Type definitions for laughing-with-you
// Project: https://github.com/icornwell/laughing-with-you

/// <reference types="jest" />
/// <reference types="vitest" />

import { ResourceManager } from './resourceManager';
import { MockTimer } from './mockTimer';
import { DependencySnapshot } from './depSnapshot';
import { SignalHandler } from './signalTesting';

// Core exports from main module
declare module 'laughing-with-you' {
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
   * Run a function with specific dependencies in AsyncLocalStorage
   */
  export function runWithLocalDeps(
    deps: Record<string, any>,
    callback: Function,
    timeout?: number
  ): Promise<any>;
  
  /**
   * Run a function with a test context
   */
  export function runWithTestContext(
    callback: Function,
    timeout?: number
  ): Promise<any>;
  
  /**
   * Get the current test context
   */
  export function getTestContext(): Record<string, any> | null;
  
  /**
   * Record function calls for analytics
   */
  export function recordCalls(
    name: string,
    methodNames?: string[]
  ): {
    getStats(): any;
    reset(): void;
  };
  
  /**
   * Create a proxy for a dependency
   */
  export function proxyDep<T extends object>(dep: T, name: string): T;
  
  /**
   * Auto-generate proxies for all exports of a module
   */
  export function proxyModule<T extends object>(module: T, name: string): T;
  
  /**
   * Generate proxy modules for common dependencies
   */
  export function generateProxies(
    targetDir?: string,
    deps?: string[]
  ): void;
  
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
  
  /**
   * Create and install a mock timer for testing
   */
  export function useMockTimer(): MockTimer;
  
  /**
   * Create a new dependency snapshot
   */
  export function createSnapshot(): DependencySnapshot;
  
  /**
   * Run a function with a dependency snapshot and restore after
   */
  export function withSnapshot<T>(fn: () => Promise<T> | T): Promise<T>;
  
  /**
   * Create a resource manager for a test
   */
  export function createResourceManager(): ResourceManager;
  
  /**
   * Create a temporary file that will be deleted after the test
   */
  export function createTempFile(
    content: string,
    fileName?: string
  ): {
    path: string;
    cleanup(): Promise<void>;
  };
  
  /**
   * Create a function that will run after the test and clean up resources
   */
  export function withCleanup<T extends (...args: any[]) => any>(
    setupFn: T
  ): (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

// Jest specific exports
declare module 'laughing-with-you/jest' {
  /**
   * Jest describe with local dependencies
   */
  export function describeWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest it with local dependencies
   */
  export function itWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest beforeEach with local dependencies
   */
  export function beforeEachWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest beforeAll with local dependencies
   */
  export function beforeAllWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest afterEach with local dependencies
   */
  export function afterEachWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest afterAll with local dependencies
   */
  export function afterAllWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest test with local dependencies
   */
  export function testWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Jest spec with local dependencies
   */
  export function specWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
}

// Vitest specific exports
declare module 'laughing-with-you/vite' {
  /**
   * Vitest describe with local dependencies
   */
  export function describeWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest it with local dependencies
   */
  export function itWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest beforeEach with local dependencies
   */
  export function beforeEachWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest beforeAll with local dependencies
   */
  export function beforeAllWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest afterEach with local dependencies
   */
  export function afterEachWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest afterAll with local dependencies
   */
  export function afterAllWithLocalDeps(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest test with local dependencies
   */
  export function testWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
  
  /**
   * Vitest spec with local dependencies
   */
  export function specWithLocalDeps(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
}
