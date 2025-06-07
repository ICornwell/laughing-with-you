// Main entry point for laughing-with-you library

// Core functionality
const asyncLocal = require('./asyncLocalDeps');
const waitSignals = require('./waitForSignals');
const analytics = require('./analytics');
const signalTesting = require('./signalTesting');
const mockTimer = require('./mockTimer');
const depSnapshot = require('./depSnapshot');
const resourceManager = require('./resourceManager');

// Proxy functionality
const proxyDeps = require('./proxyDeps');
const proxyGen = require('./proxyGen');
const proxyModule = require('./proxyModule');

// Test framework integrations
const jest = require('./jest');
const vite = require('./vite');

module.exports = {
  // Core functionality
  ...asyncLocal,
  ...waitSignals,
  ...analytics,
  ...signalTesting,
  ...mockTimer,
  ...depSnapshot,
  ...resourceManager,
  
  // Proxy functionality
  ...proxyDeps,
  ...proxyModule,
  ...proxyGen,
  
  // Test framework integrations
  jest,
  vite,
};
