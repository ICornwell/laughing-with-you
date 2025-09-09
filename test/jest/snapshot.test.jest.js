"use strict";

var _jest = require("jest");
var _asyncLocalDeps = require("../../srccjs/asyncLocalDeps");
var _depSnapshot = require("../../srccjs/depSnapshot");
var _testWrappers = require("../../srccjs/jest/testWrappers");
// Test for dependency snapshots

describe('Dependency Snapshot', () => {
  // Ensure ALS is initialized once for the test suite

  beforeAll(() => {
    // Make sure global.__appAls exists before any tests run
  });
  beforeEach(async () => {
    // First make sure we have a clean ALS state
    // Ensure ALS is properly initialized with test dependencies
    const initialDeps = {
      service1: {
        getValue: () => 'original value',
        getNumber: () => 42
      },
      service2: {
        isActive: true,
        data: ['item1', 'item2']
      }
    };
    try {
      (0, _asyncLocalDeps.setUpLocalDeps)(initialDeps);
    } catch (error) {
      console.error('Snapshot test: Error in beforeEach:', error);
      // Last resort fallback
      throw new Error('Failed to set up initial dependencies');
    }
  });
  (0, _testWrappers.afterEachWithLocalDeps)(() => {
    // Clean up after all tests
    (0, _asyncLocalDeps.clearAllLocalDeps)();
  });
  (0, _testWrappers.itWithLocalDeps)('should create a snapshot of current dependencies', async () => {
    const snapshot = (0, _depSnapshot.createSnapshot)();
    expect(typeof snapshot).toBe('object');
    expect(snapshot).toHaveProperty('restore');
    expect(snapshot).toHaveProperty('getDependency');
  });
  (0, _testWrappers.itWithLocalDeps)('should restore dependencies from a snapshot', async () => {
    // Create snapshot
    const snapshot = (0, _depSnapshot.createSnapshot)();

    // Modify dependencies
    (0, _asyncLocalDeps.setUpLocalDeps)({
      service1: {
        getValue: () => 'modified value',
        getNumber: () => 100
      }
    });

    // Verify dependencies were modified
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('modified value');

    // Restore snapshot
    snapshot.restore();

    // Dependencies should be restored
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('original value');
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getNumber()).toBe(42);
    expect((0, _asyncLocalDeps.getLocalDeps)().service2.data).toEqual(['item1', 'item2']);
  });
  (0, _testWrappers.itWithLocalDeps)('should get a specific dependency from snapshot', () => {
    const snapshot = (0, _depSnapshot.createSnapshot)();
    const service1 = snapshot.getDependency('service1');
    expect(service1).toBeDefined();
    expect(service1.getValue()).toBe('original value');

    // Non-existent dependency should return null
    expect(snapshot.getDependency('nonExistent')).toBeNull();
  });
  (0, _testWrappers.itWithLocalDeps)('should calculate diff between current and snapshot', () => {
    const snapshot = (0, _depSnapshot.createSnapshot)();

    // Modify dependencies
    (0, _asyncLocalDeps.setUpLocalDeps)({
      service1: {
        getValue: () => 'changed value'
      },
      newService: {
        getName: () => 'new service'
      }
    });

    // Remove service2
    const currentDeps = (0, _asyncLocalDeps.getLocalDeps)();
    delete currentDeps.service2;
    (0, _asyncLocalDeps.setUpLocalDeps)(currentDeps);

    // Calculate diff
    const diff = snapshot.diff();
    expect(diff.added).toContain('newService');
    expect(diff.removed).toContain('service2');
    expect(diff.changed).toContain('service1');
  });
  (0, _testWrappers.itWithLocalDeps)('should run function with temporary dependencies', async () => {
    // Original state
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('original value');

    // Run with temporary dependencies
    const result = await (0, _depSnapshot.withSnapshot)(async () => {
      (0, _asyncLocalDeps.setUpLocalDeps)({
        service1: {
          getValue: () => 'temporary value'
        }
      });
      expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('temporary value');
      return 'success';
    });

    // Dependencies should be restored
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('original value');
    expect(result).toBe('success');
  });
  (0, _testWrappers.itWithLocalDeps)('should restore dependencies even if function throws', async () => {
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('original value');
    try {
      await (0, _depSnapshot.withSnapshot)(async () => {
        (0, _asyncLocalDeps.setUpLocalDeps)({
          service1: {
            getValue: () => 'error value'
          }
        });
        throw new Error('Test error');
      });
    } catch (err) {
      // Error should be propagated
      expect(err.message).toBe('Test error');
    }

    // Dependencies should still be restored
    expect((0, _asyncLocalDeps.getLocalDeps)().service1.getValue()).toBe('original value');
  });
});