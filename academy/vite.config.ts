import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the app under /ci-academy/; local dev and preview use /.
export default defineConfig({
  base: process.env.GH_PAGES ? '/ci-academy/' : '/',
  plugins: [react()],
  server: { port: 5173 },
})
