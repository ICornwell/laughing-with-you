
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
