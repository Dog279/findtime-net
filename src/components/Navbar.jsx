import { useEffect, useRef, useState } from 'react';
import { ClockMark } from './Symbols';

export default function Navbar({ route }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event) => {
      if (!header.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);

  return (
    <header className="site-header" ref={header}>
      <nav className="container navigation" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="FindTime home"><ClockMark />FindTime</a>
        <div id="nav-links" className={`nav-links${open ? ' is-open' : ''}`}>
          <a href="/#apps" onClick={() => setOpen(false)}>Apps</a>
          <a href="/#about" onClick={() => setOpen(false)}>Our studio</a>
          <a href="/tenant" aria-current={route === '/tenant' ? 'page' : undefined}>Tenant</a>
          <a href="/support" aria-current={route === '/support' ? 'page' : undefined}>Support</a>
          <a href="/legal/privacy" aria-current={route === '/legal/privacy' ? 'page' : undefined}>Privacy</a>
        </div>
        <div className="nav-actions">
          <a className="nav-contact" href="mailto:support@findtime.net" aria-label="Email FindTime" title="Email FindTime">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
          </a>
          <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="nav-links"
            onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
            <span className={open ? 'menu-lines is-open' : 'menu-lines'} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </nav>
    </header>
  );
}
