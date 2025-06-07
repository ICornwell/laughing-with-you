// Dependency snapshot utilities
const { getLocalDeps, setUpLocalDeps } = require('./asyncLocalDeps');

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

class DependencySnapshot {
  constructor(deps = null) {
    this.snapshot = deps ? deepClone(deps) : null;
  }
  
  /**
   * Take a snapshot of current dependencies
   */
  capture() {
    const deps = getLocalDeps();
    if (!deps) {
      throw new Error('No dependencies found in AsyncLocalStorage');
    }
    
    this.snapshot = deepClone(deps);
    return this;
  }
  
  /**
   * Restore dependencies from snapshot
   */
  restore() {
    if (!this.snapshot) {
      throw new Error('No snapshot to restore');
    }
    
    setUpLocalDeps(this.snapshot);
    return this;
  }
  
  /**
   * Get a specific dependency from the snapshot
   */
  getDependency(name) {
    if (!this.snapshot || !this.snapshot[name]) {
      return null;
    }
    
    return this.snapshot[name];
  }
  
  /**
   * Compare current dependencies to snapshot
   * Returns an object with added, removed, and changed keys
   */
  diff() {
    const currentDeps = getLocalDeps();
    if (!currentDeps) {
      return {
        added: [],
        removed: Object.keys(this.snapshot || {}),
        changed: []
      };
    }
    
    if (!this.snapshot) {
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
      if (!(key in this.snapshot)) {
        added.push(key);
      } else if (JSON.stringify(currentDeps[key]) !== JSON.stringify(this.snapshot[key])) {
        changed.push(key);
      }
    }
    
    // Find removed
    for (const key of Object.keys(this.snapshot)) {
      if (!(key in currentDeps)) {
        removed.push(key);
      }
    }
    
    return { added, removed, changed };
  }
}

/**
 * Create a new dependency snapshot
 */
function createSnapshot() {
  return new DependencySnapshot().capture();
}

/**
 * Run a function with a dependency snapshot and restore after
 */
async function withSnapshot(fn) {
  const snapshot = createSnapshot();
  try {
    return await fn();
  } finally {
    snapshot.restore();
  }
}

module.exports = {
  DependencySnapshot,
  createSnapshot,
  withSnapshot
};
