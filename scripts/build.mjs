import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Emit a complete HTML document for every public URL. No rewrite rule is required.
const temporaryDirectory = resolve('node_modules/.cache/findtime-prerender');
await build();
try {
  await build({
    configFile: false,
    plugins: [react()],
    publicDir: false,
    build: {
      ssr: 'src/entry-server.jsx',
      outDir: temporaryDirectory,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
  });
  const { render, routes, getPage } = await import(pathToFileURL(resolve(temporaryDirectory, 'entry-server.mjs')).href);
  const template = await readFile('dist/index.html', 'utf8');
  const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  for (const route of [...routes, '/404']) {
    const page = getPage(route) || { title: 'Page not found — FindTime', description: 'Find your way back to FindTime.' };
    const canonical = `https://findtime.net${route === '/' ? '/' : route}`;
    const meta = [
      `<meta name="description" content="${escape(page.description)}" />`,
      `<meta property="og:title" content="${escape(page.title)}" />`,
      `<meta property="og:description" content="${escape(page.description)}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:url" content="${canonical}" />`,
      route === '/404' ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${canonical}" />`,
    ].join('\n    ');
    const html = template.replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace('<!--page-meta-->', meta).replace('<!--app-html-->', () => render(route));
    const destination = route === '/404' ? 'dist/404.html' : resolve('dist', `.${route}`, 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>https://findtime.net${route}</loc></url>`).join('')}</urlset>\n`);
  console.log(`Prerendered ${routes.length} public pages and a 404 page.`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
