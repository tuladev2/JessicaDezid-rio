import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Dedupe ensures that only one instance of React/React-DOM is bundled
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Explicitly include recharts and its dependencies to ensure correct pre-bundling
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
  }
})
