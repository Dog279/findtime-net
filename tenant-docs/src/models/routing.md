---
title: Prompt routing
description: A tiny local classifier decides, per prompt, whether a small local model or a big model should answer. Rollout stages, rules, per-agent policy, and every command.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

With a cheap local model and an expensive big one, routing sends each prompt to the right one. A small classifier (by default `hf.co/SupraLabs/Supra-Router-51M-gguf:Q4_K_M`, served by your local Ollama) scores every prompt for domain and complexity in a few milliseconds; the policy turns the score into a choice. Off by default, and local-only by construction: the classifier endpoint must be loopback or a provider kind marked local, so no prompt leaves the machine to be classified.

## Rollout stages

| Stage | `route.mode` / flags | What happens |
|---|---|---|
| off | `enabled: false` | nothing; the active provider answers everything |
| shadow | `enabled: true, mode: "shadow"` | the classifier runs and logs what it would have chosen; the active provider still answers. Read `/route stats` for a while. |
| assisted | shadow with `assist: true` | shadow, plus the decision is shown in the feed so you can judge it live |
| active | `mode: "active"` | the decision selects the model; needs `route.big_role` |
| everywhere | `mode: "everywhere"` | active for every surface, helpers included |

```text
/route                       status, plus a parseable classifier health probe
/route configure             arrow-key wizard: big cloud model → small local model → policy
/route on|off|shadow|assisted|everywhere
/route force <profileID>     force a named profile for every prompt (a privacy override; logged)
/route stats                 big/disagreement/failure rates, latency, breaker trips
/route why [n]               explain the nth most recent decision (default: the latest)
```

```bash
tenant route status | on | off | shadow | assisted | everywhere | stats
tenant route export-dataset [--out FILE]     # the decisions as a training set
```

## Configuration

```json
"route": {
  "enabled": true,
  "mode": "active",
  "big_role": "zai",
  "provider": { "endpoint": "http://localhost:11434", "model": "hf.co/SupraLabs/Supra-Router-51M-gguf:Q4_K_M" },
  "timeout_ms": 250,
  "never_cloud": true,
  "min_complexity_for_big": 4,
  "sticky_session": true,
  "rules": [
    { "when": { "code": true, "complexity_gte": 3 }, "role": "coder" },
    { "when": { "domain": "math" }, "role": "zai" }
  ],
  "agents": { "discord": { "mode": "shadow", "never_cloud": true } },
  "log_retention_days": 90
}
```

| Key | Default | Meaning |
|---|---|---|
| `enabled` | false | run the classifier at all |
| `mode` | `shadow` | `shadow`, `active` or `everywhere` |
| `assist` | false | show decisions in the feed; only valid in shadow |
| `big_role` | | the provider name that serves "big"; required in active modes, must be a configured, wired provider |
| `provider.endpoint`, `provider.model` | the embed provider's endpoint; the Supra model | the classifier; must be local |
| `timeout_ms` | 250 | the classifier's budget; past it the prompt goes to the default |
| `never_cloud` | true | never route a prompt to a cloud provider the policy did not explicitly name |
| `min_complexity_for_big` | 4 | the complexity score (1 to 5) at which a prompt goes big |
| `sticky_session` | true | once a session has gone big, keep it big |
| `force_profile` | | pin one profile for every prompt (what `/route force` writes) |
| `rules` | | ordered N-way rules; the first match selects a role; no match keeps the two-way small/big behaviour |
| `agents` | | per-agent overrides of `mode` (`shadow` or `active`) and `never_cloud` |
| `log_retention_days` | 90 | how long `route-decisions.jsonl` is kept (negative: never pruned, at most 3650) |

A rule's predicate is frozen at exactly four fields: `domain`, `complexity_gte`, `math`, `code`. An unknown key, or a predicate placed outside `when`, is a config error, never a silently widened rule. A rule's `role` is a provider name.

The classifier has a circuit breaker: after 3 failures it opens for 60 seconds and prompts go to the default model; `/route stats` counts the trips.

## What you see

Every decision is one feed line, `route: shadow · small · complexity 2 · general · 85ms via 10.0.0.5:11434 (Supra-Router-51M-gguf:Q4_K_M)`, and one event in the `route` log with the classifier's endpoint (host and port only), model and latency. A decision made when a helper is spawned shows as `route: spawn · …`. `/route why` explains the latest one.
