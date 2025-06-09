// Test for dependency snapshots
import { run } from 'jest';
import { setUpLocalDeps, getLocalDeps, runWithLocalDeps, addLocalDeps, clearAllLocalDeps } from '../src/asyncLocalDeps';
import { createSnapshot, withSnapshot } from '../src/depSnapshot';
import { afterEachWithLocalDeps, beforeEachWithLocalDeps, describeWithLocalDeps, itWithLocalDeps } from '../src/jest/testWrappers';



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
        setUpLocalDeps(initialDeps);
      } catch (error) {
        console.error('Snapshot test: Error in beforeEach:', error);
        // Last resort fallback
        throw new Error('Failed to set up initial dependencies');
      }
    });


    afterEachWithLocalDeps(() => {
      // Clean up after all tests
      clearAllLocalDeps();
    })

    itWithLocalDeps('should create a snapshot of current dependencies',async () => {
      const snapshot = createSnapshot();
      expect(typeof snapshot).toBe('object');
      expect(snapshot).toHaveProperty('restore');
      expect(snapshot).toHaveProperty('getDependency');
    });

    itWithLocalDeps('should restore dependencies from a snapshot', async () => {
      // Create snapshot
      const snapshot = createSnapshot();

      // Modify dependencies
      setUpLocalDeps({
        service1: {
          getValue: () => 'modified value',
          getNumber: () => 100
        }
      });

      // Verify dependencies were modified
      expect(getLocalDeps().service1.getValue()).toBe('modified value');

      // Restore snapshot
      snapshot.restore();

      // Dependencies should be restored
      expect(getLocalDeps().service1.getValue()).toBe('original value');
      expect(getLocalDeps().service1.getNumber()).toBe(42);
      expect(getLocalDeps().service2.data).toEqual(['item1', 'item2']);
    });

    itWithLocalDeps('should get a specific dependency from snapshot', () => {
      const snapshot = createSnapshot();
      const service1 = snapshot.getDependency('service1');

      expect(service1).toBeDefined();
      expect(service1.getValue()).toBe('original value');

      // Non-existent dependency should return null
      expect(snapshot.getDependency('nonExistent')).toBeNull();
    });

    itWithLocalDeps('should calculate diff between current and snapshot', () => {
      const snapshot = createSnapshot();

      // Modify dependencies
      setUpLocalDeps({
        service1: {
          getValue: () => 'changed value'
        },
        newService: {
          getName: () => 'new service'
        }
      });

      // Remove service2
      const currentDeps = getLocalDeps();
      delete currentDeps.service2;
      setUpLocalDeps(currentDeps);

      // Calculate diff
      const diff = snapshot.diff();

      expect(diff.added).toContain('newService');
      expect(diff.removed).toContain('service2');
      expect(diff.changed).toContain('service1');
    });

    itWithLocalDeps('should run function with temporary dependencies', async () => {
      // Original state
      expect(getLocalDeps().service1.getValue()).toBe('original value');

      // Run with temporary dependencies
      const result = await withSnapshot(async () => {
        setUpLocalDeps({
          service1: {
            getValue: () => 'temporary value'
          }
        });

        expect(getLocalDeps().service1.getValue()).toBe('temporary value');
        return 'success';
      });

      // Dependencies should be restored
      expect(getLocalDeps().service1.getValue()).toBe('original value');
      expect(result).toBe('success');
    });

    itWithLocalDeps('should restore dependencies even if function throws', async () => {
      expect(getLocalDeps().service1.getValue()).toBe('original value');

      try {
        await withSnapshot(async () => {
          setUpLocalDeps({
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
      expect(getLocalDeps().service1.getValue()).toBe('original value');
    });
  });

