#!/usr/bin/env node
// als-initialization-trace.js - Traces AsyncLocalStorage initialization across modules

import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '../logs/als-init-trace.log');

// Ensure log directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_FILE, `ALS Initialization Trace - ${new Date().toISOString()}\n\n`);

function log(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
  console.log(message);
}

// Record original ALS implementation
const originalAsyncLocalStorage = AsyncLocalStorage;

// Create a proxy to monitor AsyncLocalStorage instantiation
class TrackedAsyncLocalStorage extends AsyncLocalStorage {
  constructor() {
    super();
    const stack = new Error().stack;
    const caller = stack.split('\n')[2]?.trim() || 'Unknown caller';
    log(`[ALS INIT] AsyncLocalStorage instantiated at: ${new Date().toISOString()}`);
    log(`[ALS INIT] Caller: ${caller}`);
    log(`[ALS INIT] Global state: __appAls exists: ${!!global.__appAls}`);
    log('----------------------------');
  }
}

// Replace global AsyncLocalStorage with our tracked version
global.AsyncLocalStorage = TrackedAsyncLocalStorage;

// Track global.__appAls assignment
const appAlsDescriptor = Object.getOwnPropertyDescriptor(global, '__appAls') || { 
  configurable: true, 
  enumerable: true, 
  writable: true 
};

let globalAppAls = global.__appAls;

Object.defineProperty(global, '__appAls', {
  configurable: true,
  enumerable: true,
  get() {
    return globalAppAls;
  },
  set(value) {
    const stack = new Error().stack;
    const caller = stack.split('\n')[2]?.trim() || 'Unknown caller';
    log(`[GLOBAL ALS] global.__appAls ${globalAppAls ? 'reassigned' : 'assigned'} at: ${new Date().toISOString()}`);
    log(`[GLOBAL ALS] Caller: ${caller}`);
    log(`[GLOBAL ALS] New value type: ${value ? value.constructor.name : 'null/undefined'}`);
    log('----------------------------');
    globalAppAls = value;
  }
});

log(`[STARTUP] Monitoring AsyncLocalStorage - Node ${process.version}`);
log(`[STARTUP] Running in CI: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
log(`[STARTUP] Global structure: ${Object.prototype.toString.call(global)}`);
log('----------------------------');

// Allow command line argument to specify which files to test
const testFile = process.argv[2] || './test/snapshot.test.js';
log(`[STARTUP] Loading test file: ${testFile}`);

// Import the test file to trigger initialization
import(path.resolve(path.join(__dirname, '..', testFile)))
  .then(() => {
    log(`[COMPLETE] Test file loaded successfully`);
  })
  .catch(error => {
    log(`[ERROR] Failed to load test file: ${error.message}`);
    log(error.stack);
  });
