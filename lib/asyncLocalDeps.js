const { set } = require('async-local-storage')
const { AsyncLocalStorage } = require('node:async_hooks')
const { time } = require('node:console')

// console.log('Initializing async local storage for dependencies...')
// Use the global object as a registry
global.__appAls = global.__appAls || new AsyncLocalStorage()
const als = global.__appAls

async function runWithLocalDeps(deps = {}, callback, timeout = 5000) {
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
      result = als.run(
        new Map([['testContext', {}], ['dependencies', deps]]),callback);
    } else {
      // If store already exists, we can just set the dependencies
      store.set('dependencies', deps);
      result = await callback();
    }
    
    return result;  // Return the result from either branch
  } finally {
    clearTimeout(to);  // Always clear the timeout
  }
}

function setUpLocalDeps (deps = {}) {
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
function addLocalDeps (newDeps) {
  // Add new dependencies to the async local storage
  const currentDeps = als.getStore().get('dependencies')
  if (!currentDeps) {
    throw new Error(
      'AsyncLocalStorage is not initialized. Call setUpLocalDeps first.'
    )
  }

  als.getStore().set('dependencies', { ...currentDeps, ...newDeps })
}
function getLocalDeps () {
  // Retrieve the current dependencies from async local storage
  const currentDeps = als.getStore()?.get('dependencies')
  return currentDeps || null
}

async function runWithTestContext(callback, timeout = 5000) {
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

function getTestContext () {
  // Retrieve the current dependencies from async local storage

  const testContext = als.getStore()?.get('testContext')
  return testContext || null
}
function setTestContext (newTestContext, replaceAll = false) {
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

module.exports = {
  runWithLocalDeps,
  setUpLocalDeps,
  addLocalDeps,
  getLocalDeps,
  runWithTestContext,
  getTestContext,
  setTestContext
}
