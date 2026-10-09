---
title: Files &amp; directories
description: Where Tenant keeps its configuration, secrets, memory, logs and work, on each OS.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

Tenant uses two directories: a **config dir** for what you configure and a **data dir** for what it learns and records. Nothing is ever written inside the repository or next to the binary.

## Locations

| | Config dir `<config>` | Data dir `<data>` |
|---|---|---|
| macOS | `~/Library/Application Support/tenant` | `~/Library/Application Support/tenant` (the same folder) |
| Linux | `$XDG_CONFIG_HOME/tenant`, else `~/.config/tenant` | `$XDG_DATA_HOME/tenant`, else `~/.local/share/tenant` |
| Windows | `%AppData%\tenant` (`C:\Users\<you>\AppData\Roaming\tenant`) | `%LocalAppData%\tenant` (`C:\Users\<you>\AppData\Local\tenant`) |

Every command takes `--config DIR` and `--data DIR` to use other directories. The background service pins the directories it was installed with into its unit, and `tenant doctor` warns if the ones you pass no longer match.

A Windows service runs as a service account, so its directories are that account's: `C:\Windows\System32\config\systemprofile\AppData\Roaming\tenant` for SYSTEM, `C:\Windows\ServiceProfiles\LocalService\AppData\Roaming\tenant` for LOCAL SERVICE, unless the service passes `--config`.

## The config dir

| Path | What | Who writes it |
|---|---|---|
| `config.json` | the launch configuration: providers, embeddings, dashboard, relay, cron jobs, MCP servers, helpers, routing, logs ([reference](/tenant/docs/reference/config)) | `tenant setup`, slash commands, the dashboard, you |
| `credentials.json` | API keys and integration secrets, keyed by provider id or `skill:<name>:<field>`; owner-only (`0600`, or a protected DACL on Windows) | `tenant setup`, `/model add-cloud`, `/configure`, the **Provider keys** page |
| `settings.<agent>.json` | the per-agent runtime settings: enabled tools, permission modes, tool rules, exec profiles and exceptions ([reference](/tenant/docs/reference/settings)) | `/enable`, `/permissions`, the dashboard, you (re-read live) |
| `dashboard-auth-token` | the dashboard sign-in key, created on first start | Tenant |
| `soul/<agent>.toml` | the agent's identity and operating rules (T0) | `/memory soul import`, the **Memory** page |
| `soul/proposed/*.toml` | soul changes the self-improvement loop proposes for your review; never applied on their own | Tenant |
| `profiles/*.yaml` | your overrides of the built-in model profiles (context budgets, reserves) | you |
| `mcp/` | the OAuth token cache for remote MCP connectors | Tenant |

Secrets never live in `config.json`. `tenant doctor` checks the permissions of every secret file and `tenant doctor --fix` repairs them. The file tools the agent uses refuse to read or write `credentials.json`, `settings.<agent>.json` and the token file.

## The data dir

| Path | What |
|---|---|
| `episodes.db` | conversation turns (episodic memory, T2) |
| `facts.db` | distilled facts (semantic memory, T3) |
| `skills.db` | the skill library (T4), with trust, origin and history |
| `usage.db` | the token usage ledger |
| `runs.db` | durable records of every turn (`tenant runs export`, `tenant logs trace`) |
| `tenant_meta.db` | scheduler cursors and small durable state |
| `archive/YYYY-MM/<session>.jsonl` | the append-only archive of every message as it was written (T5) |
| `logs/<source>/YYYY-MM-DD.log` | the log book's text files, one folder per subsystem |
| `logs/logbook.db` | the log book's store, which the dashboard, `tenant logs` and alerts read |
| `research/` | deep-research runs and their reports |
| `screenshots/` | browser screenshots the web plugin took |
| `relay-inbox/` | files you sent the agent over Discord |
| `attachments/YYYY-MM/` | images messages carried (pasted, sent over a relay, or read by a tool), scaled and saved once each; they follow the archive's retention |
| `eval-artifacts/` | eval reports, `baseline.<subset>.json` and `trend.jsonl` |
| `route-decisions.jsonl` | the prompt router's decision log |
| `cron-history.json` | run history of scheduled jobs (their definitions are in `config.json`) |
| `discord-cursor.json`, `interrupted.json` | what Tenant needs to catch up after a restart |
| `update-state.json` | present only while an update is in progress or was interrupted |
| `proc/` | logs of background processes started with `os_exec background: true` |
| `mcp/<name>/` | the work dir of each local MCP server |
| `x-token.json` | the X (Twitter) OAuth token |
| `.tenant.lock` | held shared by every running command, exclusively by `tenant backup restore` |

Next to the data dir, `tenant update` keeps `<data>-backups/pre-update-<version>.tenant-backup`.

## Retention

Each class of data has its own retention: `tenant privacy` shows it and `tenant privacy retention set <class> <days|forever>` changes it. Logs are kept 30 days by default (`logs.retention_days`), run records 90 days (`runs.max_age_days`), route decisions 90 days (`route.log_retention_days`). See [Privacy &amp; retention](/tenant/docs/setup/privacy).
