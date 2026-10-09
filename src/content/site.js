import documents from './pages.json';

export const homePage = {
  title: 'FindTime — small apps, well made',
  description: 'FindTime LLC is a two-person studio in Davis, California building small, focused apps for iPhone and Android. No accounts, no third-party analytics, and we never sell your data.',
};

export function normalizePath(path) {
  return path.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
}

export function getPage(path) {
  return path === '/' ? homePage : documents[path];
}

export const routes = ['/', ...Object.keys(documents)];
