import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'node_modules/**/*'],
  },
  build: {
    commonjsOptions: {
      strictRequires: ['node_modules/aws-sdk/**/*.js'],
    },
  },
  define: {
    global: 'window',
  },
})
