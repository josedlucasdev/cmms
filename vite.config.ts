import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// Nombre del repo en GitHub: define el subpath de GitHub Pages
// Repo: josedlucasdev/cmms  →  https://josedlucasdev.github.io/cmms/
const GITHUB_PAGES_BASE = '/cmms/';

export default defineConfig({
  // base se puede sobreescribir por CLI:  vite build --base=./  (para dominio propio)
  base: GITHUB_PAGES_BASE,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8100,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
