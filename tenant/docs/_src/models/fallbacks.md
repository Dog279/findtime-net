---
title: Fallbacks &amp; health
description: An ordered list of providers to try when the active one rate-limits, runs out of credits or stops answering, and latency gating that skips a provider that is up but slow.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

## Fallbacks

`fallbacks` is an ordered list of provider names to try when the active provider fails with a rate limit (`429`), an exhausted balance, or an unreachable endpoint. Empty (the default) means no automatic fallback: the turn fails and Tenant degrades to echo until the endpoint answers.

```json
"provider": "zai",
"fallbacks": ["qwen-gpu", "anthropic"]
```

```text
/model fallback qwen-gpu anthropic     set the chain, live
/model fallback off                    clear it
```

With that chain a GLM `429` transparently routes **that call** to the self-hosted Qwen; the preferred provider is retried first once its cooldown lapses. The fallback is per call, so a single bad minute does not pin you to the backup model. The feed and the `model` log say which provider served each call.

## Health gating

A provider that keeps answering, but slowly, is never a `429`. Health gating times every call (from the request to the end of the answer) and skips a provider whose average has gone slow for a cooldown, so the next provider in `fallbacks` serves. Off unless `slow_threshold_ms` is set.

```json
"health_gating": {
  "slow_threshold_ms": 45000,
  "min_samples": 5,
  "alpha": 0.3,
  "cooldown_ms": 30000
}
```

| Key | Default | Meaning |
|---|---|---|
| `slow_threshold_ms` | 0 (off) | the average call time that marks a provider slow; set it above the normal time of a long reply |
| `min_samples` | 5 | successful calls before the average can trip |
| `alpha` | 0.3 | weight of the newest call in the moving average, in (0, 1] |
| `cooldown_ms` | 30000 | how long a slow provider is skipped |

`tenant doctor` (**fallback health gating**) reports whether gating is on, what it is skipping, and whether there is a chain for it to move to. `tenant route stats` and `/route stats` include breaker trips when routing is on.

## What counts as a failure

| Provider answer | Tenant |
|---|---|
| `429` rate limit | falls back for this call; retries the preferred provider after its cooldown |
| `429 Insufficient balance` (Z.ai metered) | reports out of credits; falls back |
| connection refused, timeout, DNS | falls back; without a chain, degrades to echo and the reconnect monitor keeps probing |
| a transient mid-stream drop (HTTP/2 `GOAWAY`) | retried once on the same provider |
| a model error (bad request, context overflow) | reported to the agent, not a fallback |

Degraded mode suspends every autonomous job (cron, self-improvement, relay turns) until a provider answers again.
