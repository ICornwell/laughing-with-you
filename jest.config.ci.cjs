// jest.config.ci.cjs - Special Jest configuration for CI environments
// This extends the base configuration with CI-specific settings

const baseConfig = require('./jest.config.cjs');
const fs = require('fs');

// Check if jest-junit is installed
const hasJestJunit = (() => {
  try {
    require.resolve('jest-junit');
    return true;
  } catch (e) {
    return false;
  }
})();

module.exports = {
  ...baseConfig,
  
  // Use CI-specific setup file
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup-jest-ci.cjs'],
  
  // Run tests in sequence to avoid parallel execution issues
  maxWorkers: 1,
  
  // Increase timeout for CI environments
  testTimeout: 30000,
  
  // Report detailed test results
  verbose: true,
  
  // Use different cache directory for CI
  cacheDirectory: '<rootDir>/.jest-cache-ci',
  
  // Add CI reporters - only use jest-junit if it's installed
  reporters: hasJestJunit 
    ? [
        'default',
        ['jest-junit', {
          outputDirectory: 'test-results/jest',
          outputName: 'results.xml',
        }]
      ] 
    : ['default'],
};
