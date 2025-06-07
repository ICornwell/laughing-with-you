// Example of using the logger for test debugging
const { 
  setUpLocalDeps,
  getLocalDeps,
  createLogger,
  LogLevel
} = require('../src/index').default;
const { describeWithLocalDeps, itWithLocalDeps } = require('../src/jest/testWrappers');

// Create a service to test
class UserService {
  constructor(logger) {
    this.users = [];
    this.logger = logger;
  }
  
  async createUser(userData) {
    this.logger.info('Creating user', { userData });
    
    if (!userData.name) {
      this.logger.error('User creation failed: name is required');
      throw new Error('User name is required');
    }
    
    const newUser = {
      id: this.users.length + 1,
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    
    this.users.push(newUser);
    this.logger.info('User created successfully', { userId: newUser.id });
    
    return newUser;
  }
  
  async getUserById(id) {
    this.logger.info('Getting user by id', { id });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const user = this.users.find(u => u.id === id);
    
    if (!user) {
      this.logger.warn('User not found', { id });
      return null;
    }
    
    return user;
  }
}

// Test using the logger
describeWithLocalDeps('Logger Examples', () => {
  // Set up test environment with logger
  beforeEach(() => {
    // Create a logger for all tests
    const logger = createLogger({
      level: LogLevel.DEBUG,
      prefix: 'UserTest'
    });
    
    // Create service with the logger
    const userService = new UserService(logger.child('UserService'));
    
    // Set up dependencies
    setUpLocalDeps({
      logger,
      userService
    });
    
    // Log test setup
    logger.debug('Test environment set up');
  });
  
  // Test using the logger
  itWithLocalDeps('should create and retrieve a user', async () => {
    const { logger, userService } = getLocalDeps();
    
    logger.info('Starting test');
    
    // Buffer all detailed logs but only show if test fails
    const detailLogger = logger.child('Details').startBuffering();
    
    try {
      // Create a user
      const userData = { name: 'Alice', email: 'alice@example.com' };
      detailLogger.debug('Creating user with data', userData);
      
      const newUser = await userService.createUser(userData);
      detailLogger.debug('User created', { user: newUser });
      
      // Verify user was created correctly
      expect(newUser.id).toBe(1);
      expect(newUser.name).toBe('Alice');
      
      // Get the user by id
      detailLogger.debug('Retrieving user', { id: newUser.id });
      const foundUser = await userService.getUserById(newUser.id);
      detailLogger.debug('User retrieved', { user: foundUser });
      
      expect(foundUser).toBe(newUser);
      
      // Test passes, no need to show detailed logs
    } catch (error) {
      // Test failed, flush all detailed logs to help debugging
      logger.warn('Test failed, showing detailed logs:', { error: error.message });
      detailLogger.flush();
      throw error;
    }
    
    logger.info('Test completed successfully');
  });
  
  // Test demonstrating different log levels
  itWithLocalDeps('should demonstrate log levels', () => {
    const { logger } = getLocalDeps();
    
    logger.debug('This is a debug message');
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');
    
    // Create child loggers for different components
    const dbLogger = logger.child('Database');
    const apiLogger = logger.child('API');
    
    dbLogger.info('Connected to database');
    apiLogger.info('API request received', { method: 'GET', path: '/users' });
    
    // Filter out debug logs for a specific component
    apiLogger.setLevel(LogLevel.WARN);
    
    apiLogger.debug('This debug message will not be shown');
    apiLogger.warn('But warnings will still appear');
  });
});
