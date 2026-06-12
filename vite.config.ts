import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base matches the GitHub Pages project path: tiltann.github.io/job-kompass/
export default defineConfig({
  base: '/job-kompass/',
  plugins: [vue(), tailwindcss()],
})
