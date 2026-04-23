import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Força o uso de uma única instância para todos os pacotes relacionados ao React
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
    },
  },
  optimizeDeps: {
    // Garante que o recharts e roteamento sejam pré-agrupados com as instâncias aliased do React
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
  }
})
