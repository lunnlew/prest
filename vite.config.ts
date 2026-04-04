import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['monaco-editor', 'react-resizable-panels'],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw'],
          panels: ['react-resizable-panels'],
          state: ['zustand'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})