import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    strictPort: true,
    hmr: true,
  },
  base: '/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/public': path.resolve(__dirname, 'public'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000, // Increase limit to 2000 kB to suppress the warning
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        ip: path.resolve(__dirname, 'ip.html'),
        nova7: path.resolve(__dirname, 'nova7.html'),
        geotrace: path.resolve(__dirname, 'geotrace.html'),
        mozgis: path.resolve(__dirname, 'mozgis.html'),
        drc: path.resolve(__dirname, 'drc.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    copyPublicDir: true,
    additionalEntries: ['_redirects'],
  },
  optimizeDeps: {
    include: ['gsap', 'globe.gl'],
  },
  css: {
    minify: true,
  },
});