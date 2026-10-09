export default function DocumentPage({ page, route }) {
  return (
    <main id="main" className="document-page container" tabIndex={-1}>
      <div className="document-breadcrumb"><a href="/">FindTime</a><span aria-hidden="true">/</span>{route === '/support' ? 'Support' : 'Legal'}</div>
      <div className="document-layout">
        <aside className="document-nav">
          <details open>
            <summary>On this page</summary>
            <nav aria-label="On this page">
              {page.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, '')}</a>)}
            </nav>
          </details>
          <a className="document-help" href="mailto:support@findtime.net">Talk to a real person <span aria-hidden="true">↗</span></a>
        </aside>
        {/* Checked-in content migrated from FindTime, never user-supplied HTML. */}
        <article className="document-content" dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </main>
  );
}
