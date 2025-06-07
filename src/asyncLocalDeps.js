import { AsyncLocalStorage } from 'node:async_hooks';

// console.log('Initializing async local storage for dependencies...')
// Use the global object as a registry
global.__appAls = global.__appAls || new AsyncLocalStorage()
const als = global.__appAls

export async function runWithLocalDeps(deps = {}, callback, timeout = 5000) {
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
    
    if (!store) {
      // Initialize with empty dependencies if none are provided
      const safeDeps = deps || {};
      result = als.run(
        new Map([['testContext', {}], ['dependencies', safeDeps]]), callback);
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
  const store = als.getStore()
  if (store) {
    // If store already exists, we can just set the dependencies
    const currentDeps = store.get('dependencies')
    if (currentDeps) {
      // If dependencies already exist, merge them
      deps = { ...currentDeps, ...deps }
    }
    store.set('dependencies', deps)
    return
  }
  als.enterWith(new Map([['testContext', {}], ['dependencies', deps]]))
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
}
export function getLocalDeps () {
  // Retrieve the current dependencies from async local storage
  const currentDeps = als.getStore()?.get('dependencies')
  return currentDeps || {}  // Return empty object instead of null
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


