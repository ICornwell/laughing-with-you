// als-patch.js - Patches AsyncLocalStorage for better cross-environment compatibility
// This file should be loaded early in the test setup process

import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Makes AsyncLocalStorage more robust across different Node.js environments
 * by applying protective patches and monkey patches where needed.
 */
export function patchAsyncLocalStorage() {
  const originalALS = AsyncLocalStorage;
  const isNode16 = process.version.startsWith('v16.');
  const isInCI = process.env.CI === 'true';
  
  console.log(`[ALS Patch] Running in Node.js ${process.version}`);
  console.log(`[ALS Patch] Running in CI: ${isInCI}`);

  // Only apply patches if needed
  if (!isNode16 && !isInCI) {
    console.log('[ALS Patch] No patches needed for this environment');
    return;
  }

  console.log('[ALS Patch] Applying compatibility patches for AsyncLocalStorage');

  // Create more robust wrapper for ALS.prototype.enterWith
  const originalEnterWith = AsyncLocalStorage.prototype.enterWith;
  AsyncLocalStorage.prototype.enterWith = function patchedEnterWith(store) {
    try {
      // Standard approach
      return originalEnterWith.call(this, store);
    } catch (error) {
      console.warn(`[ALS Patch] Error in enterWith: ${error.message}`);
      console.warn('[ALS Patch] Attempting fallback approach');
      
      // Fallback for environments that don't handle certain store types
      try {
        // If store is a Map, convert to plain object
        if (store instanceof Map) {
          const plainObj = {};
          store.forEach((value, key) => {
            plainObj[key] = value;
          });
          return originalEnterWith.call(this, plainObj);
        }
        
        // Try with plain object as a last resort
        return originalEnterWith.call(this, { ...store });
      } catch (nestedError) {
        console.error(`[ALS Patch] Fallback also failed: ${nestedError.message}`);
        throw error; // Throw original error for better debugging
      }
    }
  };

  // Create a safer global.__appAls initialization method
  global.ensureSafeAppAls = function ensureSafeAppAls() {
    if (!global.__appAls) {
      try {
        global.__appAls = new AsyncLocalStorage();
        console.log('[ALS Patch] Created new global.__appAls instance');
      } catch (error) {
        console.error(`[ALS Patch] Error creating ALS: ${error.message}`);
        // Last resort fallback to null
        global.__appAls = null;
      }
    }
    return global.__appAls;
  };

  console.log('[ALS Patch] AsyncLocalStorage successfully patched');
  return originalALS;
}

// Export patched AsyncLocalStorage
export const PatchedAsyncLocalStorage = patchAsyncLocalStorage();
export default PatchedAsyncLocalStorage;
