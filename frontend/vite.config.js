import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: __dirname,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        place: resolve(__dirname, 'place.html'),
        review: resolve(__dirname, 'review.html'),
        addPlace: resolve(__dirname, 'add-place.html'),
        dashboard: resolve(__dirname, 'dashboard.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
