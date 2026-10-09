import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const routes = ['/', '/support', '/legal/privacy', '/legal/terms'];
const pages = new Map();
for (const route of routes) {
  const html = await readFile(`dist${route === '/' ? '' : route}/index.html`, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: expected one primary heading`);
  assert.ok(html.includes(`rel="canonical" href="https://findtime.net${route}"`), `${route}: canonical URL`);
  assert.ok(!/<!--app-html-->|<!--page-meta-->|__cf_email__|cdn-cgi|sentry\.io/.test(html), `${route}: unresolved template or legacy content`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${route}: duplicate IDs`);
  pages.set(route, { html, ids });
}
for (const [route, { html }] of pages) {
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    if (href.startsWith('/assets/') || href === '/favicon.svg') continue;
    const url = new URL(href, `https://findtime.net${route}`);
    const target = pages.get(url.pathname.replace(/\/$/, '') || '/');
    assert.ok(target, `${route}: broken local link ${href}`);
    if (url.hash) assert.ok(target.ids.includes(url.hash.slice(1)), `${route}: missing anchor ${href}`);
  }
}
assert.ok(pages.get('/support').html.includes('https://reportaproblem.apple.com'), 'Apple refund link');
assert.ok(pages.get('/support').html.includes('https://support.google.com/googleplay/answer/2479637'), 'Google refund link');
assert.ok(pages.get('/legal/privacy').ids.includes('advertising'), 'Existing privacy choices anchor');
assert.ok(pages.get('/legal/privacy').ids.includes('do-not-sell'), 'Existing do-not-sell anchor');
assert.ok(pages.get('/').html.includes('Coming soon to the App Store'), 'BiteMatch release status');
assert.ok(pages.get('/').html.includes('In development'), 'Ashfall release status');
assert.ok((await readFile('dist/404.html', 'utf8')).includes('name="robots" content="noindex"'), '404 must not be indexed');
for (const asset of await readdir('dist/assets')) {
  if (!asset.endsWith('.js')) continue;
  const js = await readFile(`dist/assets/${asset}`, 'utf8');
  assert.ok(!/sentry\.io|Sentry\.init|replayIntegration|google-analytics|googletagmanager/.test(js), 'No telemetry in the shipped bundle');
}
const previewUrl = process.argv[2];
if (previewUrl) {
  for (const route of routes) {
    const expected = pages.get(route).html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1];
    for (const suffix of route === '/' ? [''] : ['', '/', '/index.html']) {
      const response = await fetch(new URL(`${route}${suffix}`, previewUrl));
      const html = await response.text();
      assert.equal(response.status, 200, `${route}${suffix}: HTTP status`);
      assert.equal(html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1], expected, `${route}${suffix}: server must return this page, not the homepage fallback`);
    }
  }
  const missing = await fetch(new URL('/page-that-does-not-exist', previewUrl));
  assert.equal(missing.status, 404, 'Unknown route returns HTTP 404');
  assert.ok((await missing.text()).includes('Let’s find your way back.'), 'Branded 404 page');
  console.log('Verified HTTP routing, trailing-slash and index aliases, and 404 status.');
}
console.log('Verified all public routes, local links, deep links, metadata, release statuses, billing links, and absence of template telemetry.');
