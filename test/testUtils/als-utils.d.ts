/**
 * Type definitions for Jest test helpers for AsyncLocalStorage
 */

/**
 * Ensures that AsyncLocalStorage is initialized for Jest tests
 * Call this in beforeAll or beforeEach hooks to guarantee initialization
 * @param initialDeps Initial dependencies to set up
 */
export function ensureALSInitialized(initialDeps?: Record<string, any>): Record<string, any>;

/**
 * Wraps a test function with AsyncLocalStorage initialization
 * Use this when you need to ensure ALS is available within a specific test
 * @param testFn The test function to wrap
 * @param deps Dependencies to inject
 * @returns Wrapped test function with the same signature
 */
export function withALS<T extends (...args: any[]) => any>(
  testFn: T, 
  deps?: Record<string, any>
): (...args: Parameters<T>) => ReturnType<T>;

/**
 * Wrap Jest's describe to ensure ALS initialization for all tests within
 * @param description Test suite description
 * @param deps Shared dependencies for all tests in the suite
 * @param definitionFn Function containing test definitions
 */
export function describeWithALS(
  description: string, 
  deps: Record<string, any>, 
  definitionFn: () => void
): void;

/**
 * Overload for describeWithALS when deps parameter is omitted
 * @param description Test suite description
 * @param definitionFn Function containing test definitions
 */
export function describeWithALS(
  description: string, 
  definitionFn: () => void
): void;

/**
 * Clear ALS after tests to prevent leakage
 * Call this in afterAll if you need to clean up
 */
export function cleanupALS(): void;
