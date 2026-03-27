import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      '/api': {
        target: 'https://ecors-ecom-backend.vercel.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://ecors-ecom-backend.vercel.app',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
