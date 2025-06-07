// Common testing scenarios using laughing-with-you
const { 
  setUpLocalDeps, 
  getLocalDeps,
  useMockTimer,
  createSnapshot,
  createResourceManager,
  createLogger,
  LogLevel,
  createE2ETestEnvironment 
} = require('../src').default;

/**
 * SCENARIO 1: Testing HTTP requests with mocked dependencies
 * 
 * This example shows how to test a service that makes HTTP requests
 * by mocking the HTTP client dependency
 */
function testHttpRequests() {
  // Mock HTTP client
  const httpClient = {
    get: jest.fn().mockResolvedValue({ 
      data: { id: 1, name: 'Test User' } 
    }),
    post: jest.fn().mockResolvedValue({ 
      data: { id: 2, success: true } 
    })
  };
  
  // Test service that uses HTTP client
  class UserService {
    constructor(deps) {
      this.http = deps.httpClient;
    }
    
    async getUser(id) {
      const response = await this.http.get(`/users/${id}`);
      return response.data;
    }
    
    async createUser(userData) {
      const response = await this.http.post('/users', userData);
      return response.data;
    }
  }
  
  // Run the test with dependencies
  describe('UserService', () => {
    it('should get user by ID', async () => {
      // Set up dependencies
      setUpLocalDeps({ httpClient });
      
      // Use dependencies from context
      const service = new UserService(getLocalDeps());
      
      // Test the service
      const user = await service.getUser(1);
      
      expect(httpClient.get).toHaveBeenCalledWith('/users/1');
      expect(user).toEqual({ id: 1, name: 'Test User' });
    });
    
    it('should create a user', async () => {
      // Set up dependencies
      setUpLocalDeps({ httpClient });
      
      // Use dependencies from context
      const service = new UserService(getLocalDeps());
      
      // Test the service
      const userData = { name: 'New User' };
      const result = await service.createUser(userData);
      
      expect(httpClient.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual({ id: 2, success: true });
    });
  });
}

/**
 * SCENARIO 2: Testing async code with timers and signals
 * 
 * This example shows how to test code that uses timers and async operations
 */
function testAsyncWithTimers() {
  // Service with timeouts and async operations
  class NotificationService {
    constructor() {
      this.subscribers = [];
      this.notificationQueue = [];
      this.isProcessing = false;
    }
    
    subscribe(callback) {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
      };
    }
    
    async addNotification(message) {
      this.notificationQueue.push({ message, time: Date.now() });
      if (!this.isProcessing) {
        await this.processQueue();
      }
    }
    
    async processQueue() {
      if (this.isProcessing || this.notificationQueue.length === 0) return;
      
      this.isProcessing = true;
      
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        
        // Notify all subscribers
        for (const subscriber of this.subscribers) {
          // Use setTimeout to make this asynchronous
          setTimeout(() => {
            subscriber(notification);
          }, 100);
        }
        
        // Wait a bit between notifications
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      this.isProcessing = false;
    }
  }
  
  // Test with mock timer
  describe('NotificationService', () => {
    it('should process notifications and notify subscribers', async () => {
      // Install mock timer
      const timer = useMockTimer();
      
      try {
        // Create service
        const service = new NotificationService();
        
        // Track notifications
        const receivedNotifications = [];
        
        // Subscribe to notifications
        service.subscribe((notification) => {
          receivedNotifications.push(notification);
        });
        
        // Add notifications
        await service.addNotification('Message 1');
        await service.addNotification('Message 2');
        
        // Initially no notifications should be delivered (timers not executed yet)
        expect(receivedNotifications.length).toBe(0);
        
        // Advance time to trigger the setTimeout for the first notification
        timer.advanceTime(100);
        expect(receivedNotifications.length).toBe(1);
        expect(receivedNotifications[0].message).toBe('Message 1');
        
        // Advance time for the wait between notifications
        timer.advanceTime(200);
        
        // Advance time for the second notification
        timer.advanceTime(100);
        expect(receivedNotifications.length).toBe(2);
        expect(receivedNotifications[1].message).toBe('Message 2');
      } finally {
        // Always uninstall mock timer
        timer.uninstall();
      }
    });
  });
}

/**
 * SCENARIO 3: Managing test resources and environment
 * 
 * This example shows how to manage resources and environment state
 */
function testWithResources() {
  // Service that uses external resources
  class DatabaseService {
    constructor(config) {
      this.config = config;
      this.connection = null;
    }
    
    async connect() {
      console.log(`Connecting to ${this.config.host}:${this.config.port}`);
      // This would actually connect to a database
      this.connection = {
        connected: true,
        query: jest.fn().mockImplementation((query) => {
          console.log(`Executing query: ${query}`);
          return Promise.resolve([{ id: 1 }]);
        }),
        close: jest.fn().mockImplementation(() => {
          console.log('Closing connection');
          this.connection.connected = false;
          return Promise.resolve();
        })
      };
      return this.connection;
    }
    
    async disconnect() {
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
    }
  }
  
  describe('DatabaseService', () => {
    it('should manage database connection with resource manager', async () => {
      // Create resource manager
      const resources = createResourceManager();
      
      // Create logger
      const logger = createLogger({
        level: LogLevel.DEBUG,
        prefix: 'DBTest'
      });
      
      try {
        // Create snapshot of environment
        const snapshot = createSnapshot();
        snapshot.capture();
        
        // Set test environment variables
        process.env.DB_HOST = 'localhost';
        process.env.DB_PORT = '5432';
        
        // Create database service
        const dbService = new DatabaseService({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT
        });
        
        // Connect and register for cleanup
        const connection = await dbService.connect();
        resources.add(connection, () => dbService.disconnect());
        
        // Use the connection
        logger.debug('Running database query');
        const results = await connection.query('SELECT * FROM users');
        
        expect(results).toEqual([{ id: 1 }]);
        expect(connection.query).toHaveBeenCalledWith('SELECT * FROM users');
        
      } finally {
        // Clean up all resources
        await resources.cleanupAll();
        
        // Restore environment
        snapshot.restore();
      }
    });
  });
}

/**
 * SCENARIO 4: End-to-end testing with the E2E test environment
 * 
 * This example shows how to use the E2E test environment for comprehensive testing
 */
function testE2E() {
  // User service for testing
  class UserService {
    constructor(deps) {
      this.authService = deps.authService;
      this.apiClient = deps.apiClient;
      this.storage = deps.storage;
      this.logger = deps.logger;
    }
    
    async login(username, password) {
      this.logger.info(`Logging in user: ${username}`);
      const token = await this.authService.authenticate(username, password);
      this.storage.setItem('token', token);
      return token;
    }
    
    async getUserProfile() {
      const token = this.storage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      this.logger.debug('Fetching user profile');
      const profile = await this.apiClient.get('/profile');
      return profile;
    }
    
    async updateProfile(data) {
      const token = this.storage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      this.logger.debug('Updating user profile', { data });
      return this.apiClient.post('/profile', data);
    }
    
    logout() {
      this.logger.info('Logging out user');
      this.storage.removeItem('token');
    }
  }
  
  describe('User Flow E2E', () => {
    it('should handle complete user flow', async () => {
      // Create E2E test environment
      const env = createE2ETestEnvironment({
        name: 'UserFlowTest',
        mockTime: true,
        dependencies: {
          // Mock services
          authService: {
            authenticate: jest.fn().mockResolvedValue('mock-token-123')
          },
          apiClient: {
            get: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
            post: jest.fn().mockResolvedValue({ success: true })
          },
          storage: {
            data: {},
            getItem(key) { return this.data[key]; },
            setItem(key, value) { this.data[key] = value; },
            removeItem(key) { delete this.data[key]; }
          }
        }
      });
      
      // Run the test with environment
      await env.runTest(async () => {
        // Get dependencies
        const deps = getLocalDeps();
        
        // Create service
        const userService = new UserService(deps);
        
        // Test login
        const token = await userService.login('testuser', 'password');
        expect(token).toBe('mock-token-123');
        expect(deps.storage.getItem('token')).toBe('mock-token-123');
        expect(deps.authService.authenticate).toHaveBeenCalledWith('testuser', 'password');
        
        // Test get profile
        const profile = await userService.getUserProfile();
        expect(profile).toEqual({ id: 1, name: 'Test User' });
        expect(deps.apiClient.get).toHaveBeenCalledWith('/profile');
        
        // Test update profile
        const updateData = { name: 'Updated Name' };
        const updateResult = await userService.updateProfile(updateData);
        expect(updateResult).toEqual({ success: true });
        expect(deps.apiClient.post).toHaveBeenCalledWith('/profile', updateData);
        
        // Test logout
        userService.logout();
        expect(deps.storage.getItem('token')).toBeUndefined();
      });
    });
  });
}

module.exports = {
  testHttpRequests,
  testAsyncWithTimers,
  testWithResources,
  testE2E
};
