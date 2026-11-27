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
| `credentials.json` | API keys and integration secrets, keyed by provider id, `skill:<name>:<field>` or `judge` (the [judge](/tenant/docs/models/judge)'s key); owner-only (`0600`, or a protected DACL on Windows) | `tenant setup`, `/model add-cloud`, `/configure`, the **Provider keys** page |
| `settings.<agent>.json` | the per-agent runtime settings: enabled tools, permission modes, tool rules, exec profiles and exceptions ([reference](/tenant/docs/reference/settings)) | `/enable`, `/permissions`, the dashboard, you (re-read live) |
| `dashboard-auth-token` | the dashboard sign-in key, created on first start | Tenant |
| `dashboard-lan-cert.pem`, `dashboard-lan-key.pem` | the self-signed certificate and key of the dashboard's [local-network listener](/tenant/docs/dashboard/overview#on-your-local-network); owner-only, made the first time that listener starts | `/dashboard serve lan` |
| `gateway-auth-token` | the token an MCP client sends to the [SSE gateway](/tenant/docs/mcp/memory-server#the-sse-gateways-token), created the first time `tenant mcp-memory --sse-addr` starts | Tenant |
| `soul/<agent>.toml` | the agent's identity and operating rules (T0) | `/memory soul import`, the **Memory** page |
| `soul/proposed/*.toml` | soul changes the self-improvement loop proposes for your review; never applied on their own | Tenant |
| `profiles/*.yaml` | your overrides of the built-in model profiles (context budgets, reserves) | you |
| `mcp/` | the OAuth token cache for remote MCP connectors | Tenant |
| `fleet.json` | on a fleet master: its machines (name, state, certificate fingerprint, what each reported), the addresses a code tells them to dial, the pending codes' hashes and the recovery key's public half; owner-only ([Fleet](/tenant/docs/fleet/overview)) | `tenant fleet …`, `/fleet`, the **Fleet** page |
| `fleet-identity.pem` | on a fleet master: its key pair and self-signed certificate for the fleet link; owner-only | `tenant fleet init` |
| `fleet-key` | on a fleet master: the fleet key every machine's memory is encrypted to, sealed by the system's secret protector where there is one (Windows' data protection), an owner-only file elsewhere | `tenant fleet init` |
| `fleet.holder` | on a fleet master: which process holds the fleet's links | Tenant |
| `child/` | on a fleet machine: the child's directory (below) | `tenant child install` |

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
| `fleet/` | on a fleet master: each machine's memory as encrypted snapshots, one folder per machine id, with the memory kept aside after it was replaced (30 days); `forgets.age`, the sealed record of forgets still to reach the machines |
| `fleet-updates/<tag>/<os>_<arch>/` | on a fleet master: the releases `tenant fleet update` fetched and verified for its machines |

Next to the data dir, `tenant update` keeps `<data>-backups/pre-update-<version>.tenant-backup`.

## On a fleet machine

A child keeps its files in its own directory, the machine's: `/etc/tenant/child` (Linux), `/Library/Application Support/tenant/child` (macOS), `C:\ProgramData\tenant\child` (Windows). One that runs as a single account keeps them in the directory `tenant child install --dir` named, or in `<config>/child` where an earlier Tenant installed it. The file tools refuse it.

| Path | What |
|---|---|
| `child.json` | the id and name the master gave the machine, the master's addresses and certificate fingerprint, the sandbox, the ceiling (`full`, `no-exec`, `read-only`), `tools` (the only tools it serves), `secret_paths`, `updates`; owner-only, read from the disk on every call |
| `child-identity.pem` | the machine's own key pair and certificate, minted at enrollment |
| `audit/audit.jsonl` | the hash-chained log of every call from the master, written before the call runs; `tenant child audit` checks it, `tenant child uninstall` leaves it |
| `memory/` | the last three encrypted copies of the machine's memory the master sent; the machine cannot read them |
| `child-link.json`, `child-paused` | the link's state, and present while the child is paused (`tenant child pause`); `tenant child status` reads both |
| `child-update.json` | how the last update over the link went (`tenant child status` shows it) |

Beside it, a folder of the same name ending in `-data` (`<config>/child-data`) holds the child's `proc/` (background commands) and `screenshots/`. See [Machines](/tenant/docs/fleet/machines).

## Retention

Each class of data has its own retention: `tenant privacy` shows it and `tenant privacy retention set <class> <days|forever>` changes it. Logs are kept 30 days by default (`logs.retention_days`), run records 90 days (`runs.max_age_days`), route decisions 90 days (`route.log_retention_days`). See [Privacy &amp; retention](/tenant/docs/setup/privacy).
