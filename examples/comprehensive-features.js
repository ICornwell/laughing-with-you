// Comprehensive example showing multiple features in action
const { 
  setUpLocalDeps, 
  getLocalDeps 
} = require('../src/asyncLocalDeps').default;
const { 
  describeWithLocalDeps, 
  itWithLocalDeps, 
  beforeAllWithLocalDeps 
} = require('../src/jest/testWrappers');
const { recordCalls } = require('../src/analytics').default;
const { createSignalTestEnv, createSignalTest } = require('../src/signalTesting').default;
const { useMockTimer } = require('../src/mockTimer').default;
const { createSnapshot, withSnapshot } = require('../src/depSnapshot').default;
const { proxyDep } = require('../src/proxyDeps').default;

// Create a mock API service
class ApiService {
  constructor() {
    this.baseUrl = 'https://api.example.com';
  }

  async fetchUsers() {
    // In a real app, this would be a fetch call
    console.log(`Fetching users from ${this.baseUrl}/users`);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]);
      }, 200);
    });
  }
  
  async getUser(id) {
    console.log(`Fetching user ${id} from ${this.baseUrl}/users/${id}`);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id, name: id === 1 ? 'Alice' : 'Bob' });
      }, 100);
    });
  }
  
  async createUser(userData) {
    console.log(`Creating user at ${this.baseUrl}/users`);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          id: Math.floor(Math.random() * 1000), 
          ...userData, 
          createdAt: new Date().toISOString() 
        });
      }, 150);
    });
  }
}

// Create a service that uses the API
class UserService {
  constructor(apiService) {
    this.api = apiService;
    this.cache = new Map();
  }
  
  async getAllUsers() {
    // Check cache first
    if (this.cache.has('users')) {
      return this.cache.get('users');
    }
    
    // Fetch from API
    const users = await this.api.fetchUsers();
    
    // Store in cache
    this.cache.set('users', users);
    
    return users;
  }
  
  async getUserById(id) {
    const cacheKey = `user:${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Fetch from API
    const user = await this.api.getUser(id);
    
    // Store in cache
    this.cache.set(cacheKey, user);
    
    return user;
  }
  
  async createNewUser(userData) {
    // Validate user data
    if (!userData.name) {
      throw new Error('User name is required');
    }
    
    // Create via API
    const newUser = await this.api.createUser(userData);
    
    // Clear users cache to force refresh
    this.cache.delete('users');
    
    return newUser;
  }
}

// Example comprehensive test suite
describeWithLocalDeps('Advanced Features Demo', () => {
  // Set up dependencies
  let apiService;
  let userService;
  let mockTimer;
  
  beforeAllWithLocalDeps(() => {
    // Create services
    apiService = new ApiService();
    
    // Set up analytics recording
    const { getStats, reset } = recordCalls('apiService', 
      ['fetchUsers', 'getUser', 'createUser']);
    
    userService = new UserService(apiService);
    
    // Install mock timer
    mockTimer = useMockTimer();
    
    // Set up dependencies
    setUpLocalDeps({
      apiService,
      userService,
      getStats,
      resetStats: reset
    });
  });
  
  itWithLocalDeps('should use mock timer to control time', async () => {
    // Start an async operation
    const userPromise = apiService.fetchUsers();
    
    // Advance time to complete the operation instantly
    mockTimer.advanceTime(200);
    
    // Now the promise should be resolved
    const users = await userPromise;
    expect(users.length).toBe(2);
  });
  
  itWithLocalDeps('should record analytics for API calls', async () => {
    const { getStats } = getLocalDeps();
    
    // Make some API calls
    await userService.getAllUsers();
    await userService.getUserById(1);
    
    // Check analytics
    const stats = getStats();
    expect(stats['apiService.fetchUsers'].calls).toBe(1);
    expect(stats['apiService.getUser'].calls).toBe(1);
  });
  
  itWithLocalDeps('should create a snapshot and restore dependencies', async () => {
    // Take a snapshot
    const snapshot = createSnapshot();
    
    // Modify dependencies
    setUpLocalDeps({
      apiService: {
        fetchUsers: () => Promise.resolve([{ id: 999, name: 'Modified' }])
      }
    });
    
    // Use the modified dependency
    const modifiedUsers = await getLocalDeps().apiService.fetchUsers();
    expect(modifiedUsers[0].id).toBe(999);
    
    // Restore the snapshot
    snapshot.restore();
    
    // Original dependency should be restored
    const originalUsers = await apiService.fetchUsers();
    expect(originalUsers[0].id).toBe(1);
  });
  
  // Using signal testing for async coordination
  const userCreationTest = createSignalTest(async () => {
    const signals = createSignalTestEnv();
    
    // Create a user in background
    setTimeout(async () => {
      const newUser = await userService.createNewUser({ name: 'Charlie' });
      signals.signal('userCreated', newUser);
    }, 100);
    
    // Wait for the user creation signal
    const newUser = await signals.wait('userCreated');
    
    expect(newUser.name).toBe('Charlie');
    
    return newUser;
  }, 'userCreated');
  
  itWithLocalDeps('should coordinate async operations with signals', userCreationTest);
  
  // Using dependency snapshot with a function
  itWithLocalDeps('should execute with temporary dependencies and restore', async () => {
    // Original value
    expect((await userService.getAllUsers())[0].name).toBe('Alice');
    
    // Run with temporary mock
    const result = await withSnapshot(async () => {
      // Replace the dependency temporarily
      setUpLocalDeps({
        apiService: {
          fetchUsers: () => Promise.resolve([{ id: 1, name: 'Temporary Alice' }])
        }
      });
      
      // Use the temporary mock
      return userService.getAllUsers();
    });
    
    // Verify the temporary result
    expect(result[0].name).toBe('Temporary Alice');
    
    // Original should be restored
    expect((await userService.getAllUsers())[0].name).toBe('Alice');
  });
});
