import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Evita o erro "process is not defined" no navegador
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});