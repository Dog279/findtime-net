---
title: settings.&lt;agent&gt;.json
description: The per-agent runtime settings the running hub re-reads live. Enabled tools, permission modes, tool rules, execution profiles and sandbox exceptions.
area: Reference
area-url: /tenant/docs/reference/config
---

`<config>/settings.<agent>.json` (`settings.main.json` for the default agent) holds what must survive a restart but changes while Tenant runs. The running hub polls it and applies a hand edit within about 3 seconds, reporting what it reloaded in the feed; its own saves never re-trigger. A corrupt file is reported and ignored, never silently replaced. The agent's file tools refuse to read or write it.

```json
{
  "tools": { "os_exec": true, "web_click": false },
  "permissions": { "exec": "ask", "write": "allow", "destructive": "ask", "web": "ask", "send": "ask", "egress": "ask", "mcp": "ask", "sandbox": "ask" },
  "known_categories": ["exec", "write", "destructive", "web", "send", "egress", "mcp", "sandbox"],
  "announced_categories": ["egress", "mcp", "sandbox"],
  "tool_rules": { "delete_*": "deny", "write_note": "allow", "os_exec(brew install *)": "allow" },
  "exec_profiles": { "default": { "enforce": true, "env_pass": ["JAVA_HOME"] }, "cron-shell": { "backend": "host" } },
  "exec_exceptions": { "local": ["/Users/me/projects"] }
}
```

| Key | Meaning | Written by |
|---|---|---|
| `tools` | tool name → enabled; overrides the launch-flag default on the next run; a tool missing from the map keeps its flag default | `/enable`, `/disable`, **Tools** page, `/api/tools` |
| `permissions` | category → `ask`, `allow`, `deny` for the host surface | `/permissions set`, `/approve always`, **Approvals &amp; safety**, `tenant permissions preset` |
| `known_categories` | the categories you have chosen a mode for; one that asks and is not listed arrived with an update and shows as **New** | every permission change |
| `announced_categories` | the new categories the terminal UI has already told you about | the terminal UI |
| `tool_rules` | pattern → mode: an exact action id, a bare tool name, a glob, or `os_exec(<glob>)` for a command ([Trust &amp; tool rules](/tenant/docs/mcp/trust)) | `/permissions add`, `/permissions rm`, **Tools** page, by hand |
| `exec_profiles` | surface or `default` → the execution profile ([fields](/tenant/docs/first-launch/sandbox)) | by hand only |
| `exec_exceptions` | surface → folders its sandboxed commands may also write to | **Always** on a sandbox prompt; removed by hand |

The agent id is `--agent ID` (default `main`); each agent has its own settings file, soul and memory.

The Discord relay's and the iMessage responder's permission maps live in `config.json` (`relay.permissions`, `imessage.permissions`), not here; tool rules and exec profiles are shared by every surface.
