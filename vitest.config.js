import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    include: [
      'test/**/*.spec.js',
      'test/**/*.test.js',
      'test/**/*.test.vitest.js'
    ],
    exclude: [
      'test/**/*.test.jest.js',
      'test/jest/**/*.js'
    ],
    globals: true,
    environment: 'node',
    // setupFiles: ['./test/setup-vitest.js'],
    coverage: {
      reporter: ['text', 'html', 'json', 'lcov'],
    },
  },
});
