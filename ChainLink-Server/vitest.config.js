const { defineConfig } = require('vitest/config');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setupTests.js',
    hookTimeout: 30000
  },
});