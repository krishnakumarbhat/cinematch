import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': 'http://localhost:5002',
      },
    },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    build: {
      outDir: 'dist',
    },
  };
});
