import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Aumentar limite do aviso de chunk (padrão 500kb → 1000kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Code splitting manual para reduzir tamanho dos chunks
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
})
