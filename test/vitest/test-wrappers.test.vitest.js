// Test for Vitest-specific wrapper functionality
import { 
  describeWithLocalDeps, 
  itWithLocalDeps,
  beforeAllWithLocalDeps,
  afterAllWithLocalDeps,
  beforeEachWithLocalDeps,
  afterEachWithLocalDeps
} from '../../src/vitest/testWrappers';
import { getLocalDeps, setUpLocalDeps } from '../../src/asyncLocalDeps';

// Initialize dependencies for testing
setUpLocalDeps({
  vitestSpecific: {
    getValue: () => 'vitest value'
  }
});

// Vitest-specific test functionality
describe('Vitest-specific test wrappers', () => {
  beforeAll(() => {
    // Ensure dependencies are set up before each test
    setUpLocalDeps({
      vitestSpecific: {
        getValue: () => 'vitest value'
      }
    });
  });
  
  // Test hooks with dependencies
  let beforeAllCalled = false;
  let afterAllCalled = false;
  let beforeEachCalled = false;
  let afterEachCalled = false;
  
  describe('Test lifecycle hooks', () => {
    beforeAll(() => {
      beforeAllCalled = false;
    });
    
    beforeAllWithLocalDeps(() => {
      beforeAllCalled = true;
    });
    
    beforeEachWithLocalDeps(() => {
      beforeEachCalled = true;
    });
    
    afterEachWithLocalDeps(() => {
      afterEachCalled = true;
    });
    
    afterAll(() => {
      afterAllCalled = true;
    });
    
    itWithLocalDeps('should execute all lifecycle hooks', () => {
      expect(beforeAllCalled).toBe(true);
      expect(beforeEachCalled).toBe(true);
      // Cannot test after hooks here
      
      const deps = getLocalDeps();
      expect(deps).toHaveProperty('vitestSpecific');
      expect(deps.vitestSpecific.getValue()).toBe('vitest value');
    });
    
    // Use a separate test to verify that afterEach was called
    it('should verify afterEach was called', () => {
      expect(afterEachCalled).toBe(true);
    });
  });
  
  // After the describe block completes, afterAll should have been called
  it('should verify afterAll was called', () => {
    expect(afterAllCalled).toBe(true);
  });
  
  // Test passing custom dependencies directly
  describe('Custom dependencies in tests', () => {
    it('should support setting and getting custom dependencies', () => {
      // Set a custom dependency
      setUpLocalDeps({
        customValue: 42,
        vitestSpecific: {
          getValue: () => 'vitest value'
        }
      });
      
      // Verify it can be retrieved
      const deps = getLocalDeps();
      expect(deps.customValue).toBe(42);
      expect(deps.vitestSpecific).toBeDefined();
    });
  });
});
