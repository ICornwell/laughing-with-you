/**
 * Utilities for managing resource cleanup in tests
 */

/**
 * A class to manage resources that need to be cleaned up after tests
 */
class ResourceManager {
  constructor() {
    this.resources = [];
  }
  
  /**
   * Add a resource with a cleanup function
   * @param {*} resource - The resource object
   * @param {Function} cleanupFn - Function to call to clean up the resource
   */
  add(resource, cleanupFn) {
    this.resources.push({ resource, cleanupFn });
    return resource;
  }
  
  /**
   * Clean up all resources in reverse order of addition
   */
  async cleanupAll() {
    const errors = [];
    
    // Process in reverse order (last in, first out)
    for (let i = this.resources.length - 1; i >= 0; i--) {
      const { resource, cleanupFn } = this.resources[i];
      
      try {
        // Handle async or sync cleanup functions
        await cleanupFn(resource);
      } catch (err) {
        errors.push(err);
      }
    }
    
    // Clear the resources array
    this.resources = [];
    
    // If there were errors, throw the first one
    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Failed to clean up ${errors.length} resources`
      );
    }
  }
  
  /**
   * Get the count of managed resources
   */
  get count() {
    return this.resources.length;
  }
}

/**
 * Create a resource manager for a test
 */
function createResourceManager() {
  return new ResourceManager();
}

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
  
  const resourceManager = new ResourceManager();
  resourceManager.add(filePath, (path) => {
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
  const resourceManager = new ResourceManager();
  
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

module.exports = {
  ResourceManager,
  createResourceManager,
  createTempFile,
  withCleanup
};
