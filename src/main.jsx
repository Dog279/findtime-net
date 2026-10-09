import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { getPage, normalizePath } from './content/site';
import './index.css';

const path = normalizePath(window.location.pathname);
const page = getPage(path);
document.title = page?.title || 'Page not found — FindTime';
document.documentElement.classList.remove('no-js');
const root = document.getElementById('root');
const app = <React.StrictMode><App path={path} /></React.StrictMode>;
if (root.childElementCount > 0) hydrateRoot(root, app);
else createRoot(root).render(app);
