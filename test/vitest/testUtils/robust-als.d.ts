/**
 * Type definitions for robust AsyncLocalStorage utilities
 */
import { AsyncLocalStorage } from 'node:async_hooks';

export interface ALSMock {
  getStore: () => any;
  run: (store: any, callback: Function) => any;
  enterWith: (store: any) => void;
  exit: (callback: Function) => any;
  __isMock: boolean;
}

/**
 * Creates a robust AsyncLocalStorage that works consistently across environments
 */
export function createRobustALS(): AsyncLocalStorage<any> | ALSMock;

/**
 * Runs a function with robust AsyncLocalStorage setup
 * @param deps Dependencies to inject into the AsyncLocalStorage context
 * @param callback Function to run within the AsyncLocalStorage context
 */
export function runWithRobustALS<T = any>(deps: Record<string, any>, callback: () => T | Promise<T>): Promise<T>;

/**
 * Gets dependencies from ALS with robust error handling
 */
export function getDepsRobustly(): Record<string, any>;

/**
 * Sets dependencies in ALS with robust error handling
 * @param deps Dependencies to set in the AsyncLocalStorage context
 */
export function setDepsRobustly(deps: Record<string, any>): void;

declare const robustAls: {
  createRobustALS: typeof createRobustALS;
  runWithRobustALS: typeof runWithRobustALS;
  getDepsRobustly: typeof getDepsRobustly;
  setDepsRobustly: typeof setDepsRobustly;
};

export default robustAls;
