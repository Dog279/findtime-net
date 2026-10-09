---
title: Privacy &amp; retention
description: See every class of data Tenant keeps and for how long, set retention per class, forget specific things with a preview, and export everything.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

Tenant keeps everything on your machine, in the [data dir](/tenant/docs/setup/directories). This repository-free design is the whole privacy model: no account, no telemetry, and no key, memory or wiki content ever leaves the machine except through a tool you turned on.

## Commands

```bash
tenant privacy [status]                       # every class: what it is, how long it is kept, how to remove it
tenant privacy retention set <class> <days|forever>
tenant privacy prune [--yes]                  # remove everything past its retention now
tenant privacy forget [selectors] [--yes]     # remove specific data, with a preview first
tenant privacy sessions [--limit N]           # recent sessions, to find an id to forget
tenant privacy export --out DIR [--no-archive] [--only-agent ID]
```

### Selectors for `forget`

| Selector | Removes |
|---|---|
| `--session ID` | one conversation session: its episodes, facts distilled from it, and its archive events |
| `--episode N` | one episode |
| `--fact N` | one fact |
| `--skill NAME` | one skill, with its history |
| `--match "text"` | the text wherever it appears (rows, search index and archive events; ASCII letters match in any case) |
| `--before YYYY-MM-DD` | everything recorded before that day (or an RFC 3339 time) |
| `--archive-month YYYY-MM` | one month of the archive |
| `--connector NAME` | a connected service's stored credentials and token cache |
| `--only-agent ID` | limit any of the above to one agent's data |

`forget` always shows what it would delete and asks, unless `--yes`. It deletes for real: rows, the search index and the archive events. (`/memory forget fact:<id>` in the terminal UI only hides a fact from recall.)

## Retention classes

| Class | Data | Default |
|---|---|---|
| `episodes` | conversation turns (`episodes.db`) | forever |
| `facts` | distilled facts not confirmed within the period (`facts.db`) | forever |
| `archive` | raw session events (`archive/`) | forever |
| `usage` | the token usage ledger (`usage.db`) | forever |
| `research` | research runs and reports (`research/`) | forever |
| `screenshots` | browser screenshots (`screenshots/`) | forever |
| `relay_inbox` | files received over the Discord relay (`relay-inbox/`) | 30 days (`-1` keeps forever) |
| `eval_artifacts` | eval reports (`eval-artifacts/`) | forever |

Three more classes have their settings elsewhere in `config.json`: run records (`runs.max_age_days`, 90), the route log (`route.log_retention_days`, 90) and the log book (`logs.retention_days`, 30).

`retention set` writes `privacy.retention_days` in `config.json`:

```json
"privacy": { "retention_days": { "episodes": 365, "screenshots": 14, "relay_inbox": -1 } }
```

The background hub applies retention on its own; `tenant privacy prune` applies it now.

## Export

`tenant privacy export --out DIR` writes a directory that must not exist yet (or be empty): `episodes.jsonl`, facts, skills, the soul, research reports and, unless `--no-archive`, the raw session events. Everything is readable without Tenant.
