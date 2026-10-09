---
title: The terminal UI
description: tenant tui is a full-screen chat with a live activity feed. Keys, the slash commands, steering a running turn, and the launch flags.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

```bash
tenant tui
```

The left pane is the conversation; the right pane is the activity feed: every tool call and result, approvals, route decisions, cron runs, sub-agents. A timer under the input reads `⏱ 1:05 · thinking… 45.0s` while the model answers and `· tools… 3.1s` while tools run. Type `/help` for the command index.

## Keys

| Key | Effect |
|---|---|
| <kbd>Enter</kbd> | send; a line starting with `/` is a command |
| typing mid-turn | steers the agent: it addresses your message, then resumes |
| <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>C</kbd> | hard-stop the running turn (a stuck or looping agent); with a `/goal` active, clears the goal; never closes the app |
| <kbd>↑</kbd> / <kbd>↓</kbd> | recall previous prompts and commands (cursor on the first or last input line) |
| <kbd>PgUp</kbd>/<kbd>PgDn</kbd>, <kbd>Shift</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> | scroll the chat pane |
| <kbd>Alt</kbd>+<kbd>PgUp</kbd>/<kbd>PgDn</kbd>, <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> | scroll the activity feed (<kbd>Ctrl</kbd>+<kbd>PgUp</kbd>/<kbd>PgDn</kbd> too) |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | select mode: plain drag highlights text for copying in any terminal; <kbd>Ctrl</kbd>+<kbd>S</kbd> or <kbd>Esc</kbd> returns |
| <kbd>Ctrl</kbd>+<kbd>Y</kbd> | copy the transcript to the clipboard and a file |
| in `/logs` | <kbd>Enter</kbd> opens an event's detail, <kbd>c</kbd> its correlated timeline, <kbd>Esc</kbd> or <kbd>q</kbd> goes back |

`/exit` or `/quit` is the only way out.

## Session commands

| Command | Effect |
|---|---|
| `/help` | the categories; `/help <category>` one of them (`/help models`, `/help safety`); `/help all` everything |
| `/whoami` | the agent id, active backend and model, from the configuration (the model's own answer is unreliable) |
| `/clear` | start a fresh conversation and screen; facts, episodes and the archive are kept |
| `/cls` | clear the screen only |
| `/mouse on\|off` | on (default): the wheel scrolls the TUI; off: plain-drag selection, the wheel scrolls the terminal |
| `/dashboard [on\|off\|status]` | start or stop the web control panel; it launches by default and the choice persists |
| `/tailscale [serve\|serve off\|status]` | publish the dashboard on your tailnet over HTTPS with `tailscale serve` |
| `/compress` (`/compact`) | summarize old turns to free context now; `/expand` brings the latest compacted span back from the archive |
| `/exit`, `/quit` | close the app |

## Command categories

Every slash command belongs to one `/help` category. The full list with syntax is on [Slash commands](/tenant/docs/reference/slash-commands).

| Category | Commands | Covered in |
|---|---|---|
| Models | `/model`, `/ceiling`, `/reasoning`, `/route`, `/setup` | [Models &amp; helpers](/tenant/docs/models/providers) |
| Sub-agents | `/agents` | [Helpers](/tenant/docs/models/helpers) |
| Deep research | `/research`, `/cancel-clarify` | [Teams, research &amp; goals](/tenant/docs/models/teams) |
| Memory | `/memory`, `/compress`, `/expand` | [Memory &amp; soul](/tenant/docs/first-launch/memory) |
| Tools &amp; plugins | `/tools`, `/enable`, `/disable`, `/skill`, `/configure`, `/cancel` | [Built-in tools](/tenant/docs/mcp/built-in-tools), [Integrations](/tenant/docs/mcp/integrations) |
| MCP connectors | `/mcp`, `/peer`, `/github` | [MCPs &amp; tools](/tenant/docs/mcp/overview) |
| Skills | `/skills`, `/ack`, `/undo` | [Skills](/tenant/docs/first-launch/skills) |
| Eval &amp; quality | `/eval`, `/judge` | [Quality evals](/tenant/docs/models/eval) |
| Safety &amp; approvals | `/permissions`, `/approve`, `/deny`, `/relay`, `/imessage` | [Permissions &amp; approvals](/tenant/docs/first-launch/permissions), [Access](/tenant/docs/dashboard/access) |
| Automation | `/cron` | [Scheduled jobs](/tenant/docs/dashboard/cron) |
| Logs | `/logs` | [Logs &amp; alerts](/tenant/docs/dashboard/logs) |
| Goal | `/goal` | [Teams, research &amp; goals](/tenant/docs/models/teams) |
| Plan review | `/review` | [Teams, research &amp; goals](/tenant/docs/models/teams) |

## Launch flags

`tenant tui` takes the common flags every command takes, plus its own:

| Flag | Default | Effect |
|---|---|---|
| `--backend echo\|vllm\|anthropic\|claudecode` | the configured provider, else `echo` | the inference backend; `echo` is offline and deterministic |
| `--agent ID` | `main` | the agent id: its soul, settings file and memory |
| `--config DIR`, `--data DIR` | the OS dirs | where config and data live |
| `--log-dir DIR` | `<data>/logs` | the log book root |
| `--plan-loop-ceiling N` | 16 | max planner↔tool iterations per turn |
| `--api-key KEY` | | a hosted provider's key for this launch only |
| `--self-improve=false` | on | no background distillation while the TUI is up |
| `--distill-every 10m`, `--profile-every 15m`, `--eval-every 24h` | | self-improvement cadences; eval is off until set |
| `--dashboard`, `--dashboard-addr ADDR` | on, `127.0.0.1:8770` | the web control panel |
| `--allow-no-memory` | | start even when embeddings are down |

Plugin flags (`--os`, `--os-allow-exec`, `--web`, `--gsuite`, …) are on [Built-in tools](/tenant/docs/mcp/built-in-tools). A permission mode saved in `settings.<agent>.json` wins over an `--allow-*` flag.

## Without the UI

`tenant chat` runs the same agent on stdin: one line is one turn, the answer goes to stdout. It takes the same flags.

```bash
printf 'remember I prefer Go\nwhat do I prefer?\n' | tenant chat
tenant web "summarize the top story on Hacker News"     # one-shot turns scoped to one plugin
tenant os "what is using the most disk in my home dir?"
```
