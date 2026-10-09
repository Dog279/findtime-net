---
title: Tenant documentation
description: Everything about running Tenant, your own single-binary AI agent. Install it, point it at a model, give it tools, and drive it from a terminal, a web dashboard, Discord or iMessage.
toc: false
---

Tenant is one static binary you run yourself. It keeps a memory that learns from your conversations, calls tools (your files, the web, email, MCP servers), asks before it does anything dangerous, and runs 24/7 as a background service with a web dashboard as its control panel. These pages are the reference: every command, every setting, and the slash commands that change them live.

<div class="cards">
<a class="card" href="/tenant/docs/setup/install">
<h3>Setup &amp; install</h3>
<p>One-line install, where files live, running in the background, updates, backups and retention.</p>
</a>
<a class="card" href="/tenant/docs/first-launch/setup-wizard">
<h3>First launch</h3>
<p>The setup wizard, doctor, the terminal UI, permissions, the sandbox, memory and skills.</p>
</a>
<a class="card" href="/tenant/docs/models/providers">
<h3>Models &amp; helpers</h3>
<p>Local and cloud providers, switching live, fallbacks, routing, the loop ceiling, and the helpers your agent delegates to.</p>
</a>
<a class="card" href="/tenant/docs/mcp/overview">
<h3>MCPs &amp; tools</h3>
<p>Remote and local MCP servers, per-connector trust, built-in tools, integrations, and Tenant as an MCP server.</p>
</a>
<a class="card" href="/tenant/docs/dashboard/overview">
<h3>Dashboard</h3>
<p>Sign in, every page, approvals, Discord and iMessage access, scheduled jobs, logs, and the REST API.</p>
</a>
<a class="card" href="/tenant/docs/reference/config">
<h3>Reference</h3>
<p>config.json and settings.&lt;agent&gt;.json key by key, the CLI, the slash commands, environment variables.</p>
</a>
</div>

## Five-minute start

```bash
# macOS or Linux (Windows: see Install)
curl -fsSL https://github.com/Dog279/TENANT/releases/latest/download/install.sh | sh
tenant setup      # pick a provider, paste a key or point at Ollama
tenant doctor     # check endpoints, keys, stores, the service
tenant tui        # chat; /help lists the slash commands
```

No model yet? `tenant tui --backend echo` runs an offline, deterministic stand-in so you can look around.

## How these pages are organized

| Area | Read it when |
|---|---|
| [Setup &amp; install](/tenant/docs/setup/install) | you are installing, upgrading, backing up, or wondering where a file went |
| [First launch](/tenant/docs/first-launch/setup-wizard) | you have a binary and want a working, safely-permissioned agent |
| [Models &amp; helpers](/tenant/docs/models/providers) | you want to change which model answers, add a fallback, or hand work to specialists |
| [MCPs &amp; tools](/tenant/docs/mcp/overview) | you want the agent to do more: connect an MCP server, turn on Gmail, run commands |
| [Dashboard](/tenant/docs/dashboard/overview) | you run Tenant in the background and drive it from a browser or your phone |
| [Reference](/tenant/docs/reference/config) | you know what you want to change and need the exact key, flag or command |

## Conventions

- `tenant …` is a shell command. `/…` is a slash command typed into the terminal UI (`tenant tui`).
- `<config>` is Tenant's config directory and `<data>` its data directory. [Files &amp; directories](/tenant/docs/setup/directories) lists them per OS.
- A setting shown as `dashboard.addr` is the key `addr` inside the `dashboard` object of `config.json`.
- These pages describe Tenant's current `main` branch (**Latest**). The version menu at the top right switches to the documentation frozen for a release, so what you read matches the binary you run.
- Most things can be changed three ways: a slash command (live, persisted), the dashboard (live, persisted), or editing the JSON by hand (the running hub re-reads `settings.<agent>.json` within a few seconds; `config.json` edits need a restart unless the page says otherwise).
