---
title: Logs &amp; alerts
description: Every subsystem writes to one log book. Read it on the dashboard, in the terminal UI or from a shell with one filter language; set retention per log; turn a filter into an alert that messages you.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

The log book is `<data>/logs/`: one folder per source (`turns`, `subagents`, `approvals`, `discord`, `cron`, `model`, `route`, `sandbox`, `security`, `system`, one per MCP connector, …), plain-text daily files inside, and `logbook.db`, the store every viewer reads. A source is self-registering: a new subsystem, or your own script, joins by writing a line.

## Reading it

**Dashboard → Logs.** Newest first, with a **Find** box that takes the filter language, saved views (built-ins: Administrative Events, Security failures, This run, Since last start), a log and level picker, **○ live** to follow new events, and per event a detail page with its catalog help, how often it has happened, and a **Timeline** of the whole turn or operation it belongs to. **Reveal** shows a masked value and is recorded in the Security log.

**Terminal UI.**

```text
/logs [filter]            the newest 200 events the filter matches, e.g. /logs level>=warning since:24h
/logs follow [filter]     the same, then each new one as it is written
```

<kbd>Enter</kbd> opens an event, <kbd>c</kbd> its correlated timeline, <kbd>Esc</kbd> goes back.

**Shell.** `tenant logs` reads `logbook.db` directly when this account can open it, else through the running dashboard (`--url`, `--token`).

```bash
tenant logs                                             # the logs: events, size, limit, retention, last write
tenant logs query [FILTER] [--follow] [--limit N] [--reverse] [--format text|json|csv]
tenant logs show <seq>                                  # one event in full, with its help and stats
tenant logs trace <trace|activity>                      # a turn's timeline across every log, with its run record
tenant logs stats [FILTER] [--bucket 1h]                # counts by log and level over time; the most frequent event IDs
tenant logs export [FILTER] --out FILE [--include-sensitive] [--format ndjson|csv|text]
tenant logs export --audit --out FILE                   # the Security log's audit bundle, verifiable offline
tenant logs verify [security] [--bundle FILE]           # the integrity check; for security, its chain
tenant logs config <log> [--max-size 64MB] [--max-age 30d] [--on-full keep] [--min-level warning] [--reset]
tenant logs clear <log> [--export FILE]                 # never security
tenant logs debug <provider|log> --for 30m              # write a log's verbose events for a while (--for 0 stops)
tenant logs catalog [provider] [--id N]                 # the event reference
tenant logs components                                  # what is running now
tenant logs recover [FILE]                              # copy what can be read of a quarantined logbook.db.corrupt-<time>
tenant attach [URL] [--follow] [--source discord] [--level warn] [--trace ID]   # tail a running hub's feed
```

## The filter language

Terms are separated by spaces and must all hold; values in a list are alternatives; a leading `-` negates a term.

```text
level>=warning log:discord id:2001-2999 -id:2005 since:24h "reset"
provider:mcp.* level>=error                 every MCP server's errors
data.tool:os_exec "permission denied"
since:14:00 until:14:10                     a time slice across every log
boot:current level>=warning                 this run's problems
```

| Field | Values |
|---|---|
| `log`, `provider`, `task`, `opcode`, `tag`, `session`, `approval`, `tool_call`, `actor`, `surface` | a name, or a glob with `*` and `?` |
| `trace`, `activity`, `related`, `boot` | a whole id; `boot:current` is the run of the process reading the store |
| `id`, `pid` | numbers, ranges (`2001-2999`) and comparisons (`id>=3000`) |
| `level` | `critical` > `error` > `warning` > `info` > `verbose`; `level>=warning` is warning and up |
| `channel` | `operational` or `diagnostic` |
| `since`, `until` | a duration back from now (`15m`, `2h`, `7d`, `2w`), a local time (`14:03`, `today`, `yesterday`, `2026-09-27`) or RFC 3339; `until` is exclusive |
| `data.<key>` | a field of the event's data: text, a glob, or a number that also compares (`data.iter>=3`); a masked field never matches |

Operators are `:` `=` `!=` `>=` `<=` `>` `<`. A bare word or a `"quoted phrase"` searches the message text, case-insensitive. A word shaped like `name:` must be quoted.

## Writing to it

Any program on the machine can file a line, no rebuild:

```bash
tenant log deploy "rolled out v2.3" host=web1 ok=true [--level warn|error] [--file]
tenant log --list                                  # the sources
curl -X POST http://127.0.0.1:8770/api/logs/deploy -H "Authorization: Bearer $TOKEN" -d '{"msg":"rolled out v2.3"}'
```

Events from outside are filed under `ext.<name>` and marked `external`. A folder you drop under the log root is discovered within seconds and tailed live. A stdlib-only Go client any program can copy is in the Tenant repository under `reference/logging/`.

## Configuration

```json
"logs": {
  "dir": "", "retention_days": 30, "level": "info", "max_field_bytes": 4096, "budget_mb": 2048,
  "diagnostic": { "max_mb": 256, "max_age_days": 7 },
  "security":   { "max_mb": 256, "max_age_days": 365, "witness": "discord", "on_failure": "continue" },
  "per_log":    { "discord": { "max_mb": 32, "max_age_days": 14, "min_level": "info", "on_full": "overwrite" } },
  "rate_limit": { "per_second": 100, "burst": 500 },
  "alerts": []
}
```

| Key | Default | Meaning |
|---|---|---|
| `dir` | `<data>/logs` | the log root (also `--log-dir`) |
| `retention_days` | 30 | delete a source's files older than this (`-1` never); the max age of every operational log in the store too |
| `level` | `info` | the floor for the files and the feed: `debug`, `info`, `warn`, `error`; `TENANT_LOG=debug` lowers it for one launch |
| `max_field_bytes` | 4096 | cap on one value (a tool result, an argument blob) per line; `-1` unlimited |
| `budget_mb` | 2048 | cap on `logbook.db` and its WAL together; `-1` no cap |
| `diagnostic` | 256 MB, 7 days | limits for every log's diagnostic events together |
| `security` | 256 MB, 365 days | the Security log's limits; its oldest records are archived, never just deleted. `witness`: where the chain's head is also sent at each anchor (`""`, `discord`, or a file path, best on another machine). `on_failure`: `continue` (a gated action goes ahead when its audit record cannot be written, with a critical event and a banner) or `deny` |
| `per_log.<log>` | system 128 MB / 90 days; others 64 MB / `retention_days` | one log's `max_mb`, `max_age_days` (`-1` forever), `min_level`, `on_full` (`overwrite`, `archive`, `keep`); `tenant logs config` writes a log's own policy, which wins over this |
| `rate_limit` | 100/s, bursts of 500 | how fast one provider may write; the Security log is never limited |
| `alerts` | | alert rules, read live |

Secrets never reach the files: values are masked at the sink, `«sensitive»` in the API unless the request asks and is recorded.

## Alerts

An alert rule is a filter, an optional threshold, an action and a throttle. Built-in rules exist for `critical`, `unexpected-exit`, `audit-failures`, `sandbox-unattended` and `logbook-full`; an entry with the same name changes or disables the built-in.

```bash
tenant logs alerts [list]
tenant logs alerts add <rule> FILTER [--count N --window 10m] [--action discord|imessage|cron|investigate] [--target PROMPT] [--throttle 1h]
tenant logs alerts enable|disable|remove <rule>      # remove puts a built-in back to its defaults
```

```json
"alerts": [
  { "name": "mcp-down", "filter": "provider:mcp.* level>=error", "threshold": { "count": 3, "window": "10m" },
    "action": { "kind": "discord" }, "throttle": "1h" },
  { "name": "nightly-failed", "filter": "log:cron level>=error data.job:tests",
    "action": { "kind": "investigate", "target": "discord" } }
]
```

| Action `kind` | Does |
|---|---|
| `dashboard` (default) | files the alert; the dashboard shows it |
| `discord`, `imessage` | a message to the operator |
| `cron` | a one-off prompt job; `target` is its prompt |
| `investigate` | a read-only agent turn over the event, once you approve it; `target` (`""`, `discord` or `imessage`) is where the result also goes |

The threshold fires once `count` events match within `window`; without one, every match fires. `throttle` fires at most once per that long (default `15m`, at least `1m`).

## Event ids and records

Every catalogued event has an id (`sandbox/2002`, `security/4903`); `tenant logs catalog` is the reference and the dashboard links each event to its help. A turn's events share a `trace`, an operation's an `activity`, so `tenant logs trace <id>` reconstructs one across every log, together with its record in `runs.db` (`tenant runs export --out FILE` exports those as JSONL; `runs.max_age_days`, `runs.max_count` and `runs.redact_tool_bodies` tune them). A program Tenant starts finds the ids in `TENANT_TRACE_ID` and `TENANT_ACTIVITY_ID`.

The Security log is a hash chain: `tenant logs verify security` checks it against the key, the anchor and a file witness, and `tenant logs export --audit` produces a bundle that verifies offline. It can be neither cleared nor switched off.
