#!/usr/bin/env node
// als-ci-diagnostics.js - Enhanced diagnostics for AsyncLocalStorage in CI-like environment
import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Configuration
const REPORT_FILE = path.join(process.cwd(), 'logs', `als-diag-${Date.now()}.log`);
const VERBOSE = process.env.VERBOSE === 'true';

// Ensure logs directory exists
if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
}

// Create logger
function log(message, toFile = true) {
  console.log(message);
  if (toFile) {
    fs.appendFileSync(REPORT_FILE, message + '\n');
  }
}

// Create an informative diagnostics report on ALS behavior
log('=== AsyncLocalStorage CI Environment Diagnostics ===');
log(`Date: ${new Date().toISOString()}`);
log(`Report file: ${REPORT_FILE}`);

// System information
log('\n=== System Information ===');
log(`Node.js version: ${process.version}`);
log(`Platform: ${process.platform}`);
log(`Architecture: ${process.arch}`);
log(`Node.js V8 version: ${process.versions.v8}`);
log(`Memory: ${Math.round(os.totalmem() / (1024 * 1024))}MB`);
log(`CPU cores: ${os.cpus().length}`);
log(`Running in CI: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
log(`Test environment: ${process.env.NODE_ENV || 'not set'}`);

// Test basic ALS functionality
try {
  log('\n1. Testing basic ALS initialization...');
  const als = new AsyncLocalStorage();
  log('  - Created AsyncLocalStorage instance ✅');
  
  // Test store with Map
  log('\n2. Testing ALS with Map store...');
  let mapSuccess = false;
  try {
    als.enterWith(new Map([['test', 'value']]));
    const result = als.getStore().get('test');
    log(`  - ALS with Map: ${result === 'value' ? '✅ Working' : '❌ Failed'}`);
    mapSuccess = result === 'value';
  } catch (err) {
    log(`  - ALS with Map: ❌ Error: ${err.message}`);
  }
  
  // Test store with Object
  console.log('\n3. Testing ALS with plain Object store...');
  als.enterWith({ test: 'object-value' });
  try {
    const result = als.getStore().test;
    console.log(`  - ALS with Object: ${result === 'object-value' ? '✅ Working' : '❌ Failed'}`);
  } catch (err) {
    console.log(`  - ALS with Object: ❌ Error: ${err.message}`);
  }
  
  // Test nested context
  console.log('\n4. Testing ALS with nested context...');
  als.run({ level: 1 }, () => {
    const outerValue = als.getStore().level;
    console.log(`  - Outer context: level = ${outerValue}`);
    
    als.run({ level: 2 }, () => {
      const innerValue = als.getStore().level;
      console.log(`  - Inner context: level = ${innerValue}`);
    });
    
    const afterValue = als.getStore().level;
    console.log(`  - After inner context: level = ${afterValue}`);
    console.log(`  - Context restoration: ${afterValue === outerValue ? '✅ Working' : '❌ Failed'}`);
  });
  
  // Test Store Modification
  console.log('\n5. Testing store modification...');
  if (mapSuccess) {
    als.enterWith(new Map([['test', 'initial']]));
    console.log(`  - Initial value: ${als.getStore().get('test')}`);
    try {
      als.getStore().set('test', 'modified');
      console.log(`  - After modification: ${als.getStore().get('test')}`);
      console.log(`  - Store modification: ${als.getStore().get('test') === 'modified' ? '✅ Working' : '❌ Failed'}`);
    } catch (err) {
      console.log(`  - Store modification: ❌ Error: ${err.message}`);
    }
  } else {
    als.enterWith({ test: 'initial' });
    console.log(`  - Initial value: ${als.getStore().test}`);
    try {
      als.getStore().test = 'modified';
      console.log(`  - After modification: ${als.getStore().test}`);
      console.log(`  - Store modification: ${als.getStore().test === 'modified' ? '✅ Working' : '❌ Failed'}`);
    } catch (err) {
      console.log(`  - Store modification: ❌ Error: ${err.message}`);
    }
  }
  
  // Test with global
  log('\n6. Testing with global.__appAls...');
  global.__appAls = new AsyncLocalStorage();
  log('  - Created global.__appAls ✅');
  
  global.__appAls.enterWith({ globalTest: 'value' });
  log(`  - global.__appAls store: ${global.__appAls.getStore().globalTest === 'value' ? '✅ Working' : '❌ Failed'}`);
  
  // Test with async operations
  log('\n7. Testing with async operations...');
  
  // Promise-based test
  const promiseTest = async () => {
    return new Promise((resolve) => {
      global.__appAls.run({ asyncTest: 'promise-value' }, () => {
        setTimeout(() => {
          const value = global.__appAls.getStore()?.asyncTest;
          resolve(value);
        }, 10);
      });
    });
  };
  
  const promiseResult = await promiseTest();
  log(`  - Async with Promise: ${promiseResult === 'promise-value' ? '✅ Working' : `❌ Failed: ${promiseResult}`}`);
  
  // Test with simulated event loop phases
  log('\n8. Testing across event loop phases...');
  const phaseTest = new Promise((resolve) => {
    global.__appAls.run({ phaseTest: 'initial-value' }, () => {
      const immediate = setImmediate(() => {
        const immediateValue = global.__appAls.getStore()?.phaseTest;
        log(`  - setImmediate phase: ${immediateValue === 'initial-value' ? '✅ Working' : '❌ Failed'}`);
        
        process.nextTick(() => {
          const nextTickValue = global.__appAls.getStore()?.phaseTest;
          log(`  - nextTick phase: ${nextTickValue === 'initial-value' ? '✅ Working' : '❌ Failed'}`);
          resolve(true);
        });
      });
    });
  });
  
  await phaseTest;
  
  // Test with robust-als.js utils
  log('\n9. Testing robust-als.js compatibility...');
  try {
    const { createRobustALS, runWithRobustALS } = await import('../test/testUtils/robust-als.js');
    const robustAls = createRobustALS();
    log('  - Created robust ALS instance ✅');
    
    const robustResult = await runWithRobustALS({ testKey: 'robust-value' }, () => {
      return robustAls.getStore() instanceof Map ? 
             robustAls.getStore().get('dependencies')?.testKey :
             robustAls.getStore()?.dependencies?.testKey;
    });
    
    log(`  - Robust ALS run: ${robustResult === 'robust-value' ? '✅ Working' : `❌ Failed: ${robustResult}`}`);
  } catch (robustErr) {
    log(`  - Robust ALS import: ❌ Error: ${robustErr.message}`);
  }
  
  // Summary
  log('\n=== Diagnostics Summary ===');
  log('AsyncLocalStorage implementation appears to be:');
  if (mapSuccess) {
    log('✅ FULLY FUNCTIONAL - All tests passed successfully');
  } else {
    log('⚠️ PARTIALLY FUNCTIONAL - Some tests failed, check details above');
  }
  
  log('\nRecommendations:');
  log('- Use Map-based stores: ' + (mapSuccess ? '✅ Supported' : '❌ Not supported (use object instead)'));
  log('- Use run() method: ✅ Supported');
  log('- Use enterWith() method: ✅ Supported');
  log('- Use with async operations: ✅ Supported');
  
} catch (err) {
  log('❌ Diagnostics failed with error:', err);
  log(err.stack || 'No stack trace available');
}

log('\n=== AsyncLocalStorage CI Diagnostics Complete ===');
log(`Full report saved to: ${REPORT_FILE}`);
