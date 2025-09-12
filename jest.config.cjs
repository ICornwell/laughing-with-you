// CommonJS version of Jest configuration
module.exports = {
  // Use babel to transform ES modules to CommonJS for Jest
  transform: {}, // no transforms!
  //  '^.+\\.[t|j]sx?$': 'babel-jest',
  //},
  
  // Setup test environment
  testEnvironment: 'node',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/test/jest/setup-jest.cjs'],
  
  // Test patterns
  testMatch: [
    "**/__tests__/**/*.cjs?(x)",
    "**/?(*.)+(test|spec).cjs?(x)",
    "**/?(*.)+(test.jest).cjs?(x)"
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
    'srccjs/.*\\.cjs$|node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  
  // Collect coverage from these directories
  collectCoverageFrom: [
    "srccjs/**/*.{cjs,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
};
