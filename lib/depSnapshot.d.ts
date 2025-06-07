
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
