import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@app': path.resolve(rootDir, 'src/app'),
      '@assets': path.resolve(rootDir, 'src/assets'),
      '@components': path.resolve(rootDir, 'src/components'),
      '@features': path.resolve(rootDir, 'src/features'),
      '@pages': path.resolve(rootDir, 'src/pages'),
      '@services': path.resolve(rootDir, 'src/services'),
      '@theme': path.resolve(rootDir, 'src/theme'),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          state: ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
