import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      optimizeDeps: {
        include: ['monaco-editor', 'react-resizable-panels'],
      },
      server: {
        port: 3000,
        open: true,
        headers: {
          'Content-Security-Policy': `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com data:;
            img-src 'self' data: https: blob:;
            connect-src 'self' https://fonts.googleapis.com;
            worker-src 'self' blob:;
            frame-src 'none';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
          `.replace(/\s+/g, ' ').trim(),
        },
      },
    }
  }

  return {
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
  }
})