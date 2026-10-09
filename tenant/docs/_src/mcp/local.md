---
title: Local MCP servers
description: Tenant starts a local MCP server itself, talks to it over stdio, and runs it out of process inside the execution sandbox. Every field of an mcp_servers entry.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

A third-party server is third-party code, so Tenant never loads it into its own process. An `mcp_servers` entry in `config.json` names the server, the command that starts it, and the boundary it runs in. The server appears as connector `mcp:<name>`, a stub until you `/enable` it; it starts in the background at launch as remote connectors reconnect.

```json
"mcp_servers": [
  {
    "name": "notes",
    "command": ["/usr/local/bin/notes-mcp", "--root", "/Users/me/notes"],
    "sandbox": "restricted",
    "network": "none",
    "read_roots": ["/Users/me/notes"],
    "write_roots": ["/Users/me/notes"],
    "env_pass": ["HOME"],
    "env_set": { "NOTES_FORMAT": "md" },
    "memory_mb": 512,
    "cpu_seconds": 600,
    "max_pids": 32
  }
]
```

| Field | Default | Meaning |
|---|---|---|
| `name` | | the connector name `mcp:<name>`: letters, digits, `-` and `_` |
| `command` | | the program and its arguments |
| `sandbox` | `restricted` | `restricted` (filesystem and network confinement; macOS only), `jobobject` (Windows: resource caps and the environment allowlist only) or `host` (no boundary: your explicit choice). On Linux and Windows a server does not start until the entry names a backend. |
| `work_dir` | `<data>/mcp/<name>` | its working directory |
| `network` | `none` | `none`, `full` or `inherit` |
| `read_roots`, `write_roots`, `deny_roots` | | what it may read and write; Tenant's config and data dirs, its binary and the local credential stores are always denied |
| `env_pass` | | parent environment variables it may see; the environment is otherwise scrubbed |
| `env_set` | | fixed values |
| `cpu_seconds`, `memory_mb`, `max_pids` | | caps, where the backend applies them |

Refused at load: a network allowlist (no backend enforces one), relative roots, an unknown sandbox, and a bad name.

## Trust and gating

A local server's tools are gated exactly like a remote connector's: deny-by-default unless you trust its annotations, then connector trust, tool rules, and the approval gate. Its trust is kept under `stdio:<name>` in `mcp_trust`:

```text
/mcp trust notes allow
```

```json
"mcp_trust": { "stdio:notes": "allow", "https://mcp.atlassian.com/v1/mcp": "ask" }
```

`/mcp remove` and the agent's `mcp_remove` refuse a local server: remove its entry from `config.json`.

## Lifetime and visibility

A server lives as long as the Tenant command that started it; `tui`, `serve` and `chat` each start their own. `tenant permissions effective` lists every integration and where its code runs (in Tenant's process for first-party plugins, on another host for remote servers, out of process under its backend for local ones), with the isolation level and what this host enforces for filesystem, network and environment. `tenant security audit` warns about a local server with no confinement, or one that cannot start. Each server logs under its own name (`log:mcp*`).

Only first-party code runs in Tenant's process; a test in the repository holds that invariant.
