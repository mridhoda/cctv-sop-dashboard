import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Sentry perlu ini agar stack trace bisa dibaca
  },
  server: {
    port: 5173,
    host: true
  }
})