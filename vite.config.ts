import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [vue()],
  server: {
    host: '192.168.48.108',
    port: 3003,
     open: true,
    // client: {
    //   overlay: false,
    // },
    proxy: {
      '^/(api|engine-rest)': {
        target: 'http://192.168.48.155:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})