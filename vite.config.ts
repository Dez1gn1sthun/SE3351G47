import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const clientDir = fileURLToPath(new URL('./client/', import.meta.url));
const distDir = fileURLToPath(new URL('./dist/', import.meta.url));

export default defineConfig({
  // All browser code, HTML pages and static files live under client/.
  root: clientDir,
  // Relative base so the build works from any static host subpath
  // (e.g. GitHub Pages /SE3351G47/).
  base: './',
  server: {
    port: 5173,
  },
  build: {
    outDir: distDir,
    emptyOutDir: true,
    target: 'es2022',
    // three.js alone is ~650 kB minified; one bundle is the right shape here
    // (both campus views share it), so raise the warning instead of splitting for show.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      // Two pages: the landing page never downloads three.js.
      input: {
        landing: `${clientDir}index.html`,
        campus: `${clientDir}campus.html`,
      },
    },
  },
});
