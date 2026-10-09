import documents from './pages.json';

export const homePage = {
  title: 'FindTime — small apps, well made',
  description: 'FindTime LLC is a two-person studio in Davis, California building small, focused apps for iPhone and Android. No accounts, no third-party analytics, and we never sell your data.',
};

export function normalizePath(path) {
  return path.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
}

export const tenantPage = {
  title: 'Tenant — your own AI agent, in one binary — FindTime',
  description: 'Tenant is an open-source, single-binary AI agent you run yourself: local or cloud models, a memory that learns, tools and MCP servers, approvals before anything dangerous, and a terminal UI, web dashboard, Discord and iMessage to drive it.',
};

export function getPage(path) {
  if (path === '/') return homePage;
  if (path === '/tenant') return tenantPage;
  return documents[path];
}

// The Tenant docs under /tenant/docs/ are static pages in public/, not routes.
export const routes = ['/', '/tenant', ...Object.keys(documents)];
