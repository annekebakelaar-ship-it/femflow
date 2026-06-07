import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * FemFlow Vite Config
 * TrialApp sharing components from ../shared
 */
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://wearable-age-api.onrender.com'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    open: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
