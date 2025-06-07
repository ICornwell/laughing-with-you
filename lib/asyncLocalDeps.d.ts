
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
