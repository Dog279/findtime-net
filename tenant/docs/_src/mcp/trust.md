---
title: Trust &amp; tool rules
description: Per-connector trust answers "this whole server"; tool rules answer "this tool". Both apply live, from the terminal UI, the dashboard, the agent, or a text editor.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

## Connector trust

Every MCP connector, remote or local, has a live trust mode. It is set at adoption, changed any time, persisted per server in `config.json` (`mcp_trust`), and re-applied when the connector reconnects at launch.

| Mode | Effect |
|---|---|
| `ask` (default) | every gated call prompts; a tool the server annotates read-only skips the gate only when its annotations are trusted (`--trust-annotations` / `--mcp-trust-annotations`) |
| `allow` | its tools run without per-call approval |
| `deny` | its tools are refused and hidden from the agent |

```text
/mcp trust <label> <ask|allow|deny>
/mcp allow <label>  ·  /mcp ask <label>  ·  /mcp deny <label>
```

The dashboard's **Remote services** page: **Ask first** and **Block** are one tap; **Don't ask** confirms first, because its tools then go ahead even in a category set to Deny. The agent's `mcp_trust` tool is gated by the `mcp` category. `tenant security audit` reports `mcp.trust-annotations` and `mcp.write-bypass` when trust lets writes through unprompted.

## Tool rules

A rule maps a tool pattern to a mode and is checked **before** the category, inside the connector gate and on every broker (host, Discord, iMessage):

| Pattern | Matches |
|---|---|
| `write_note` | that tool on any connector, or the local tool of that name |
| `mcp:127.0.0.1:9000:write_note` | one tool on one server |
| `mcp:127.0.0.1:9000:*`, `delete_*`, `*:search_*` | a glob: `*` any run, `?` one character |

Most specific wins: exact id, then bare name, then glob (longer literal first).

```text
/permissions add mcp:127.0.0.1:9000:* allow     allow-list a server's tools under an ask category
/permissions add delete_* deny                  deny one dangerous tool on an allowed server
/permissions add write_note ask                 force a prompt on one tool in an allow category
/permissions rm delete_*
```

```json
"tool_rules": { "delete_*": "deny", "write_note": "allow" }
```

The file is `<config>/settings.<agent>.json`; the running hub applies an edit within about 3 seconds. The **Tools** page has a **Tool rules** card. There is no agent tool for rules: the model cannot grant itself permissions.

## How the layers compose

| Rule | Trust | Category | Result |
|---|---|---|---|
| `allow` | `ask` | `ask` or `destructive` | runs silently |
| `deny` | `allow` | `allow` | refused silently |
| `ask` | `allow` | `allow` or a session grant | prompts anyway; **approve always** flips the rule, not the category |
| none | `deny` | any | hidden: connector deny wins over everything |
| none | `ask` | `allow` | runs |
| none | `ask` | `ask` | prompts |

Every rule decision and every change to trust or rules is an audit line in the `approvals` log and the Security log.

## Recommended posture

1. Leave new connectors at `ask` and work with them for a day.
2. Allow-list the safe read tools with rules (`mcp:<label>:search_*` allow).
3. Move a connector to `allow` only when every tool it offers is one you would run unprompted; deny the exceptions by rule.
4. Keep `/permissions set mcp ask` unless you want the agent adopting tool servers on its own.
