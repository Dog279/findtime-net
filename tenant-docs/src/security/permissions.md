---
title: The permission categories
description: "The eight categories every gated action falls into, the three modes, where each surface starts, and what sits on top of a category: tool rules, command rules, an MCP server's trust and the checks Tenant makes by itself."
area: Security
area-url: /tenant/docs/security/overview
---

Every action that changes something falls into one of eight categories, and each category has a mode: `ask`, `allow` or `deny`. This page is the map. [Permissions &amp; approvals](/tenant/docs/first-launch/permissions) has every pattern, exception and setting.

## The eight categories

| Category | On the dashboard | An action lands here when | Worth knowing |
|---|---|---|---|
| `exec` | Run commands | the agent runs a shell command or code (`os_exec`) | a command can do whatever your account can. Read-only commands skip the prompt (below) |
| `write` | Change files | a file tool creates or changes a file | the file tools write only under their write roots: Tenant's folders, Desktop, Documents, Downloads and the temp folder, unless you start Tenant with others |
| `destructive` | Irreversible actions | `rm -rf`, a format, `DROP` or `ALTER`, a purchase or a delete on a website | also the catch-all: a tool no table knows, and a command the danger classifier flags |
| `web` | Act on websites | the browser clicks, fills or selects | reading a page is not gated |
| `send` | Send messages | an email, an iMessage, a post on X, a Discord message | |
| `egress` | Share private data | something the agent read from a private source (mail, files, tickets, a fleet machine) is about to go to an outside service | it asks about the data leaving, besides whatever the sending tool asks |
| `mcp` | Connect remote services | the agent adds, removes or trusts a tool server | a server's own calls follow that server's trust mode, not this category |
| `sandbox` | Leave the sandbox | a command the sandbox refused is about to run again outside it | the `full` preset leaves this one at `ask` |

## The three modes

| Mode | Effect |
|---|---|
| `ask` | raise a request and wait for you; doing nothing never says yes |
| `allow` | go ahead without asking |
| `deny` | refuse without asking |

A category that an update added, and that you have not chosen a mode for, is marked **New** and asks until you choose.

## Where each surface starts

Modes are kept per surface. The same action can be allowed at your keyboard and refused from your phone.

| Surface | Starts as | Also held by | A request is answered |
|---|---|---|---|
| Host: the terminal UI, the dashboard, scheduled jobs | `ask` for every category | for a scheduled job, the `cron.allow_exec` switch | in the terminal UI or on the dashboard; a job's request is refused when its run ends |
| The Discord relay | `ask` for every category | `relay.allow_exec`: while it is off, `exec`, `write`, `destructive`, `sandbox` and `send` are refused whatever the modes say | on the Discord card, by the one operator |
| The iMessage responder | `deny` for every category | the allowlist of handles that may drive the agent | by `Y <nonce>` from the operator handle; with no operator set, at the host |
| A fleet machine | a copy of the host's categories and rules, taken when the machine is confirmed | the machine's own ceiling, and the rules of the relay or job the turn came from | where the turn came from |

The host's modes and every fleet machine's scheme are kept in `settings.<agent>.json` (`permissions` and `fleet_schemes`). The relay's and the responder's are in `config.json` (`relay.permissions` and `imessage.permissions`).

Tool rules are shared by the host, the relay and the responder. A fleet machine has its own rules, in its scheme ([Fleet and relay permissions](/tenant/docs/security/fleet)).

## What sits on top of a category

A category's mode is the last word only when nothing more specific applies.

| On top | What it does | Set with |
|---|---|---|
| **Tool rules** | map one tool, or a pattern of tools, to a mode. A rule is checked before the category: `allow` runs silently even in an `ask` category, `deny` refuses even where the category allows, and `ask` prompts even past an allow | `/permissions add <pattern> <mode>` |
| **Command rules** | the same for one shell command by its text, written `os_exec(<glob>)` | `/permissions add os_exec(brew install *) allow`, or **always** on a command's prompt |
| **An MCP server's trust** | `ask`, `allow` or `deny` for a whole server. `deny` hides its tools and wins over everything. `allow` lets its tools go ahead even in a category set to `deny`; a `deny` rule still stops one tool | `/mcp trust <label> <mode>` |
| **Session grants** | **approve for the session** covers the same kind of action until Tenant restarts or you revoke it | `/approve session` |

Tenant also makes three checks of its own:

- **Read-only commands run unasked** on the host and over Discord while `exec` is `ask`: `ls`, `cat`, `grep`, `git status`, `Get-ChildItem` and the like, standing bare with literal arguments. Whatever the check cannot tell, it asks about. It is not used over iMessage or on a fleet machine.
- **The danger classifier** files catastrophic commands (`mkfs`, `dd` to a device, `shutdown`, piping remote content into a shell) and the agent's own `tenant service`, `tenant update`, `tenant child` and `tenant fleet` under `destructive`. They ask even when `exec` is allowed.
- **The egress check** follows what the agent has read from private sources, and from fleet machines, and raises an `egress` request when that text is about to leave in a later call.

How rules, trust and categories combine, case by case, is in [How the layers compose](/tenant/docs/mcp/trust#how-the-layers-compose).

## Three presets

```bash
tenant permissions preset safe|balanced|full [--surface local|discord|imessage]
```

| Preset | Sets |
|---|---|
| `safe` | every category to `deny` |
| `balanced` | every category to `ask` |
| `full` | every category to `allow`, except `sandbox`, which stays `ask` |

Before `full`, or before setting `exec` to `allow` by itself: unless commands run in an enforcing sandbox, a command can change Tenant's own settings.

## Reading the result

```bash
tenant permissions effective [--surface local|discord|imessage] [--agent ID]
tenant security audit
```

`effective` prints what each surface may do once categories, rules and trust are combined. The audit points at the combinations that deserve a second look, such as `permissions.host-exec-allow` (commands allowed on a surface where they really run on the host), `permissions.destructive-allow`, `permissions.sandbox-allow` and `mcp.write-bypass`. In the terminal UI, `/permissions` shows the host's modes and rules.
