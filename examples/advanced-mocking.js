// Advanced example showing dependency mocking and replacement

const { setUpLocalDeps, addLocalDeps } = require('../src/asyncLocalDeps').default;
const { itWithLocalDeps, describeWithLocalDeps, beforeEachWithLocalDeps } = require('../src/jest/testWrappers');
const { proxyDep } = require('../src/proxyDeps').default;

// Original filesystem module
const fs = {
  readFile: async (path) => {
    console.log(`Actually reading file: ${path}`);
    return Buffer.from('Real file content');
  },
  
  writeFile: async (path, content) => {
    console.log(`Actually writing to file: ${path}`);
    return { success: true };
  }
};

// Create a proxy for the filesystem
const proxiedFs = proxyDep(fs, 'fs');

// Service that uses the filesystem
const fileService = {
  readUserData: async (userId) => {
    const data = await proxiedFs.readFile(`/users/${userId}.json`);
    return JSON.parse(data.toString());
  },
  
  saveUserData: async (userId, userData) => {
    const content = JSON.stringify(userData, null, 2);
    await proxiedFs.writeFile(`/users/${userId}.json`, content);
    return { success: true };
  }
};

// Example test suite
describeWithLocalDeps('File Service with Mocked Dependencies', () => {
  // Setup initial mocks
  beforeEachWithLocalDeps(() => {
    // Mock filesystem for testing
    setUpLocalDeps({
      fs: {
        readFile: async (path) => {
          console.log(`[MOCK] Reading file: ${path}`);
          if (path === '/users/123.json') {
            return Buffer.from(JSON.stringify({ id: 123, name: 'Test User' }));
          }
          throw new Error('File not found');
        },
        
        writeFile: async (path, content) => {
          console.log(`[MOCK] Writing to file: ${path}`);
          return { success: true, path };
        }
      }
    });
  });
  
  itWithLocalDeps('should read user data using mocked fs', async () => {
    const userData = await fileService.readUserData('123');
    
    expect(userData).toEqual({ id: 123, name: 'Test User' });
  });
  
  itWithLocalDeps('should save user data using mocked fs', async () => {
    const result = await fileService.saveUserData('123', { 
      id: 123, 
      name: 'Updated User' 
    });
    
    expect(result).toEqual({ success: true });
  });
  
  itWithLocalDeps('should use dynamically replaced dependency', async () => {
    // Replace the fs dependency during the test
    addLocalDeps({
      fs: {
        readFile: async () => Buffer.from(JSON.stringify({ 
          id: 123, 
          name: 'Dynamically Replaced User'
        }))
      }
    });
    
    const userData = await fileService.readUserData('123');
    
    expect(userData).toEqual({ 
      id: 123, 
      name: 'Dynamically Replaced User' 
    });
  });
});
