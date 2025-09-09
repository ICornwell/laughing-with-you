// CommonJS version of Jest configuration
module.exports = {
  // Use babel to transform ES modules to CommonJS for Jest
  transform: {}, // no transforms!
  //  '^.+\\.[t|j]sx?$': 'babel-jest',
  //},
  
  // Setup test environment
  testEnvironment: 'node',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup-jest.js'],
  
  // Test patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(test|spec).[jt]s?(x)",
    "**/?(*.)+(test.jest).[jt]s?(x)"
  ],
  
  // Exclude vitest-specific tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/.git/",
    "/test/vitest",
    "\\.test\\.vitest\\.[jt]s?(x)$"
  ],
  
  // Module name mapper for import aliases
  moduleNameMapper: {
    "#lwy/(.*)": "<rootDir>/lib/$1"
  },
  
  // Handle ESM correctly
  extensionsToTreatAsEsm: [ '.jsx', '.ts', '.tsx'],
  
  // Ensure CommonJS interoperability
  transformIgnorePatterns: [
    'src/.*\\.js$|node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  
  // Collect coverage from these directories
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
};
