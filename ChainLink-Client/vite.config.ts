import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      strictRequires: ['node_modules/aws-sdk/**/*.js'],
    },
  },
  define: {
    global: {},
  },
})
