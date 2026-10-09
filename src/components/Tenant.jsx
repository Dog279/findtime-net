import { AgentMark } from './Symbols';

const points = [
  { title: 'Bring your own model.', text: 'Ollama, llama.cpp, vLLM or any OpenAI-compatible server; OpenAI, Anthropic, Z.ai, xAI, Sakana, or the Claude Code CLI. Switch with one command, mix per helper, fall back automatically.' },
  { title: 'A memory that learns.', text: 'Working set, episodes, distilled facts, skills and an append-only archive. Context compaction is reversible and auditable. A soul you own defines who the agent is.' },
  { title: 'Safe by default.', text: 'Tools read by default. Commands, writes, sends and irreversible actions wait for your OK, per surface, with per-tool rules and an execution sandbox. A Security log that can’t be cleared.' },
  { title: 'Extend it with MCP and skills.', text: 'Connect remote MCP servers with a browser sign-in, run local ones out of process, trust each one explicitly. Teach it with Agent Skills packages it versions and trusts.' },
  { title: 'Helpers and research.', text: 'Five specialists ship in the binary: Programmer, Researcher, Writer, QA, Strategist. Deep research fans out and returns a cited report. A goal loop keeps working until a judge says it’s done.' },
  { title: 'Runs 24/7, loses nothing.', text: 'A background service with a web dashboard. Reboots cut a turn safely and the agent picks it up when you say continue. One-file backups, retention per data class, verified updates with rollback.' },
];

const surfaces = [
  { title: 'Terminal UI', text: 'Streaming chat with a live activity feed and slash commands that change everything live.' },
  { title: 'Web dashboard', text: 'Chat, approvals, memory, tools, logs, models and helpers in a browser, on your tailnet from your phone.' },
  { title: 'Discord', text: 'DM the bot from your phone; approve each privileged action with a tap on a card.' },
  { title: 'iMessage', text: 'Text it from an allowed number; an operator handle approves by reply. Mac native, or BlueBubbles anywhere.' },
];

const areas = [
  { number: '01', title: 'Setup & install', text: 'One-line install, files and directories, the background service, updates, backups, retention.', href: '/tenant/docs/setup/install' },
  { number: '02', title: 'First launch', text: 'The setup wizard, doctor, the terminal UI, permissions, the sandbox, memory and skills.', href: '/tenant/docs/first-launch/setup-wizard' },
  { number: '03', title: 'Models & helpers', text: 'Providers, switching live, local models, fallbacks, routing, the loop ceiling, helpers and teams.', href: '/tenant/docs/models/providers' },
  { number: '04', title: 'MCPs & tools', text: 'Remote and local MCP servers, trust and tool rules, built-in tools, integrations.', href: '/tenant/docs/mcp/overview' },
  { number: '05', title: 'Dashboard', text: 'Sign in, every page, approvals, Discord and iMessage access, scheduled jobs, logs, the REST API.', href: '/tenant/docs/dashboard/overview' },
  { number: '06', title: 'Reference', text: 'config.json and settings key by key, the CLI, the slash commands, environment variables.', href: '/tenant/docs/reference/config' },
];

export default function Tenant() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="tenant-hero" aria-labelledby="tenant-title">
        <div className="container">
          <p className="eyebrow">Tenant · Open source · MIT</p>
          <h1 id="tenant-title">Your own AI agent.<br /><span>In one binary.</span></h1>
          <p className="tenant-lede">
            Tenant runs on your machine against the model you choose, local or cloud. It remembers what you tell it,
            uses tools and MCP servers, asks before it does anything dangerous, and keeps working 24/7 behind a web
            dashboard, Discord or iMessage. No Python, no service mesh, no account.
          </p>
          <div className="hero-actions">
            <a className="button" href="/tenant/docs/">Read the docs</a>
            <a className="text-link" href="https://github.com/Dog279/TENANT">View on GitHub <span aria-hidden="true">›</span></a>
          </div>
          <div className="tenant-install">
            <div>
              <p className="tenant-install-label">macOS or Linux</p>
              <pre><code>{'curl -fsSL https://github.com/Dog279/TENANT/releases/latest/download/install.sh | sh\ntenant setup'}</code></pre>
            </div>
            <div>
              <p className="tenant-install-label">Windows (PowerShell)</p>
              <pre><code>{'irm https://github.com/Dog279/TENANT/releases/latest/download/install.ps1 | iex\ntenant setup'}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="what" className="apps-section section-pad">
        <div className="container">
          <div className="section-intro" data-reveal>
            <div><p className="eyebrow">What it is</p><h2>An agent you run.<br /><span>Not one you rent.</span></h2></div>
            <p>A Go-native agent built on the Model Context Protocol: a planner that calls tools, a layered memory that learns from interaction, first-party tools built in, and every surface you need to drive it, in one statically linked binary.</p>
          </div>
          <div className="tenant-grid">
            {points.map((point) => <article key={point.title} data-reveal><div className="tenant-mark"><AgentMark /></div><h3>{point.title}</h3><p>{point.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="surfaces" className="principles-section section-pad">
        <div className="container">
          <div className="principles-heading" data-reveal><p className="eyebrow">Drive it from anywhere</p><h2>The same agent.<br /><span>Behind every surface.</span></h2></div>
          <div className="tenant-docs-grid">
            {surfaces.map((surface) => <article className="tenant-doc" key={surface.title} data-reveal><h3>{surface.title}</h3><p>{surface.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="docs" className="studio-section section-pad">
        <div className="container">
          <div className="principles-heading" data-reveal><p className="eyebrow">Documentation</p><h2>Area by area.<br /><span>Every setting under the hood.</span></h2><p>Every command, every config key, and the slash command that changes it live. The version menu on each page switches to the docs of a release.</p></div>
          <div className="tenant-docs-grid">
            {areas.map((area) => <a className="tenant-doc" key={area.href} href={area.href} data-reveal><span className="app-number">{area.number}</span><h3>{area.title}</h3><p>{area.text}</p></a>)}
          </div>
        </div>
      </section>

      <section id="status" className="contact-section section-pad">
        <div className="container" data-reveal>
          <p className="eyebrow">Status</p><h2>Early.<br /><span>But functional.</span></h2>
          <p>Single-operator. The terminal UI, the dashboard, the plugin toolset, the layered memory and compaction pipeline, multi-agent orchestration and the Discord relay work today; APIs and formats may still change. The repository ships zero keys, memory or personal data: everything you generate stays on your machine.</p>
          <div className="contact-links"><a href="https://github.com/Dog279/TENANT">Source, issues and releases on GitHub <span aria-hidden="true">↗</span></a><a href="/tenant/docs/setup/install">Install it <span aria-hidden="true">↗</span></a></div>
          <p className="company-details">Tenant is MIT licensed · Made by FindTime</p>
        </div>
      </section>
    </main>
  );
}
