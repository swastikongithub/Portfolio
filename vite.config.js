import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Three.js (~550 kB, ~140 kB gzip) is its own chunk, loaded lazily after first paint
    // by InstrumentProvider; the main bundle stays under this limit.
    chunkSizeWarningLimit: 600,
  },
});
