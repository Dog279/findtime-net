import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import DocumentPage from './components/DocumentPage';
import Tenant from './components/Tenant';
import { getPage, normalizePath } from './content/site';

export default function App({ path = '/' }) {
  const root = useRef(null);
  const route = normalizePath(path);
  const page = getPage(route);

  useEffect(() => {
    const media = gsap.matchMedia();
    let observer;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const elements = root.current.querySelectorAll('[data-reveal]');
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          gsap.fromTo(target, { y: 24, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'all',
          });
          observer.unobserve(target);
        });
      }, { threshold: 0.08 });
      elements.forEach((element) => observer.observe(element));
      return () => observer?.disconnect();
    });
    return () => { observer?.disconnect(); media.revert(); };
  }, []);

  return (
    <div ref={root}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar route={route} />
      {route === '/' ? <Home /> : route === '/tenant' ? <Tenant /> : page ? <DocumentPage page={page} route={route} /> : (
        <main id="main" className="not-found container" tabIndex={-1}>
          <p className="eyebrow">404 · A little off course</p>
          <h1>Let’s find your way back.</h1>
          <p>This page doesn’t exist. Our apps and the people behind them are right here.</p>
          <a className="button" href="/">Back to FindTime <span aria-hidden="true">↗</span></a>
        </main>
      )}
      <Footer />
    </div>
  );
}
