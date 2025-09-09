// Main entry point for laughing-with-you library

// Core functionality
import asyncLocal from './asyncLocalDeps';
import waitSignals from './waitForSignals';
import analytics from './analytics';
import signalTesting from './signalTesting';
import x, { depSnapshot, logger, e2e, mockTimer, resourceManager } from './deps';
import y, {getTestContext,getLocalDeps, setTestContext} from '../src/asyncLocalDeps'
//import { depSnapshot } from './deps/index.js';
//import resourceManager from './resourceManager';
//import { logger } from './deps';
//import { e2e } from './deps';

// Proxy functionality
import proxyDeps from './proxyDeps';
import proxyGen from './proxyGen';
import proxyModule from './proxyModule';

import jestTestWrappers from './jest/testWrappers'
import vitestTestWrappers from './vitest/testWrappers'
console.log(y, getTestContext, getLocalDeps, setTestContext)
console.log(x, depSnapshot, mockTimer, logger, e2e)

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
  jest: { jestTestWrappers },
  vitest: { vitestTestWrappers },
};
