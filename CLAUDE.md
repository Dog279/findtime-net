# findtime.net: notes for Claude Code sessions

A static site. The host (Cloudflare Pages or GitHub Pages) runs no build step, so every
file in this repository is served as it is. Extensionless URLs resolve (`/support` is
`support.html`), and the pages link that way.

- `index.html`, `support.html`, `legal/*.html`: hand-written, each with its CSS inline.
- `tenant/index.html`: the Tenant showcase page, same style, hand-written.
- `tenant/docs/`: the Tenant documentation, **generated**. Edit the Markdown, not the HTML.

## The Tenant docs

- **Sources:** `tenant/docs/_src/<area>/<page>.md`, with YAML front matter `title`,
  `description`, `area`, `area-url`. Quote a value that contains `: `. The page title comes
  from the front matter; the body starts at `##`.
- **Build:** `sh tenant/docs/_src/build.sh` (needs pandoc: `brew install pandoc`). It
  writes `tenant/docs/<area>/<page>.html`. Commit the Markdown **and** the generated HTML.
- **Adding a page:** create the `.md`, add its link to `tenant/docs/_src/nav.html` (the
  sidebar every page shares), build, and link it from its area's overview page if one exists.
- **Template and styles:** `tenant/docs/_src/template.html` (header, the sidebar partial
  `nav.html`, breadcrumbs, the in-page table of contents, the version menu) and
  `tenant/docs/docs.css`, which reuses the site's CSS tokens.
- **Links** are absolute and extensionless: `/tenant/docs/setup/install`. After a build,
  check them: every `href="/tenant/..."` must resolve to a file or a `.html` twin.
- **Preview:** `python3 tenant/docs/_src/preview.py`, then open
  http://127.0.0.1:8123/tenant/ (plain `http.server` does not resolve extensionless links).

## Versions

`/tenant/docs/` is **Latest** and documents Tenant's `main` branch. When a Tenant release is
tagged, freeze the docs for it:

```sh
sh tenant/docs/_src/build.sh && sh tenant/docs/_src/snapshot.sh vX.Y.Z
```

That copies the built docs to `tenant/docs/vX.Y.Z/` with its links rewritten to stay inside
the copy, and lists the version in `tenant/docs/versions.js`, which the header's version menu
reads (newest first). Commit both. A frozen version is never edited, except to correct a
statement about what that version actually did.

## Where the facts come from

Every command, flag, key and slash command in the docs is taken from the Tenant repository
(https://github.com/Dog279/TENANT), not from memory: the CLI registry
(`cmd/tenant/cliregistry.go` and each command's flags), the slash-command registry
(`internal/tui/cmd_*.go`), the configuration types (`internal/config/*.go`), the plugin
descriptors (`cmd/tenant/plugin_*.go`), the dashboard routes (`internal/dashboard`) and
`docs/*.md` there. When a Tenant pull request changes behavior, its docs change lands here in
a pull request that references it, merged when the Tenant one merges. The TENANT repository's
`CLAUDE.md` has the table of which code maps to which page.
