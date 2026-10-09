import { ClockMark } from './Symbols';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <a className="brand" href="/"><ClockMark />FindTime</a>
          <p>Small apps. A little more time for life.</p>
          <a className="back-top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FindTime LLC. All rights reserved.</p>
          <nav aria-label="Footer navigation">
            <a href="/legal/privacy">Privacy Policy</a>
            <a href="/legal/privacy#advertising">Your Privacy Choices</a>
            <a href="/legal/terms">Terms of Use</a>
            <a href="/support">Support</a>
            <a href="/tenant/docs/">Tenant docs</a>
            <a href="mailto:support@findtime.net">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
