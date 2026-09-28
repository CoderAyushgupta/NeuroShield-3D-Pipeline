import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change `base` to '/<your-repo-name>/' before deploying to GitHub Pages.
// Example: base: '/NeuroShield-3D-Pipeline/'
export default defineConfig({
  plugins: [react()],
  base: '/NeuroShield-3D-Pipeline/',
  build: {
    outDir: 'dist',
  },
})
