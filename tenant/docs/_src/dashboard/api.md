---
title: REST API
description: "The JSON API behind the dashboard, for scripts and monitors: status, tools, posture, approvals, memory, the log book, and the event stream. Bearer-token authenticated."
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

Every request needs the dashboard key as a bearer token, except `GET /healthz`:

```bash
TOKEN=$(cat ~/Library/Application\ Support/tenant/dashboard-auth-token)
curl -s http://127.0.0.1:8770/api/status -H "Authorization: Bearer $TOKEN"
```

The browser never sends the token itself (it holds a session cookie); scripts use the `Authorization` header. No path takes the token from the URL. Requests have size and time limits, and a cross-site cookie is refused.

## Status and control

| Method | Path | Body / answer |
|---|---|---|
| `GET` | `/healthz` | `200` without a key; `HEAD` needs one |
| `GET` | `/api/status` | `{status, version, plugins, tools_enabled, tools_total, turn_active, turn_age_secs, turn_queue_depth, turn_queue_age_secs, turn_queue: [{position, source, age_secs, eta_secs}], pending_approvals, team_budget}` |
| `GET` | `/api/tools` | `[{name, plugin, enabled, destructive}]` (`destructive` is the plugin's gate class) |
| `POST` | `/api/tools/{name}` | `{"enabled": bool}` → `{changed, scope}` |
| `POST` | `/api/plugins/{label}` | `{"enabled": bool}` → `{changed, scope}`: a whole plugin |
| `GET` | `/api/posture` | `{allow_send}`: true when every gated tool is on |
| `POST` | `/api/posture` | `{"allow_send": bool}` → `{allow_send, changed, skipped}`: flips every gated tool, best effort |
| `GET` | `/api/approvals` | `[{id, category, action, detail, age_secs}]` |
| `POST` | `/api/approvals/{id}` | `{"decision": "approve" \| "approve_session" \| "approve_always" \| "deny"}` |

`tenant service status`, `tenant doctor` and `tenant update` read `/api/status` for the running version and liveness.

## Chat and streams

| Method | Path | What |
|---|---|---|
| `POST` | `/chat/send`, `/chat/interject`, `/chat/stop` | the Chat page's form posts (CSRF-protected; use the page) |
| `GET` | `/events` | the dashboard's server-sent event stream (page updates) |
| `GET` | `/ws` | the dashboard's live socket |
| `GET` | `/research/live` | a research run's live feed |

## Memory

| Method | Path | What |
|---|---|---|
| `GET` | `/api/memory/facts?limit=` | `{facts, next_cursor}` |
| `GET` | `/api/memory/facts/{id}`, `/{id}/provenance`, `/{id}/turns` | one fact, where it came from, the turns it came from |
| `GET` | `/api/memory/facts/temporal`, `/api/memory/facts/removed` | temporal view with stats; recently removed |
| `POST` | `/api/memory/facts/{id}/edit`, `/invalidate`, `/revalidate`, `/restore`, `/restore-version` | fact edits |
| `DELETE` | `/api/memory/facts/{id}` | remove (to Recently removed) |
| `POST` | `/api/memory/facts/resolve` | `{"keep_id", "discard_id"}`: merge two |
| `GET` `POST` | `/api/memory/soul` | the soul as Markdown (`{"markdown"}`) |
| `GET` | `/api/memory/userprofile`; `POST …/resync` | the learned user model |
| `GET` | `/api/memory/working/count` | `{count}` |

## The log book

| Method | Path | What |
|---|---|---|
| `GET` | `/api/events?q=&cursor=&limit=&reverse=&count=` | `{events, next, restarted, count}`: up to `limit` (100, at most 1000) matches after `cursor`, oldest first, or newest first with `reverse=1` |
| `GET` | `/api/events/{seq}` | `{event, spec, help, stats}` |
| `GET` | `/api/events/stream?q=` | server-sent events; resumes after `Last-Event-ID` with no missed row |
| `GET` | `/api/events/stats?q=&bucket=`, `/api/events/top?q=&n=` | counts by time, log and level; the most frequent ids |
| `GET` | `/api/events/timeline/{id}?depth=` | a trace's or activity's events across every log, with its run record |
| `GET` | `/api/events/export?q=&format=ndjson\|csv\|text` | every match after a header record |
| `POST` | `/api/events` | one event (JSON) or a batch (NDJSON): `{accepted}`; Tenant's own logs and providers are refused (403) |
| `GET` | `/api/logbook/logs[/{log}]` | `{logs: [{name, group, events, bytes, policy, last_write, …}]}` |
| `PATCH` | `/api/logbook/logs/{log}` | `{max_bytes, max_age_s, on_full, min_level, enabled, debug_for, reset}` |
| `POST` | `/api/logbook/logs/{log}/clear` | `{log, cleared}`; the Security log answers 403 |
| `GET` `POST` `DELETE` | `/api/logbook/views[/{name}]` | saved views: `{name, filter, builtin}` |
| `GET` | `/api/logbook/catalog[/{provider}][?id=N]` | the event reference |
| `GET` | `/api/logbook/components` | what the process runs: `{name, kind, log, state, since, started, error, activity}` |
| `GET` | `/api/logbook/verify[?log=security]`, `/api/logbook/audit?since=&until=` | the integrity check and chain; the audit bundle |
| `POST` | `/api/logbook/recover` | copy a quarantined store back |
| `GET` `POST` `PATCH` `DELETE` | `/api/logbook/alerts[/{name}]` | the alert rules |
| `GET` | `/api/activity?source=&level=&limit=` | the v1 activity feed from the store |
| `GET` `POST` | `/api/logs`, `/api/logs/{source}`, `/api/logs/{source}/{name}` | list sources, list or serve a source's text files; `POST` files a line (JSON or `text/plain`) |
| `POST` | `/api/addon/event` | an add-on's event, filed under its own name |

Sensitive values come back as `«sensitive»` unless the request adds `sensitive=1`, which is recorded in the Security log. Cursors are `<store id>.<seq>`; a restored store has a new id, and `restarted` says a cursor started over.

## Page forms

Every dashboard page posts plain forms (`/models/use`, `/cron/add`, `/safety/mode`, `/mcp/trust`, `/skills/trust`, …). They are CSRF-protected and meant for the browser; drive them through the page, or use the `/api/` routes above from a script.
