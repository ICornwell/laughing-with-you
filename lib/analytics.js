import { getLocalDeps, addLocalDeps } from './asyncLocalDeps';

// Store for analytics data
export const analytics = {
  calls: new Map(),
  recordCall(name, prop, args, result, duration) {
    const key = `${name}.${String(prop)}`;
    if (!this.calls.has(key)) {
      this.calls.set(key, { count: 0, totalTime: 0, samples: [] });
    }
    
    const stats = this.calls.get(key);
    stats.count++;
    stats.totalTime += duration;
    
    // Store sample (limited to prevent memory issues)
    if (stats.samples.length < 100) {
      stats.samples.push({ args, result, duration });
    }
  },
  getStats() {
    const result = {};
    for (const [key, stats] of this.calls.entries()) {
      result[key] = {
        calls: stats.count,
        avgTime: stats.totalTime / stats.count,
        totalTime: stats.totalTime,
        samples: stats.samples
      };
    }
    return result;
  },
  reset() {
    this.calls.clear();
  }
};

/**
 * Record function calls for analytics
 */
export function recordCalls(name, methodNames = []) {
  const deps = getLocalDeps();
  if (!deps || !deps[name]) {
    throw new Error(`Cannot record ${name} - not found in local deps`);
  }
  
  const original = deps[name];
  const wrapped = {};
  
  // If methodNames is empty, try to record all methods
  const methods = methodNames.length > 0 ? methodNames : 
    Object.keys(original).filter(key => typeof original[key] === 'function');
  
  // Wrap each method for recording
  for (const method of methods) {
    if (typeof original[method] === 'function') {
      wrapped[method] = function(...args) {
        const start = performance.now();
        try {
          const result = original[method].apply(this, args);
          
          if (result instanceof Promise) {
            return result.then(
              value => {
                const duration = performance.now() - start;
                analytics.recordCall(name, method, args, value, duration);
                return value;
              },
              error => {
                const duration = performance.now() - start;
                analytics.recordCall(name, method, args, { error: error.message }, duration);
                throw error;
              }
            );
          }
          
          const duration = performance.now() - start;
          analytics.recordCall(name, method, args, result, duration);
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          analytics.recordCall(name, method, args, { error: error.message }, duration);
          throw error;
        }
      };
    } else {
      wrapped[method] = original[method];
    }
  }
  
  // For methods not explicitly wrapped, pass through
  const handler = {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return original[prop];
    }
  };
  
  // Replace in local deps
  const updatedDeps = { [name]: new Proxy(wrapped, handler) };
  addLocalDeps(updatedDeps);
  
  return {
    getStats: () => analytics.getStats(),
    reset: () => analytics.reset()
  };
}

export default {
  recordCalls,
  analytics
};