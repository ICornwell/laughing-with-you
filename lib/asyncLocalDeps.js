import { AsyncLocalStorage, executionAsyncId } from 'node:async_hooks';

// console.log('Initializing async local storage for dependencies...')
// Use the global object as a registry
global.__appAls = global.__appAls || new AsyncLocalStorage()
const als = global.__appAls

export async function runWithLocalDeps(deps = {}, callback, timeout = 5000) {
  if (process.env.DEBUG) timeout = 120000;  // Override timeout for debugging purposes

  console.log(`timeout: ${timeout}ms, running with deps:${Object.keys(deps).length}, debug:${process.env.DEBUG}`)
  console.log('Current executionAsyncId:', executionAsyncId());
  const to = setTimeout(() => {
    console.error(
      'AsyncLocalStorage runWithLocalDeps timed out after',
      timeout,
      'ms'
    );
    throw new Error('Timeout exceeded');
  }, timeout);
  
  try {
    const store = als.getStore();
    let result;
    const id = executionAsyncId()
    if (!store) {
      // Initialize with empty dependencies if none are provided
      const safeDeps = deps || {};
      result = als.run(
        new Map([['testContext', {}], ['dependencies', safeDeps]]),
        ()=> {
           console.log('Running with executionAsyncId:', id);
           callback()
        });
    } else {
      // If store already exists, we can just set the dependencies
      // Initialize with empty dependencies if none are provided
      const existingDeps = store.get('dependencies') || {};
      deps = { ...existingDeps, ...deps };  // Merge existing and new dependencies
      store.set('dependencies', deps || {});
      result = await callback();
    }
    
    return result;  // Return the result from either branch
  } finally {
    clearTimeout(to);  // Always clear the timeout
  }
}

export function setUpLocalDeps (deps = {}) {
  const store = als.getStore();
  
  if (store) {
    // If store already exists, handle different possible structures
    console.log('Setup using executionAsyncId:', executionAsyncId());
    if (store instanceof Map) {
      // Standard Map structure
      const currentDeps = store.get('dependencies') || {};
      store.set('dependencies', Object.assign(currentDeps, deps));
      return;
    } else if (typeof store === 'object' && store !== null) {
      // Object structure (fallback case in some environments)
      store.dependencies = { ...(store.dependencies || {}), ...deps };
      return;
    }
    // For any other structure, fall through to create a new store
  }
  
  // No store or unhandled store type, create a new one
  try {
    // Preferred method with Map structure
    als.enterWith(new Map([['testContext', {}], ['dependencies', deps]]));
    console.log('Entering with with executionAsyncId:', executionAsyncId());
  } catch (error) {
    console.error('Error setting up local deps with Map structure:', error);
    
    // Fallback to simple object for environments that don't support Map in ALS
    try {
      als.enterWith({ dependencies: deps, testContext: {} });
    } catch (nestedError) {
      console.error('Fallback also failed, using direct object:', nestedError);
      als.enterWith(deps); // Last resort
    }
  }
}

export function clearAllLocalDeps () {
  const store = als.getStore()
  if (store) {
    // If store already exists, we remove it
    store.delete('dependencies')
  }
}

export function addLocalDeps (newDeps, supressError = false) {
  // Add new dependencies to the async local storage
  const currentDeps = als.getStore()?.get('dependencies')
  if (!currentDeps) {
    if (supressError) return
    throw new Error(
      'AsyncLocalStorage is not initialized. Use runWithLocalDeps or call setUpLocalDeps first.'
    )
  } 

  als.getStore().set('dependencies', { ...currentDeps, ...newDeps })
  console.log('Added with executionAsyncId:', executionAsyncId());
}
export function getLocalDeps () {
  // Retrieve the current dependencies from async local storage
  const store = als.getStore();
  const id = executionAsyncId()
  
  // Handle different store structures that might be created in different environments
  if (!store) {
    console.log('Getting with no store');
    return {}; // No store at all, return empty object
  }
  console.log('Getting from executionAsyncId:', executionAsyncId());
  // Handle Map structure (normal case)
  if (store instanceof Map) {
    return store.get('dependencies') || {};
  }
  
  // Handle object structure (fallback case used in some environments)
  if (typeof store === 'object' && store !== null) {
    return store.dependencies || store || {};
  }
  
  // Any other case, return empty object
  return {};
}

export async function runWithTestContext(callback, timeout = 5000) {
  console.log('Running runWithTestContext with timeout:', timeout);
  const to = setTimeout(() => {
    console.error(
      'AsyncLocalStorage runWithTestContext timed out after',
      timeout,
      'ms'
    );
    throw new Error('Timeout exceeded');
  }, timeout);
  
  try {
    const store = als.getStore();
    let result;
    
    if (!store) {
      result = als.run(new Map([['testContext', {}], ['dependencies', {}]]),callback);  // Just await the callback directly
    } else {
      store.set('dependencies', {});
      result = await callback();
    }
    
    return result;  // Return the result from either branch
  } finally {
    clearTimeout(to);  // Always clear the timeout
  }
}

export function getTestContext () {
  // Retrieve the current dependencies from async local storage

  const testContext = als.getStore()?.get('testContext')
  return testContext || null
}
export function setTestContext (newTestContext, replaceAll = false) {
  // Retrieve the current dependencies from async local storage
  const store = als.getStore()
  if (!store) {
    throw new Error(
      'AsyncLocalStorage is not initialized. Call runWithTestContext first.'
    )
  }
  const testContext = als.getStore()?.get('testContext')
  if (testContext) {
    if (replaceAll) {
      store.set('testContext', newTestContext)
      return newTestContext
    } else {
      return Object.assign(testContext, newTestContext)
    }
  }
}

export default {
  runWithLocalDeps,
  setUpLocalDeps,
  addLocalDeps,
  getLocalDeps,
  runWithTestContext,
  getTestContext,
  setTestContext
}


