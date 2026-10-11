import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 打包后资源用相对路径（dist/index.html 引用 ./assets/...），可部署到任意静态托管/子目录
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
