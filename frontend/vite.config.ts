import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import express from 'express'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-outputs',
      configureServer(server) {
        server.middlewares.use('/outputs', express.static(path.resolve(__dirname, '../outputs')))
      }
    }
  ],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
