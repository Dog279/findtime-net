import { AgentMark, BowlMark, FlameMark, PrincipleMark } from './Symbols';

const principles = [
  { icon: 'privacy', title: 'Privacy by default.', text: 'Our apps have no user accounts and keep your data on your device. We collect the minimum a feature needs, and nothing more.' },
  { icon: 'money', title: 'Straight about money.', text: "Some of our free apps show ads; our paid apps don’t, and we say which is which up front. Either way we don’t sell your data and we use no third-party analytics." },
  { icon: 'people', title: 'You reach actual people.', text: 'There’s no support ticket maze. Email us and one of the two people who built the app writes back, usually within two business days.' },
];

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy container">
          <p className="hero-label">FindTime apps</p>
          <h1 id="hero-title">Small apps. <span>Well made.</span></h1>
        </div>
        <div className="hero-art" role="img" aria-label="Illustrated phones introducing BiteMatch, for finding dinner together, and Ashfall, an offline survival game. Product illustrations, not app screenshots.">
          <div className="hero-halo" />
          <div className="hero-devices">
            <div className="device device-ashfall">
              <div className="device-screen ashfall-screen">
                <div className="device-island" />
                <span className="screen-brand">ASHFALL</span>
                <span className="screen-heading">Every ember.<br />A new beginning.</span>
                <div className="screen-flame"><FlameMark /></div>
                <div className="landscape landscape-back" /><div className="landscape landscape-front" />
                <span className="screen-footnote">A WORLD TO REBUILD.</span>
                <div className="home-indicator" />
              </div>
            </div>
            <div className="device device-bitematch">
              <div className="device-screen bitematch-screen">
                <div className="device-island" />
                <span className="screen-brand">BiteMatch</span>
                <span className="screen-heading">Good taste.<br />Great company.</span>
                <div className="screen-bowl"><BowlMark /></div>
                <span className="screen-footnote">TWO PHONES. ONE GOOD PLAN.</span>
                <div className="home-indicator" />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-footer container">
          <div className="hero-actions">
            <a className="button" href="#apps">Explore our apps</a>
            <a className="text-link" href="#about">Meet the studio <span aria-hidden="true">›</span></a>
          </div>
          <p className="hero-intro">Two people. Thoughtfully made apps for iPhone and Android.</p>
        </div>
        <div className="hero-promise container"><span>No accounts to create.</span><span>No third-party analytics.</span><span>Your data is never for sale.</span></div>
      </section>

      <section id="apps" className="apps-section section-pad">
        <div className="container">
          <div className="section-intro" data-reveal>
            <div><p className="eyebrow">Our apps</p><h2>A few things.<br /><span>Done properly.</span></h2></div>
            <p>We’d rather make a few things properly than many things quickly. Each app does one job well and respects the person using it.</p>
          </div>
          <div className="app-grid">
            <article className="app-card bitematch-card" id="bitematch" data-reveal>
              <div className="app-card-top"><span className="app-category">FOOD & FRIENDS</span><span className="app-number">01</span></div>
              <div className="app-identity"><div className="app-icon bite-icon"><BowlMark /></div><h3>BiteMatch</h3></div>
              <p className="app-headline">Dinner.<br />Decided together.</p>
              <p className="app-description">Swipe through restaurants near you and match with a friend on where to eat. Two phones, one shared session, dinner decided in about a minute — no group chat required.</p>
              <div className="app-card-bottom"><span className="app-status"><span />Coming soon to the App Store</span></div>
              <details className="app-details">
                <summary>Get to know BiteMatch <span className="expand-icon" aria-hidden="true" /></summary>
                <div className="app-details-body">
                  <p>Find restaurants nearby, share a room code with a friend, and see your matches live. Your taste profile, swipe history, and liked restaurants stay on your device.</p>
                  <p>No accounts. No advertising. Shared sessions are automatically deleted within 24 hours.</p>
                  <a href="/legal/privacy#app-specific-details">How BiteMatch handles your data <span aria-hidden="true">↗</span></a>
                </div>
              </details>
            </article>
            <article className="app-card ashfall-card" id="ashfall" data-reveal>
              <div className="app-card-top"><span className="app-category">SURVIVAL & STORY</span><span className="app-number">02</span></div>
              <div className="app-identity"><div className="app-icon ash-icon"><FlameMark /></div><h3>Ashfall</h3></div>
              <p className="app-headline">The world went quiet.<br />Your story didn’t.</p>
              <p className="app-description">A text-driven survival game about scarcity and slow rebuilding. Entirely offline — it makes no network requests and collects nothing at all.</p>
              <div className="app-card-bottom"><span className="app-status"><span />In development</span><span className="offline-label">100% offline</span></div>
              <details className="app-details">
                <summary>Get to know Ashfall <span className="expand-icon" aria-hidden="true" /></summary>
                <div className="app-details-body">
                  <p>A survival story you can take anywhere. Ashfall runs entirely on your device, with no backend, no advertising, and no data collection.</p>
                  <p>Your save file is yours. It stays on your device.</p>
                  <a href="/legal/privacy#app-specific-details">How Ashfall handles your data <span aria-hidden="true">↗</span></a>
                </div>
              </details>
            </article>
            <article className="app-card tenant-card" id="tenant" data-reveal>
              <div className="app-card-top"><span className="app-category">AI AGENT · OPEN SOURCE</span><span className="app-number">03</span></div>
              <div className="app-identity"><div className="app-icon tenant-icon"><AgentMark /></div><h3>Tenant</h3></div>
              <p className="app-headline">Your own AI agent.<br />In one binary.</p>
              <p className="app-description">A single-binary agent you run on your own machine against the model you choose, local or cloud. It remembers what you tell it, uses tools and MCP servers, asks before anything dangerous, and runs 24/7 behind a web dashboard, Discord or iMessage.</p>
              <div className="app-card-bottom"><span className="app-status"><span />Open source, MIT</span><span className="offline-label">Self-hosted</span></div>
              <details className="app-details">
                <summary>Get to know Tenant <span className="expand-icon" aria-hidden="true" /></summary>
                <div className="app-details-body">
                  <p>Install it with one line on macOS, Linux or Windows, point it at Ollama or a cloud key, and talk to it in the terminal or a browser. Everything it learns stays on your machine; the repository ships no keys, memory or personal data.</p>
                  <a href="/tenant">Install, features and the full documentation <span aria-hidden="true">↗</span></a>
                </div>
              </details>
            </article>
          </div>
          <p className="apps-note">Still in the making. Built with care, never rushed.</p>
        </div>
      </section>

      <section id="about" className="principles-section section-pad">
        <div className="container">
          <div className="principles-heading" data-reveal><p className="eyebrow">How we work</p><h2>Good apps ask less.<br /><span>Of you. And your data.</span></h2><p>We’re small on purpose. That shapes everything about how our apps are built and what they ask of you.</p></div>
          <div className="principles-grid">
            {principles.map((principle) => <article className="principle" key={principle.icon} data-reveal><PrincipleMark type={principle.icon} /><h3>{principle.title}</h3><p>{principle.text}</p></article>)}
          </div>
          <a className="text-link" href="/legal/privacy">Our privacy policy, in plain language <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section id="founders" className="studio-section section-pad">
        <div className="container studio-grid">
          <div className="studio-intro" data-reveal><p className="eyebrow">Who we are</p><h2>Two people.<br /><span>Every detail.</span></h2><p>FindTime is built and run by two people.</p><span className="location"><span aria-hidden="true">↗</span> Davis, California</span></div>
          <div className="founders">
            <article className="founder" data-reveal><div className="avatar">DT</div><div><h3>Dylan Taylor</h3><span className="founder-role">Co-founder · Product & engineering</span><p>Works on app architecture, backend infrastructure, and the release process across the portfolio.</p></div></article>
            <article className="founder" data-reveal><div className="avatar">BC</div><div><h3>Ben Coffman</h3><span className="founder-role">Co-founder · Engineering & platform</span><p>Works on systems, tooling, and the infrastructure our apps run on.</p></div></article>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section section-pad">
        <div className="container" data-reveal>
          <p className="eyebrow">Contact</p><h2>Real people.<br /><span>One email away.</span></h2>
          <p>Questions about an app, a bug to report, or a privacy request — email is the fastest way to reach us.</p>
          <a className="contact-email" href="mailto:support@findtime.net">support@findtime.net <span aria-hidden="true">↗</span></a>
          <div className="contact-links"><a href="/support">Help, billing, and subscriptions <span aria-hidden="true">↗</span></a><a href="/legal/privacy">Read our privacy policy <span aria-hidden="true">↗</span></a></div>
          <p className="company-details">FindTime LLC · Davis, California, United States</p>
        </div>
      </section>
    </main>
  );
}
