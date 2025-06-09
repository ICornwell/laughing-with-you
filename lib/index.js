// Main entry point for laughing-with-you library

// Core functionality
import asyncLocal from './asyncLocalDeps';
import waitSignals from './waitForSignals';
import analytics from './analytics';
import signalTesting from './signalTesting';
import mockTimer from './mockTimer';
import depSnapshot from './depSnapshot';
import resourceManager from './resourceManager';
import logger from './logger';
import e2e from './e2e';

// Proxy functionality
import proxyDeps from './proxyDeps';
import proxyGen from './proxyGen';
import proxyModule from './proxyModule';

import jestTestWrappers from './jest/testWrappers'
import vitestTestWrappers from './vitest/testWrappers'

export default {
  // Core functionality
  ...asyncLocal,
  ...waitSignals,
  ...analytics,
  ...signalTesting,
  ...mockTimer,
  ...depSnapshot,
  ...resourceManager,
  ...logger,
  ...e2e,
  
  // Proxy functionality
  ...proxyDeps,
  ...proxyModule,
  ...proxyGen,
  
  // Test framework integrations
  jest : { jestTestWrappers},
  vitest: { vitestTestWrappers},
};
