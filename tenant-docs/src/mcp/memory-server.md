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
| `--sse-addr ADDR` | serve over HTTP + SSE on this address instead of stdio; every request then needs [the gateway's token](#the-sse-gateways-token) |
| `--insecure-lan` | let `--sse-addr` bind a non-loopback address. The SSE gateway serves **plain HTTP**, so its token crosses that network unencrypted; this is the secure-by-default opt-out, for an overlay network only |
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

## The SSE gateway's token

Every request to the SSE gateway must carry the gateway's token:

```
Authorization: Bearer <token>
```

The token is one long line in `<config>/gateway-auth-token`, created the first time the gateway starts. The gateway prints where the file is when it starts, never the token itself. It is a token of its own: a client you give the gateway does not hold the dashboard's sign-in key.

```bash
cat ~/Library/Application\ Support/tenant/gateway-auth-token   # macOS
cat ~/.config/tenant/gateway-auth-token                        # Linux
```

```powershell
Get-Content -LiteralPath "$env:APPDATA\tenant\gateway-auth-token"   # Windows
```

An MCP client that connects over SSE takes the header in its server entry; the exact key depends on the client. For example:

```json
{ "mcpServers": { "tenant-memory": { "type": "sse", "url": "http://127.0.0.1:8765/sse", "headers": { "Authorization": "Bearer <token>" } } } }
```

Without the header the gateway answers `401`. A client that cannot send a header should launch `tenant mcp-memory` over stdio instead, as above. To change the token, stop the gateway, delete `gateway-auth-token`, start it again and give clients the new one. The file is one of Tenant's secret files: `tenant doctor` checks its protection, the agent's file tools refuse to read it, and an unencrypted backup leaves it out.

## What else the SSE gateway checks

- **A loopback gateway answers to loopback names only.** A request must reach it as `localhost` or a loopback address (`127.0.0.1`, `[::1]`) on its own port. Any other host name is refused with `403`.
- **No web page can use it.** A request that carries another site's `Origin`, which is how a browser marks a request a page made, is refused with `403`, token or not. An MCP client is not a browser and sends no `Origin`.
- **Messages are JSON, in the stream's own session.** The stream's first event names the address to post to, with a `sessionId`; a message without that id is refused with `403`, and one that is not `application/json` with `415`. MCP clients already post JSON to the address the stream names.

The gateway serves plain HTTP. On a loopback address that stays on the machine. A gateway bound to a non-loopback address with `--insecure-lan` sends the token and everything a client reads across that network unencrypted, so use it on an overlay network only; such a gateway is reached by whatever name that network gives the machine, so its host name is not checked, and the token, `Origin` and message rules still apply.

With `--tools` the gateway exposes the whole toolset, and it runs there with no request for your OK: whoever holds the token can do what those tools do.
