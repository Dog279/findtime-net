---
title: How tools reach Tenant
description: Tenant is an appliance. Its tools come from first-party plugins compiled in, remote MCP servers it connects to, and local MCP servers it starts and confines. Here is the map.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

Tenant is an **appliance, not a framework**: one binary you install, configure and run, never a library you import. You extend it through two stable boundaries, and nothing else runs inside its process:

| Boundary | Gives the agent | Trust |
|---|---|---|
| **MCP servers** (the Model Context Protocol) | tools, run out of process: a remote server over HTTP with OAuth sign-in, or a local server Tenant starts over stdio inside the execution sandbox | per-connector trust (`ask` / `allow` / `deny`) plus per-tool rules |
| **Agent Skills** | know-how: `SKILL.md` packages Tenant imports, versions and trusts explicitly | per-skill trust; see [Skills](/tenant/docs/first-launch/skills) |

Everything else the agent can do comes from **first-party plugins** compiled into the binary: the OS, the web, SQL, a wiki, Google Workspace, X, iMessage, Discord, GitHub, Atlassian, SimpleFIN, cron, and the memory tools. They are first-party because the security model (approval categories, the egress gate, the sandbox, the file-tool guards) assumes that code inside the process is Tenant's own.

## The tool surface, at a glance

```text
/tools                          every tool and its on/off state
/enable <name> | /disable <name>   a tool or a whole plugin, live
/mcp                            connected MCP servers and their state
/permissions                    categories, modes and tool rules
```

| Source | Tools look like | Turned on by | Covered on |
|---|---|---|---|
| first-party plugin | `os_exec`, `web_search`, `gmail_send` | a launch flag (`--os`), `/enable os`, the dashboard's **Tools** page, or configuring the integration | [Built-in tools](/tenant/docs/mcp/built-in-tools), [Integrations](/tenant/docs/mcp/integrations) |
| remote MCP server | `mcp:mcp.atlassian.com:search` | `/mcp add <url>`, `tenant mcp connect`, the agent's `mcp_add`, the **Remote services** page | [Remote MCP servers](/tenant/docs/mcp/remote) |
| local MCP server | `mcp:<name>:<tool>` | an `mcp_servers` entry in `config.json`, then `/enable` | [Local MCP servers](/tenant/docs/mcp/local) |
| another Tenant (peer) | federated search over shared wiki and memory | `/peer invite`, `tenant peer join` | [Teams, research &amp; goals](/tenant/docs/models/teams) |

Tool names are global: two servers offering the same tool name, and the first keeps it.

## How a call is gated

1. **Is the tool enabled?** A disabled tool is not even in the prompt.
2. **Connector trust** (MCP tools only): `deny` hides the server's tools; `allow` skips the per-call gate; `ask` continues.
3. **Tool rules**: a rule for this tool (`allow`, `deny` or `ask`) decides before the category.
4. **Category mode** on this surface: `allow` runs it, `deny` refuses, `ask` raises a request.
5. **The egress gate**: a sensitive tool result (mail, files, tickets) leaving for an outside service follows the `egress` category on its own, whatever ran the tool.

[Trust &amp; tool rules](/tenant/docs/mcp/trust) covers steps 2 and 3; [Permissions &amp; approvals](/tenant/docs/first-launch/permissions) steps 4 and 5.

## Tenant as a server

Tenant can also **be** an MCP server: `tenant mcp-memory` serves its memory (and optionally its whole toolset) to another MCP client over stdio or HTTP + SSE. See [Tenant as an MCP server](/tenant/docs/mcp/memory-server).
