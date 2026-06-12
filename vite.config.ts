import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base is relative so the build works under any host or subpath.
// If you deploy to a GitHub Pages project page, set base to '/your-repo-name/'.
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
})
