import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '^/(api|engine-rest)': {
        target: 'http://192.168.48.111:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})