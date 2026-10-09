---
title: Reasoning, ceiling &amp; turns
description: The loop ceiling, the reasoning-effort hint for providers that take one, team budgets, and how serve admits turns from several sources at once.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

## The loop ceiling

Each turn is a planner↔tool loop: the model plans, calls tools, reads results, plans again. The **ceiling** caps how many iterations it gets before it is forced to synthesize an answer (the turn is then marked truncated).

```text
/ceiling          show the current ceiling
/ceiling 30       raise it, live (also /loops, /loop-ceiling)
```

| Setting | Default | Scope |
|---|---|---|
| `plan_loop_ceiling` in `config.json` | 16 | every normal turn, per agent |
| `--plan-loop-ceiling N` | | this launch |
| `plan_loop_ceiling` in a model profile | | that model |
| `goal.loop_ceiling` in `config.json` | 0 (inherit) | turns of an active `/goal` loop only; `-1` lifts the per-turn cap so a long autonomous run is bounded only by the goal's turn cap, errors and <kbd>Esc</kbd> |

Start around 20 to 30 for agentic work. Lower it if turns feel runaway; raise it if the agent stops before finishing long tasks. Each helper has its own budget.

## The repeat guard

A separate guard ends a turn early when the agent makes the same tool calls and gets the same results back several rounds in a row (as the model sees them, after the context cap). A poll whose output changes never trips it, so waiting on a job runs until the loop ceiling. When it fires, the feed says "stuck repeating the same tool calls" (event `turns/2004`), not "loop ceiling hit", and the turn is forced to synthesize an answer.

```text
/ceiling repeat           show it
/ceiling repeat 12        allow longer identical wait loops, live
/ceiling repeat off       only the loop ceiling ends a turn (0 works too)
/ceiling repeat default   back to 8
```

| Setting | Default | Meaning |
|---|---|---|
| `repeat_guard` in `config.json` | 8 (`0` or absent) | identical rounds before a forced answer; a negative value turns the guard off |

The dashboard's **Model** page has the same setting.

## Reasoning effort

Two provider kinds accept an effort hint, and `/reasoning` is gated to them so a provider that would reject the field never receives it.

```text
/reasoning              arrow-key picker (also /effort)
/reasoning xhigh        set it live; persists as the provider's "reasoning"
/reasoning off          clear it
```

| Kind | Levels |
|---|---|
| `sakana` (Fugu) | `high`, `xhigh` (`max` is accepted as an alias of `xhigh`) |
| `claudecode` | `low`, `medium`, `high`, `xhigh`, `max` (the CLI's own `--effort` ladder) |

## Thinking vs tool time

The terminal UI's timer shows which phase a turn is in (`thinking… 45.0s`, `tools… 3.1s`), each model call ends with `thought for 8.2s`, and the turn's end line splits the total (`turn 4:12 — thinking 3:40 · tools 32.0s`). The same split is on the dashboard's Chat, on the turn's end event, in `runs.db` (`think_ms`, `tools_ms`) and in `tenant logs trace`. A slow model and a hung one no longer look the same.

## Team budgets

A multi-agent run (`tenant orchestrate`, deep research) has a structural envelope. Omitted keys take the defaults:

```json
"budgets": {
  "max_concurrent_subagents": 4,
  "max_agents_per_run": 16,
  "max_tool_calls_per_turn": 64,
  "max_tool_calls_per_run": 256,
  "max_tokens_per_run": 500000,
  "max_cost_usd": 25,
  "max_wall_time": "30m",
  "max_browser_instances": 4,
  "bus_history_cap": 1000,
  "input_cost_per_million_usd": 15,
  "output_cost_per_million_usd": 75
}
```

The cost rates are conservative hosted-model estimates used to compute `max_cost_usd`; set your own for a local or differently priced endpoint. `GET /api/status` reports the live `team_budget` during a run.

## Turn admission in serve mode

The hub runs **one turn at a time** across every source (dashboard chat, Discord, iMessage, cron, peers, research), so unattended traffic can never race the working set. Waiting requests queue; `turn_scheduler` bounds the queue:

```json
"turn_scheduler": { "queue_depth": 32, "source_quotas": { "relay": 4, "cron": 2 } }
```

| Source | Default quota |
|---|---|
| `tui`, `dashboard` | 16 |
| `relay`, `peer` | 8 |
| `cron`, `research` | 4 |

`GET /api/status` reports `turn_active`, `turn_age_secs`, `turn_queue_depth` and the queue with each entry's source and ETA. A second dashboard message sent while one is being answered is refused and stays in the box; scheduled jobs and relay turns queue behind the active turn and never hold up Chat.
