/**
 * This script patches the AsyncLocalDeps module to add debugging output
 * It's designed to be run with NODE_OPTIONS="--require ./scripts/als-debug-patch.js"
 * to instrument the module for debugging without modifying the source code.
 * 
 * Enhanced version for CI debugging - June 9, 2025
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'node:async_hooks';

// no __dirname or __filename in ES modules, so we need to resolve them
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// The original require function
const originalRequire = prototype.require;

// Patched require function
prototype.require = function(id) {
  const result = originalRequire.call(this, id);
  
  // Only patch our specific module
  if (id.includes('asyncLocalDeps')) {
    console.log(`[ALS Debug] Module "${id}" loaded`);
    
    // Patch the functions we want to debug
    if (result.setUpLocalDeps) {
      const originalSetUpLocalDeps = result.setUpLocalDeps;
      result.setUpLocalDeps = function(deps) {
        console.log(`[ALS Debug] setUpLocalDeps called with:`, deps ? Object.keys(deps) : 'null/undefined');
        console.log(`[ALS Debug] global.__appAls exists: ${!!global.__appAls}`);
        return originalSetUpLocalDeps.apply(this, arguments);
      };
    }
    
    if (result.getLocalDeps) {
      const originalGetLocalDeps = result.getLocalDeps;
      result.getLocalDeps = function(suppressError) {
        const deps = originalGetLocalDeps.apply(this, arguments);
        console.log(`[ALS Debug] getLocalDeps called (suppressError=${!!suppressError}), returns:`, deps ? Object.keys(deps) : 'null/undefined');
        return deps;
      };
    }
    
    if (result.runWithLocalDeps) {
      const originalRunWithLocalDeps = result.runWithLocalDeps;
      result.runWithLocalDeps = function(deps, callback, timeout) {
        console.log(`[ALS Debug] runWithLocalDeps called with:`, deps ? Object.keys(deps) : 'null/undefined');
        return originalRunWithLocalDeps.apply(this, arguments);
      };
    }
  }
  
  return result;
};

// Setup logging to file
const LOG_FILE = path.join(__dirname, '../logs/als-debug.log');
// Ensure log directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Clear or create log file
fs.writeFileSync(LOG_FILE, `AsyncLocalStorage Debug Log - ${new Date().toISOString()}\n\n`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
  if (process.env.DEBUG) {
    console.log(`[ALS Debug] ${message}`);
  }
}

// Patch AsyncLocalStorage methods directly
const originalEnterWith = AsyncLocalStorage.prototype.enterWith;
AsyncLocalStorage.prototype.enterWith = function debugEnterWith(store) {
  const storeType = store instanceof Map ? 'Map' : typeof store;
  log(`enterWith called with store type: ${storeType}`);
  
  try {
    const result = originalEnterWith.call(this, store);
    log(`enterWith succeeded`);
    return result;
  } catch (error) {
    log(`enterWith failed: ${error.message}`);
    throw error;
  }
};

const originalRun = AsyncLocalStorage.prototype.run;
AsyncLocalStorage.prototype.run = function debugRun(store, callback) {
  const storeType = store instanceof Map ? 'Map' : typeof store;
  log(`run called with store type: ${storeType}`);
  
  try {
    const result = originalRun.call(this, store, (...args) => {
      log(`run callback executing`);
      return callback(...args);
    });
    log(`run completed successfully`);
    return result;
  } catch (error) {
    log(`run failed: ${error.message}`);
    throw error;
  }
};

const originalGetStore = AsyncLocalStorage.prototype.getStore;
AsyncLocalStorage.prototype.getStore = function debugGetStore() {
  try {
    const store = originalGetStore.call(this);
    const storeType = store ? (store instanceof Map ? 'Map' : typeof store) : 'undefined/null';
    log(`getStore returned store of type: ${storeType}`);
    return store;
  } catch (error) {
    log(`getStore failed: ${error.message}`);
    throw error;
  }
};

// Track global.__appAls changes
let originalAppAls = global.__appAls;
Object.defineProperty(global, '__appAls', {
  get() {
    return originalAppAls;
  },
  set(value) {
    log(`global.__appAls being set to ${value ? 'new instance' : 'null/undefined'}`);
    originalAppAls = value;
  },
  configurable: true
});

log(`AsyncLocalStorage debugging enabled - Node ${process.version}`);
log(`Running in CI: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
log(`Patched both require() and AsyncLocalStorage prototype methods`);
