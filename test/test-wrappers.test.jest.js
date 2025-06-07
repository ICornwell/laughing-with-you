// Test for Jest-specific wrapper functionality
import { 
  describeWithLocalDeps, 
  itWithLocalDeps,
  beforeAllWithLocalDeps,
  afterAllWithLocalDeps,
  beforeEachWithLocalDeps,
  afterEachWithLocalDeps
} from '../src/jest/testWrappers.js';
import { getLocalDeps, runWithLocalDeps, setUpLocalDeps } from '../src/asyncLocalDeps.js';
import { jest } from '@jest/globals';
import { ensureALSInitialized } from './testUtils/als-utils.js';

// Jest-specific test functionality
describe('Jest-specific test wrappers', () => {

  let beforeAllCalled = false;
  let afterAllCalled = false;
  let beforeEachCalled = false;
  let afterEachCalled = false;

  const deps = {
    jestSpecific: {
      getValue: () => 'jest value'
    }
  };
  
  describe('Test lifecycle hooks',() =>  {
    // jest does not allow async functions for 'desribe' so
    // runWithLocalDeps is not used here
    // Instead, we set up the local dependencies directly
    // and use the provided hooks to test them.
    setUpLocalDeps(deps);

    beforeAllWithLocalDeps(() => {
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('jestSpecific');
      beforeAllCalled = true;
    });
    
    beforeEachWithLocalDeps(() => {
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('jestSpecific');
      beforeEachCalled = true;
    });
    
    afterEachWithLocalDeps(() => {
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('jestSpecific');
      afterEachCalled = true;
    });
    
    afterAllWithLocalDeps(() => {
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('jestSpecific');
      afterAllCalled = true;
    });
    
    itWithLocalDeps('should execute all lifecycle hooks', () => {
      expect(beforeAllCalled).toBe(true);
      expect(beforeEachCalled).toBe(true);
      // Cannot test after hooks here
      
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('jestSpecific');
      expect(deps.jestSpecific.getValue()).toBe('jest value');
    });
    
    // Use a separate test to verify that afterEach was called
    it('should verify afterEach was called', () => {
      expect(afterEachCalled).toBe(true);
    });
  })
 
  
  // After the describe block completes, afterAll should have been called
  it('should verify afterAll was called', () => {
    expect(afterAllCalled).toBe(true);
  });
  
  // Test passing custom dependencies
  describe('Custom dependencies in tests', () => {
    runWithLocalDeps({
        customValue: 42,
        vitestSpecific: {
          getValue: () => 'vitest value'
        }
      }, () => 
    itWithLocalDeps('should support custom dependencies per test', () => {
      const customValue = getLocalDeps().customValue;
      expect(customValue).toBeDefined();
      expect(customValue).toBe(42);
      
      // Original deps should still be available
      const deps = getLocalDeps();
      expect(deps.jestSpecific).toBeDefined();
    }, { customValue: 42 })
  )})
});
