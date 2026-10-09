---
title: Tenant as an MCP server
description: tenant mcp-memory serves Tenant's memory, and optionally its whole toolset, to another MCP client over stdio or HTTP + SSE.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

```bash
tenant mcp-memory [--allow-writes] [--tools] [--sse-addr 127.0.0.1:8765] [--insecure-lan] [--allow-no-memory]
```

| Flag | Effect |
|---|---|
| (none) | serve over stdio, read-only: memory search and recall |
| `--allow-writes` | also expose `memory_fact_add` |
| `--tools` | expose the full plugin toolset (wiki, sql, os, …) over MCP, not just memory |
| `--sse-addr ADDR` | serve over HTTP + SSE on this address instead of stdio |
| `--insecure-lan` | let `--sse-addr` bind a non-loopback address. The SSE gateway has **no authentication**; this is the secure-by-default opt-out, for an overlay network only |
| `--allow-no-memory` | serve even when embeddings are down |

The gateway mode persists in `config.json`:

```json
"gateway": { "mode": "sse", "sse_addr": "127.0.0.1:8765" }
```

`tenant setup --gateway 127.0.0.1:8765` sets it; `tenant setup --local` clears it back to stdio. `tenant mcp-selftest` spawns `mcp-memory` as a subprocess and exercises the protocol against it; `tenant doctor` (**mcp surface**) does a round-trip too.

## A client configuration

For an MCP client that launches servers over stdio (a coding assistant, an editor):

```json
{ "mcpServers": { "tenant-memory": { "command": "tenant", "args": ["mcp-memory", "--allow-writes"] } } }
```

The client then searches what Tenant remembers, and with `--allow-writes` can add facts that Tenant's own turns recall.
