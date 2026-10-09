---
title: Quality evals
description: The eval harness scores the agent on fixed tasks, a nightly run gates regressions against a baseline, and an optional separate judge model grades the answers.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

```bash
tenant eval --subset smoke|fitness|full [--json] [--quiet] [--list]
tenant eval --gate-only --baseline-check FILE      # compare against a baseline, no new run
tenant eval --compaction                           # score the context compactor's fidelity instead (ignores --subset)
tenant eval --judge-model <model>                  # a different grader for this run
tenant eval --baseline-from eval-2026-10-01.json   # build the regression baseline from an existing artifact
tenant eval --append-trend                         # file the run under <data>/eval-artifacts and append to trend.jsonl
tenant eval --baseline-diff                        # the per-task movers vs the baseline, offline
```

Artifacts live under `<data>/eval-artifacts/`: one `eval-*.json` per run, `baseline.<subset>.json`, and `trend.jsonl`. A manual `--append-trend` run advances the nightly clock, so a morning run stands the night's down.

## The nightly gate

```text
/eval                       the schedule and the last recorded run
/eval every 24h             an interval; one run per period, relaunch-proof (seeded from trend.jsonl)
/eval at 03:15              a daily wall-clock time (local); wins over `every`; a box asleep at the anchor catches up on wake
/eval off
/eval now                   queue one run on the improve scheduler (fires within a minute)
/eval trend [n]             recent scores and regression verdicts
/eval diff                  per-task movers vs the baseline: what improved, what declined and why
```

```json
"improve": { "eval_every": "24h", "eval_at": "03:15" }
```

`--eval-every 24h` on `tenant serve` or `tenant tui` does the same for one launch (it needs `--self-improve`, the default). The run is heavy (the full live eval), so schedule it for a quiet hour. The dashboard's **Quality** page shows the scores over time and runs a check (a few minutes).

## A separate judge

By default the main model grades its own answers. A separate judge grades both `tenant eval` and the nightly run:

```text
/judge set <kind> <model>     e.g. /judge set anthropic claude-sonnet-4-20250514
/judge status
/judge clear
```

```json
"improve": { "judge": "claude-sonnet-4-20250514", "judge_kind": "anthropic", "judge_endpoint": "", "judge_key_env": "ANTHROPIC_API_KEY" }
```

The key is read from the environment variable at run time and never stored. `--judge-model` on `tenant eval` overrides it for one run. The dashboard's **Quality** page has the same setting.

## What the self-improvement loop never does

The eval's model-under-test is always the daily model, and a candidate soul change is always graded on it: `improve.profile` can pin the proposer to a stronger model, never the scorer. Soul proposals wait for your review in `<config>/soul/proposed/`.
