import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || '/personalb-react-app/'),

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — sangat jarang berubah, cache lebih lama
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Icon library — besar, pisahkan agar tidak masuk main chunk
          'icons': ['lucide-react'],
          // UI library (PrimeReact jika digunakan)
          'ui-vendor': ['primereact'],
        }
      }
    },
    // Tampilkan warning jika ada chunk > 500KB
    chunkSizeWarningLimit: 500,
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://composite-footprint-overarch.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
      '/storage': {
        target: 'https://composite-footprint-overarch.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
}))