// Setup file for Vitest tests
import { AsyncLocalStorage } from 'node:async_hooks';
import { setUpLocalDeps } from '../src/asyncLocalDeps.js';

// Ensure AsyncLocalStorage is properly initialized for Vitest tests
// Unlike Jest, Vitest appears to maintain a consistent AsyncLocalStorage context
// across all tests by default, so we just need to initialize it once
if (!global.__appAls) {
  global.__appAls = new AsyncLocalStorage();
  console.log('Vitest setup: AsyncLocalStorage initialized');
}

// Initialize empty dependencies
setUpLocalDeps();

// This is intentionally kept simple as Vitest has better ESM support
// and typically requires fewer compatibility fixes
