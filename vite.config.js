import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Use the subpath for GitHub Pages, but root for local dev and other hosts like Vercel
  base: command === 'build' ? '/sshsghaghra/' : '/',
}))
