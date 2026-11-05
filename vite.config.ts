import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from any static host subpath
  // (e.g. GitHub Pages /SE3351G47/).
  base: './',
  build: {
    target: 'es2022',
    // three.js alone is ~650 kB minified; one bundle is the right shape here
    // (both views share it), so raise the warning instead of splitting for show.
    chunkSizeWarningLimit: 800,
  },
});
