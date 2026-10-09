import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import documents from './src/content/pages.json';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Vite's default preview falls back to the homepage for extensionless URLs.
// Serve the actual prerendered document so hydration and deep links stay intact.
const staticRoutes = {
  name: 'findtime-static-routes',
  configurePreviewServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url, 'http://localhost');
      const path = url.pathname.replace(/\/+$/, '') || '/';
      if (documents[path]) request.url = `${path}/index.html${url.search}`;
      else if (path !== '/' && !path.split('/').pop().includes('.')) {
        try {
          const html = await readFile(resolve(server.config.root, server.config.build.outDir, '404.html'));
          response.statusCode = 404;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(request.method === 'HEAD' ? undefined : html);
        } catch (error) { next(error); }
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), staticRoutes],
});
