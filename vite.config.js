// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 配置 @ 别名指向 src 目录
      '@': path.resolve(__dirname, 'src')
    }
  }
})