import { renderToString } from 'react-dom/server';
import App from './App';
export { routes, getPage } from './content/site';

export function render(path) {
  return renderToString(<App path={path} />);
}
