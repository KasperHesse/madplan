import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works from any subdirectory
  // (fx GitHub Pages: https://bruger.github.io/repo/) uden yderligere config.
  base: './',
  plugins: [react()],
})
