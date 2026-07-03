import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This config is specifically for the frontend React app
export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/sshsghaghra/', // Correct for GitHub Pages deployment
})
