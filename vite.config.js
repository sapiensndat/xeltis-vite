import { defineConfig } from 'vite';
import path from 'path';

// This is a common pattern for handling multi-page applications in Vite.
// It automatically finds all HTML files at the root level.
const htmlFiles = [
  'index.html',
  'nova7.html',
  'geotrace.html',
  'mozgis.html',
  'drc.html',
  'contact.html',
  'career.html',
  'terms.html',
  'ip.html',
  'mission.html',
  'updates.html',
  'discover.html',
  'launches.html'
];

export default defineConfig({
  // Base path for your application. Vercel automatically handles this, so
  // keeping it as '/' is correct.
  base: '/',
  
  // The 'public' directory is copied as-is to the root of the build output.
  // This is the correct way to handle your public assets like images and videos.
  publicDir: 'public',

  build: {
    // Specifies the output directory for the build.
    outDir: 'dist',
    
    // Specifies the directory for static assets like bundled JS/CSS.
    assetsDir: 'assets',
    
    // Generates source maps for easier debugging in production.
    sourcemap: true,
    
    rollupOptions: {
      // This is the key part for multi-page apps.
      // We tell Vite to process each of your HTML files.
      input: Object.fromEntries(
        htmlFiles.map(file => [
          file.split('.')[0], // Creates a named entry like 'index' or 'nova7'
          path.resolve(__dirname, file) // Provides the full path to the file
        ])
      ),
    },
  },
});
