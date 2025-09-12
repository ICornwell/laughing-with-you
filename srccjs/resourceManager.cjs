"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResourceManager = createResourceManager;
exports.createTempFile = createTempFile;
exports.default = void 0;
exports.withCleanup = withCleanup;
/**
 * Utilities for managing resource cleanup in tests
 */

/**
 * A class to manage resources that need to be cleaned up after tests
 */
function createResourceManager() {
  const resources = [];
  return {
    /**
     * Add a resource with a cleanup function
     * @param {*} resource - The resource object
     * @param {Function} cleanupFn - Function to call to clean up the resource
     */
    add: function (resource, cleanupFn) {
      this.resources.push({
        resource,
        cleanupFn
      });
      return resource;
    },
    /**
     * Clean up all resources in reverse order of addition
     */
    cleanupAll: async function () {
      const errors = [];

      // Process in reverse order (last in, first out)
      for (let i = resources.length - 1; i >= 0; i--) {
        const {
          resource,
          cleanupFn
        } = resources[i];
        try {
          // Handle async or sync cleanup functions
          await cleanupFn(resource);
        } catch (err) {
          errors.push(err);
        }
      }

      // Clear the resources array
      resources.length = 0;

      // If there were errors, throw the first one
      if (errors.length > 0) {
        throw new AggregateError(errors, `Failed to clean up ${errors.length} resources`);
      }
    },
    /**
     * Get the count of managed resources
     */
    resourceCount: function () {
      return this.resources.length;
    }
  };
}
/**
 * Create a resource manager for a test
 */

/**
 * Create a temporary file that will be deleted after the test
 * @param {string} content - Content to write to the file
 * @param {string} fileName - Optional file name
 */
function createTempFile(content, fileName = null) {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const tempDir = os.tmpdir();
  const tempFile = fileName || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.txt`;
  const filePath = path.join(tempDir, tempFile);
  fs.writeFileSync(filePath, content);
  const resourceManager = createResourceManager();
  resourceManager.add(filePath, path => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  });
  return {
    path: filePath,
    cleanup: () => resourceManager.cleanupAll()
  };
}

/**
 * Create a function that will run after the test and clean up resources
 * @param {Function} setupFn - Function that sets up resources and returns a cleanup function
 */
function withCleanup(setupFn) {
  const resourceManager = createResourceManager();
  return async (...args) => {
    try {
      const result = await setupFn(...args);

      // If the setup function returns a cleanup function, add it
      if (typeof result === 'function') {
        resourceManager.add({}, result);
      }
      return result;
    } finally {
      await resourceManager.cleanupAll();
    }
  };
}
var _default = exports.default = {
  createResourceManager,
  createTempFile,
  withCleanup
};