import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
    resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // now @ means src/
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split Firebase (It is huge)
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Split React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // Split UI libraries (Lucide, Radix, etc)
            if (id.includes('lucide') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
