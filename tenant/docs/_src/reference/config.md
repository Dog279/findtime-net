---
title: config.json
description: Every key of the machine-wide launch configuration, grouped by what it controls, with its default and the command or page that changes it.
area: Reference
area-url: /tenant/docs/reference/config
---

`<config>/config.json` is written by `tenant setup` and read by every command; explicit flags win over it. Its shape is a documented operator interface: a field is added, never renamed, and a file from an older version loads and migrates forward. Secrets never live here (see `credentials.json` on [Files &amp; directories](/tenant/docs/setup/directories)).

Edits by hand need a restart, except where a page says the hub re-reads them live. Slash commands and the dashboard write the file for you.

## Top level

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `schema_version` | 2 | the layout version | Tenant |
| `instance_id` | minted once | this installation's identity, exchanged at peer pairing | Tenant |
| `provider` | | the active generation provider: a key into `providers` | `/model use`, `tenant model use`, **Model** page |
| `providers` | | the configured providers ([shape](/tenant/docs/models/providers)) | `tenant setup`, `/model add*`, `/setup`, **Model** |
| `embed` | Ollama `nomic-embed-text`, 768 | the embeddings provider | `tenant setup`, `/setup` |
| `fallbacks` | none | ordered provider names to try on a 429, exhausted credits or an unreachable endpoint | `/model fallback` |
| `health_gating` | off | latency gating of the fallback chain: `slow_threshold_ms`, `min_samples` (5), `alpha` (0.3), `cooldown_ms` (30000) | by hand |
| `plan_loop_ceiling` | 16 | planner↔tool iterations per turn, per agent | `/ceiling`, **Model** page |
| `repeat_guard` | 8 | identical rounds of the same tool calls with the same results that end a turn early; `0` or absent is the default, a negative value turns the guard off | `/ceiling repeat`, **Model** page |
| `per_turn_tool_ranking` | false | re-rank the surfaced tools every turn instead of keeping a sticky, append-only set per session; the sticky set keeps a self-hosted server's prefix cache warm | by hand |
| `lazy_tools` | false | send only the ranked working set of tools plus a `load_tool` meta-tool | by hand |
| `browser_no_sandbox` | false | run Chrome without its process sandbox; accepted only inside a Linux container or user namespace | by hand |
| `update_check` | true | serve's daily look for a newer release (one log line, nothing applied) | by hand |
| `mcp_remotes` | | remote MCP server URLs to reconnect at launch | `/mcp add`, `/mcp remove`, **Remote services** |
| `mcp_trust` | | trust per connector URL, or `stdio:<name>` for a local server: `ask`, `allow`, `deny` | `/mcp trust`, **Remote services** |
| `mcp_servers` | | local MCP servers Tenant starts ([fields](/tenant/docs/mcp/local)) | by hand |
| `skills` | | per-integration `enabled` and non-secret `settings`, keyed by id | `/configure`, `tenant setup`, **Integrations** |
| `agents` | | helper profiles: `provider`, `model`, `soul`, `description` ([Helpers](/tenant/docs/models/helpers)) | `/agents`, `tenant agents`, **Helpers** |
| `budgets` | [defaults](/tenant/docs/models/tuning) | the resource envelope of a team run | by hand |
| `privacy.retention_days` | forever (`relay_inbox` 30) | days to keep each data class | `tenant privacy retention set` |
| `runs` | 90 days, 10000 records | durable turn records: `max_age_days`, `max_count` (negative disables pruning), `redact_tool_bodies` | by hand |

## `dashboard`

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `enabled` | on when absent | `false` keeps the panel off in the terminal UI (serve always has it) | `/dashboard on\|off` |
| `addr` | `127.0.0.1:8770` | the listen address; non-loopback needs TLS and a key | `--dashboard-addr` |
| `tls_cert`, `tls_key` | | serve HTTPS | by hand |
| `auth` | the generated token file | your own sign-in key (32+ characters) | by hand |
| `allowed_hosts` | | extra `Host` names a reverse proxy sends; loopback names and the Tailscale name are trusted on their own | by hand |

## `tailscale`

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `serve` | false | re-assert `tailscale serve` for the dashboard at every launch | `/tailscale serve`, `/tailscale serve off` |

## `gateway`

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `mode` | `local` | how `tenant mcp-memory` is exposed: `local` (stdio) or `sse` | `tenant setup --gateway ADDR` / `--local` |
| `sse_addr` | | the HTTP + SSE address when `mode` is `sse` | same |

## `turn_scheduler`

| Key | Default | Meaning |
|---|---|---|
| `queue_depth` | built-in | the bound on unique waiting requests to the shared agent (the active turn is separate) |
| `source_quotas` | `tui` 16, `dashboard` 16, `relay` 8, `peer` 8, `cron` 4, `research` 4 | queued requests per source |

## `relay` (Discord)

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `enabled` | false | start the relay at launch | `/relay on\|off`, **Access** |
| `operator_id` | | the one Discord user whose DMs drive the agent | `/relay allow`, **Access** |
| `allow_exec` | false | unlock `exec`, `write`, `destructive`, `sandbox`, `send` offsite | `/relay exec on\|off`, **Access** |
| `permissions` | all `ask` | per-category modes for Discord turns | `/relay permissions set`, **Access** |
| `known_categories` | | which categories you have chosen for | Tenant |
| `approval_timeout` | `10m` | how long a card waits (30 s to 24 h) | `/relay timeout` |
| `card_style` | `v2` | `v2` or `legacy` | by hand |

## `imessage`

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `enabled` | false | start the responder at launch | `/imessage on\|off`, **Access** |
| `passive` | false | observe every text, answer none | `/imessage passive\|respond`, **Access** |
| `allow_from` | nobody | handles that may drive the agent | `/imessage allow\|deny\|clear`, **Access** |
| `operator` | | the handle whose `Y <nonce>` approves | by hand |
| `permissions` | all `deny` | per-category modes for iMessage turns | `/imessage permissions set`, **Access** |
| `known_categories` | | which categories you have chosen for | Tenant |

## `cron`

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `jobs` | | `{id, name, spec, prompt, enabled, kind, exec, tz}` each ([Scheduled jobs](/tenant/docs/dashboard/cron)) | `/cron`, the `cron_*` tools, **Scheduled jobs** |
| `timezone` | local | the default IANA zone | by hand |
| `allow_exec` | false | the kill-switch for shell and exec jobs | `/cron exec on\|off`, **Scheduled jobs** |
| `catchup` | false | fire a missed safe job once at start-up | by hand |
| `per_run_minutes` | 15 | the wall-clock cap of one run | by hand |

## `route` (the prompt router)

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `enabled` | false | run the classifier | `/route on\|off`, `/route configure` |
| `mode` | `shadow` | `shadow`, `active`, `everywhere` | `/route shadow\|…` |
| `assist` | false | show decisions in the feed (shadow only) | `/route assisted` |
| `big_role` | | the provider name that serves "big"; required in active modes | `/route configure` |
| `provider.endpoint`, `provider.model` | the embed endpoint; the Supra router model | the local classifier | `/route configure` |
| `timeout_ms` | 250 | the classifier's budget | by hand |
| `never_cloud` | true | never route to a cloud provider the policy did not name | by hand |
| `min_complexity_for_big` | 4 | the complexity (1 to 5) at which a prompt goes big | by hand |
| `sticky_session` | true | a session that went big stays big | by hand |
| `force_profile` | | pin one profile for every prompt | `/route force` |
| `rules` | | ordered `{when: {domain, complexity_gte, math, code}, role}` | by hand |
| `agents` | | per-agent `{mode, never_cloud}` | by hand |
| `log_retention_days` | 90 | `route-decisions.jsonl` retention (negative: never; max 3650) | by hand |

## `improve` (self-improvement)

| Key | Default | Meaning | Changed by |
|---|---|---|---|
| `auto_accept` | `off` | induced skills: `off`, `on`, `trusted` | `/skills auto`, **Skills** |
| `trust_min_acks`, `trust_window` | 5, 20 | the `trusted` gate: acks needed among the last N fed-back episodes | by hand |
| `eval_every` | off | the nightly eval cadence (`24h`) | `/eval every` |
| `eval_at` | | a daily wall-clock time (`03:15`); wins over `eval_every` | `/eval at` |
| `profile` | | a helper name to run the proposer and summarizers on | by hand |
| `soul_nudge_every` | off | cadence of soul proposals (queued for your review) | by hand |
| `reflect_every` | off | cadence of the per-project reflection doc | by hand |
| `judge`, `judge_kind`, `judge_endpoint`, `judge_key_env` | the main model | a separate eval judge | `/judge set`, **Quality** |

## `goal`

| Key | Default | Meaning |
|---|---|---|
| `loop_ceiling` | 0 (inherit) | the per-turn ceiling while a `/goal` loop runs; `-1` lifts it |

## `peer` (federation)

| Key | Default | Meaning |
|---|---|---|
| `listen` | off | the listener address; `/peer serve` defaults to `0.0.0.0:9100` with TLS |
| `transport` | | `overlay` permits plain HTTP on a non-loopback bind (you run Tailscale or WireGuard) |

## `logs`

See [Logs &amp; alerts](/tenant/docs/dashboard/logs) for `dir`, `retention_days`, `level`, `max_field_bytes`, `budget_mb`, `diagnostic`, `security`, `per_log`, `rate_limit` and `alerts`.

## A complete example

```json
{
  "schema_version": 2,
  "provider": "zai",
  "providers": {
    "zai": { "kind": "zai", "endpoint": "https://api.z.ai/api/coding/paas/v4", "model": "glm-4.6", "tool_format": "openai", "auth": { "mode": "apikey", "stored": true } },
    "local": { "kind": "ollama", "endpoint": "http://localhost:11434", "model": "qwen2.5:14b", "tool_format": "openai" }
  },
  "embed": { "kind": "ollama", "endpoint": "http://localhost:11434", "model": "nomic-embed-text", "embed_dim": 768 },
  "fallbacks": ["local"],
  "plan_loop_ceiling": 24,
  "dashboard": { "addr": "127.0.0.1:8770" },
  "tailscale": { "serve": true },
  "relay": { "enabled": true, "operator_id": "123456789012345678", "approval_timeout": "10m" },
  "imessage": { "enabled": false, "allow_from": [] },
  "cron": { "timezone": "America/Los_Angeles", "jobs": [ { "id": "brief", "spec": "0 7 * * 1-5", "prompt": "Brief me on today.", "enabled": true } ] },
  "skills": { "discord": { "enabled": true, "settings": { "operator_id": "123456789012345678" } } },
  "agents": { "Researcher": { "provider": "zai", "description": "research on the coding plan" } },
  "improve": { "auto_accept": "trusted", "eval_at": "03:15" },
  "privacy": { "retention_days": { "screenshots": 14 } },
  "logs": { "retention_days": 30 }
}
```
