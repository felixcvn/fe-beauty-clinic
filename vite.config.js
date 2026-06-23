import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/',

  build: {
    rollupOptions: {
      external: ['chart.js/auto', 'quill'],
      output: {
        manualChunks: {
          // Core React — sangat jarang berubah, cache lebih lama
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Icon library — besar, pisahkan agar tidak masuk main chunk
          'icons': ['lucide-react'],
          // Document & PDF/Excel libraries
          'doc-vendor': ['exceljs', 'jspdf', 'html2canvas']
        }
      }
    },
    // Tampilkan warning jika ada chunk > 500KB
    chunkSizeWarningLimit: 1600,
  },

  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'https://many-ways-strive.loca.lt/',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        }
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))