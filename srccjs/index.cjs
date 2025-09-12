"use strict";

const asyncLocalDeps = require("./asyncLocalDeps");
const waitForSignals = require("./waitForSignals");
const analytics = require("./analytics");
const signalTesting = require("./signalTesting");
const {allDeps} = require("./deps");
const asyncLocalDeps2 = require("./asyncLocalDeps");

const proxyDep = require("./proxyDeps");
const proxyGen = require("./proxyGen");
const proxyModule = require("./proxyModule");
const testWrappers = require("./jest/testWrappers");

// Main entry point for laughing-with-you library

// Core functionality

console.log(asyncLocalDeps2, asyncLocalDeps2.getTestContext, asyncLocalDeps2.getLocalDeps, asyncLocalDeps2.setTestContext);
console.log(allDeps, allDeps.depSnapshot, allDeps.mockTimer, allDeps.logger, allDeps.e2e);
module.exports = {
  // Core functionality
  ...asyncLocalDeps,
  ...waitForSignals,
  ...analytics,
  ...signalTesting,
  ...allDeps.mockTimer,
  ...allDeps.depSnapshot,
  ...allDeps.resourceManager,
  ...allDeps.logger,
  ...allDeps.e2e,
  // Proxy functionality
  ...proxyDep,
  ...proxyModule,
  ...proxyGen,
  // Test framework integrations
  jest: {
    jestTestWrappers: testWrappers
  }
};