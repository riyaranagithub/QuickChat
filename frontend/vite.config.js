import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default  defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:3000', // Proxy WebSocket connections
    },
  },
})
