/**
 * This script patches the AsyncLocalDeps module to add debugging output
 * It's designed to be run with NODE_OPTIONS="--require ./scripts/als-debug-patch.js"
 * to instrument the module for debugging without modifying the source code.
 */
const path = require('path');
const fs = require('fs');
const module = require('module');

// The original require function
const originalRequire = module.prototype.require;

// Patched require function
module.prototype.require = function(id) {
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
