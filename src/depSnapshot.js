// Dependency snapshot utilities
import { getLocalDeps, setUpLocalDeps } from './asyncLocalDeps';

/**
 * Deep clone an object to create a snapshot
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // Handle Object
  if (obj instanceof Object) {
    const copy = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(value);
      }
    }
    return copy;
  }
  
  throw new Error(`Unable to deep clone ${obj}`);
}

/**
 * Create a new dependency snapshot
 */
function createSnapshot(deps) {
  // Initialize snapshot from provided deps or from current deps
  let snapshot;
  
  if (deps) {
    snapshot = deepClone(deps);
  } else {
    const currentDeps = getLocalDeps();
    if (currentDeps) {
      snapshot = deepClone(currentDeps);
    } else {
      snapshot = {};
    }
  }
  
  return {
  /**
   * Take a snapshot of current dependencies
   */
  capture: function() {
    const deps = getLocalDeps();
    if (!deps) {
      throw new Error('No dependencies found in AsyncLocalStorage');
    }
    
    snapshot = deepClone(deps);
    return this;
  },
  
  /**
   * Restore dependencies from snapshot
   */
  restore: function() {
    if (!snapshot) {
      throw new Error('No snapshot to restore');
    }
    
    setUpLocalDeps(snapshot);
    return this;
  },
  
  /**
   * Get a specific dependency from the snapshot
   */
  getDependency: function(name) {
    if (!snapshot || !snapshot[name]) {
      return null;
    }
    
    return snapshot[name];
  },
  
  /**
   * Compare current dependencies to snapshot
   * Returns an object with added, removed, and changed keys
   */
  diff: function() {
    const currentDeps = getLocalDeps();
    if (!currentDeps) {
      return {
        added: [],
        removed: Object.keys(snapshot || {}),
        changed: []
      };
    }
    
    if (!snapshot) {
      return {
        added: Object.keys(currentDeps),
        removed: [],
        changed: []
      };
    }
    
    const added = [];
    const removed = [];
    const changed = [];
    
    // Find added and changed
    for (const key of Object.keys(currentDeps)) {
      if (!(key in snapshot)) {
        added.push(key);
      } else {
        // For service objects with methods, we can't reliably compare with JSON.stringify
        // Instead, check if the function values have changed
        const current = currentDeps[key];
        const snapshotValue = snapshot[key];
        
        // Special handling for service objects with getValue method
        if (current && snapshotValue && 
            typeof current.getValue === 'function' && 
            typeof snapshotValue.getValue === 'function') {
          try {
            if (current.getValue() !== snapshotValue.getValue()) {
              changed.push(key);
            }
          } catch (e) {
            // If can't compare, assume changed
            changed.push(key);
          }
        } else if (JSON.stringify(current) !== JSON.stringify(snapshotValue)) {
          changed.push(key);
        }
      }
    }
    
    // Find removed
    for (const key of Object.keys(snapshot)) {
      if (!(key in currentDeps)) {
        removed.push(key);
      }
    }
    
    return { added, removed, changed };
  }
  };
}
/**
 * Create a new dependency snapshot
 */


/**
 * Run a function with a dependency snapshot and restore after
 */
export async function withSnapshot(fn) {
  const snapshot = createSnapshot();
  try {
    return await fn();
  } finally {
    snapshot.restore();
  }
}

// Re-export createSnapshot explicitly
export { createSnapshot };

// Export as default for backward compatibility
export default {
  createSnapshot,
  withSnapshot
};
