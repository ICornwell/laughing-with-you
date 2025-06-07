// Example usage of laughing-with-you library

const { setUpLocalDeps } = require('../src/asyncLocalDeps').default;
const { itWithLocalDeps, describeWithLocalDeps } = require('../src/jest/testWrappers');
const { recordCalls } = require('../src/analytics').default;

// Create mock database module
const db = {
  fetchUsers: async () => {
    // Simulating database call with delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return [
      { id: 1, name: 'John' },
      { id: 2, name: 'Alice' }
    ];
  },
  
  saveUser: async (user) => {
    // Simulating database call with delay
    await new Promise(resolve => setTimeout(resolve, 30));
    return { success: true, id: user.id || Math.floor(Math.random() * 1000) };
  }
};

// Record analytics for the DB module
const { getStats, reset } = recordCalls('db', ['fetchUsers', 'saveUser']);

// Example test suite
describeWithLocalDeps('User Service', () => {
  // Setup test dependencies
  setUpLocalDeps({
    db,
    logger: {
      log: (msg) => console.log(`[LOG]: ${msg}`)
    }
  });
  
  itWithLocalDeps('should fetch all users', async () => {
    // Example test that uses the dependencies
    const users = await db.fetchUsers();
    
    // Test assertions
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('John');
  });
  
  itWithLocalDeps('should save a user', async () => {
    // Example test that uses the dependencies
    const result = await db.saveUser({ name: 'Bob' });
    
    // Test assertions
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
  
  // After all tests, print analytics
  afterAll(() => {
    console.log('DB Method Performance:');
    console.log(getStats());
    reset();
  });
});
