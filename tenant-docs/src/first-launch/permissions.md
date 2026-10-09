---
title: Permissions &amp; approvals
description: Every dangerous action maps to one of eight categories you set to ask, allow or deny, per surface. Tool rules and command rules refine that per tool. Here is the whole model and every command that changes it.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

Tools are **read by default**. Anything that changes the world (runs a command, writes a file, sends a message, clicks a form) is gated: it goes through the approval broker, which resolves the action to a category, applies your rules, and either runs it, refuses it, or raises a request you answer in the terminal UI, the dashboard, Discord or iMessage.

## The categories

| Category | Covers | Dashboard name |
|---|---|---|
| `exec` | run shell / python / code (`os_exec`) | Run commands |
| `write` | create and modify files (`os_write_file`, `os_edit_file`, `os_append_file`, `os_make_dir`) | Change files |
| `destructive` | irreversible actions: `rm -rf`, format, `DROP`/`ALTER`, a web purchase or delete | Irreversible actions |
| `web` | act on the web unprompted: click, fill, select | Act on websites |
| `send` | outbound comms: email, iMessage, X posts, Discord messages | Send messages |
| `egress` | sensitive tool results crossing a trust boundary (mail, files, tickets sent to an outside service) | Share private data |
| `mcp` | the agent adopting or reconfiguring tool servers (`mcp_add`, `mcp_remove`, `mcp_trust`) | Connect remote services |
| `sandbox` | re-running a command outside the execution sandbox after it refused it | Leave the sandbox |

A tool the categories have never heard of (one from a newly adopted MCP server, say) falls to `destructive`, which always prompts, until you write a rule for it.

## The modes

| Mode | Effect |
|---|---|
| `ask` | prompt you each time; doing nothing never says yes |
| `allow` | go ahead without asking |
| `deny` | refuse without asking |

Modes are **per surface**: the host (terminal UI, dashboard, serve chat, cron) has its own map, the Discord relay its own, the iMessage responder its own.

| Surface | Default | Stored in | Set with |
|---|---|---|---|
| host | `ask` for every category | `settings.<agent>.json` → `permissions` | `/permissions set`, the dashboard's **Approvals &amp; safety** page, `tenant permissions preset` |
| Discord relay | `ask` (buttons on a card); `exec`, `write`, `destructive`, `sandbox` and `send` are refused outright until `relay.allow_exec` is on | `config.json` → `relay.permissions` | `/relay permissions set`, the **Access** page |
| iMessage responder | `deny` for every category | `config.json` → `imessage.permissions` | `/imessage permissions set`, the **Access** page |

A category an update added that you have not chosen for yet is marked **New** and asks until you choose (`known_categories` in the settings file records what you chose).

## Changing modes

```text
/permissions                        the categories' modes and the tool rules
/permissions set <cat> <mode>       e.g. /permissions set exec allow
/relay permissions set <cat> <mode>
/imessage permissions set <cat> <mode>
```

```bash
tenant permissions effective [--surface local|discord|imessage] [--agent ID]   # the composed authority, by agent and surface
tenant permissions preset safe|balanced|full [--surface local|discord|imessage]
```

| Preset | Means |
|---|---|
| `safe` | every category `deny` |
| `balanced` | every category `ask` |
| `full` | every category `allow`, except `sandbox`, which stays `ask` |

Or by hand in `settings.<agent>.json`; the running hub re-reads it within about 3 seconds:

```json
"permissions": { "exec": "ask", "write": "allow", "send": "deny" }
```

Launch flags (`--os-allow-exec`, `--os-allow-write`, `--gsuite-allow-send`, `--web-allow-interact`, …) set a category to allow for that launch. A mode saved in the settings file wins over a flag.

> **Before setting `exec` to allow,** read the dashboard's warning. Unless commands run in the sandbox, a command can change Tenant's own settings, and the agent could then answer its own requests. Keep `exec` at `ask` unless your commands run in an enforcing sandbox profile.

## Answering a request

In the terminal UI a paused action shows a card:

```text
/approve             this one action
/approve session     the same kind of action, until Tenant restarts (or you revoke it)
/approve always      change the category to allow (for an exec prompt: save the command's family as a rule instead)
/deny                refuse (alias /reject)
```

The dashboard offers **Allow once**, **Deny** and, where the grant is safe to show, **Allow for the rest of this session**. Discord shows **Approve** / **Deny** buttons on a card; iMessage takes `Y <nonce>` or `deny <nonce>` from the operator handle. The first answer counts, wherever it came from.

A request nobody answers is refused: a cron job's after its run cap (15 minutes, `cron.per_run_minutes`), an alert investigation after 15 minutes, a Discord card after `relay.approval_timeout` (10 minutes), and every pending one when Tenant stops.

## Tool rules

A rule maps a tool pattern to a mode and is checked **before** the category, on every surface. Rules are how you handle tools nobody pre-programmed a category for.

| Pattern | Matches |
|---|---|
| `write_note` | that tool on any connector (`mcp:…:write_note`) or the local tool of that name |
| `mcp:127.0.0.1:9000:write_note` | one tool on one server |
| `mcp:127.0.0.1:9000:*`, `delete_*`, `*:search_*` | many: `*` any run, `?` one character |

Most specific wins: an exact id, then a bare name, then a glob (longer literal first).

- `allow` runs silently, even in an `ask` category and even for a tool the category table calls destructive.
- `deny` refuses silently, even under a trusted connector.
- `ask` always prompts, even past a category allow or a session grant. **Approve always** on such a prompt flips **that rule** to allow, never the category.

```text
/permissions add <tool|pattern> <mode>     /permissions add delete_* deny
/permissions rm <pattern>
```

```json
"tool_rules": { "delete_*": "deny", "write_note": "allow", "mcp:127.0.0.1:9000:*": "ask" }
```

The dashboard's **Tools** page has a **Tool rules** card. There is deliberately no agent tool for rules: the model cannot grant itself permissions. Every rule decision and change is an audit line in the `approvals` log.

## Command rules (`os_exec`)

A rule can decide a shell command by its text. Patterns are `os_exec(<glob>)`:

```text
/permissions add "os_exec(brew install *)" allow
/permissions add "os_exec(git push)" deny        # that command alone
```

A compound command is judged per segment: any deny denies, else any ask asks, else allow when every segment matched. **Always** on an exec prompt saves the command's family as such a rule instead of opening all of `exec`.

**Read-only commands run without a prompt** on the host and over Discord: `ls`, `cat`, `rg`, `git status`, `brew list`, `find` without `-delete` or `-exec`, and the like, when every segment of the command only looks, nothing redirects output and nothing escalates with `sudo`. iMessage stays deny-by-default. A category `deny` and your rules still bind. Separately, a **danger classifier** hard-blocks catastrophic commands whatever the mode (`mkfs`, `dd` to a device, disk erase, `shutdown`, a fork bomb, piping remote content to a shell, `tenant service` and `tenant update` from inside the agent).

## Auditing the posture

```bash
tenant security audit [--json]     # non-zero exit on a critical finding
```

Reports what each live surface may do without approval, the browser sandbox, listeners, secret-file protection and the execution profiles. Finding ids include `permissions.host-exec-allow` (exec allowed on a surface whose commands really run on the host), `permissions.destructive-allow`, `permissions.sandbox-allow`, `execution.dry-run`, `execution.host`, `execution.unavailable`, `mcp.trust-annotations`, `mcp.write-bypass`, `browser.no-sandbox`, `secret.dashboard-auth`, `web.remote-reader`.

The Security log (`tenant logs query "log:security"`, or the dashboard's **Logs**) records every request, who answered it and what they answered, and every change to a mode or rule, with where it was made. It can never be cleared.

## Related settings

| Setting | Where | Effect |
|---|---|---|
| `relay.allow_exec` | `config.json`, `/relay exec on\|off` | unlock `exec`, `write`, `destructive`, `sandbox` and `send` offsite; each then follows `relay.permissions` |
| `relay.approval_timeout` | `config.json`, `/relay timeout <dur>` | how long a Discord card waits (30 s to 24 h; default `10m`) |
| `imessage.operator` | `config.json` | the handle whose `Y <nonce>` approves over iMessage; unset, an `ask` category prompts at the host instead |
| `cron.allow_exec` | `config.json`, `/cron exec on\|off` | the global switch for shell jobs and exec-opted-in prompt jobs |
| `--os-write-roots`, `--os-deny-roots` | launch flags of the OS plugin | where the file tools may write (default: Tenant's dirs, Desktop, Documents, Downloads, the temp dir) and what they may never touch |
