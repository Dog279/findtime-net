---
title: Remote MCP servers
description: Connect any MCP server over HTTP, with a browser sign-in when it asks for one. From the terminal UI, the shell, the dashboard, or by the agent itself.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

A remote server's tools appear as `mcp:<label>:<tool>` and start at trust `ask`: every gated call prompts you until you decide otherwise. Connections persist in `config.json` (`mcp_remotes`, the URLs; `mcp_trust`, the trust per URL) and reconnect silently at the next launch.

## Connect

```text
/mcp                                     connected servers, their state and tool counts
/mcp add <url>                           connect; a browser opens only if the server asks for sign-in
/mcp trust <label> <ask|allow|deny>      live trust for its tools (also /mcp allow|ask|deny <label>)
/mcp remove <url>                        disconnect and forget it
```

```bash
tenant mcp connect <url> [--trust-annotations] [--callback 127.0.0.1:8765] [--no-browser]
```

| Flag | Effect |
|---|---|
| `--trust-annotations` | trust the server's own read-only annotations, so tools it marks read-only skip the gate under `ask` |
| `--callback host:port` | the local OAuth callback (default `127.0.0.1:8765`) |
| `--no-browser` | reconnect from the cached token only; fail if there is none (tests the silent-reconnect path) |

The dashboard's **Remote services** page has **Connect** (with the URL), a per-server trust select, **Reconnect** and **Disconnect**.

```text
/mcp add https://mcp.atlassian.com/v1/mcp
```

## Sign-in

Tenant speaks OAuth 2.1 with dynamic client registration. When a server answers `401`, Tenant binds the callback port, opens a browser, captures the code, and releases the port; the token goes to `<config>/mcp/`. A server that never asks for sign-in (a local tool server) never touches the port. Sign-ins are serialized, and the port is bound only during one, so a long-running hub can add servers indefinitely.

On a machine with no screen (a Windows service), the browser never appears: press **Connect**, then open the dashboard **on that machine**, find the "sign-in: open this URL to authorize Tenant" line in **Logs** (filter `open this URL`, or `log:mcp*`), and finish the sign-in in a browser there. The link is good for that one sign-in.

**A dead refresh token is loud.** When a server's refresh fails for good, the connector is marked as needing re-auth: `/mcp` shows "⚠ NEEDS RE-AUTH since … /mcp add <url>", **Remote services** shows a red badge and **Reconnect**, `tenant doctor` fails its **remote MCP auth** check, the operator gets a Discord DM when the relay is on, and every cron summary carries a banner until you reconnect. Re-auth needs the host browser once: `tenant mcp connect <url>` or **Reconnect**.

## Labels

A hosted service is labelled by host (`mcp:mcp.atlassian.com`). A local address keeps its port (`mcp:127.0.0.1:9000`), and a URL that would still collide gets its path appended, so several local servers on one host coexist.

## The agent connects its own tools

Four agent tools let the model adopt a tool server at runtime, gated by the `mcp` permission category (`ask` by default):

| Tool | Does |
|---|---|
| `mcp_list` | the connected servers |
| `mcp_add url=… [trust=allow] [reason=…]` | connect a server; when it asks for `trust=allow`, a second prompt lets you decide whether its tools run unprompted |
| `mcp_trust` | change a server's trust |
| `mcp_remove` | disconnect one (refused for a local server, which lives in `config.json`) |

`/permissions set mcp allow` is the hands-off switch: the agent can build a tool server, connect it, and have its tools trusted without a prompt. Each adopted server still starts at `ask` unless the agent asked for `allow` and the category auto-approved it. Cron runs never get these tools. A complete example tool server, with the adoption loop written up, is in the Tenant repository under `reference/mcp/`.

## Logs

Each connector has its own log: `tenant logs query "log:mcp*"`, or the dashboard's **Logs** with `log:mcp*`. A connector URL's key never reaches the system log or a connect error.
