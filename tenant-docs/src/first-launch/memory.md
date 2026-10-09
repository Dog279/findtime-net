---
title: Memory &amp; soul
description: Tenant's layered memory, the soul that defines who the agent is, and the commands that inspect, search, edit, distill and compact it.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

Memory is what makes Tenant yours: it learns from interaction instead of starting from zero every launch. It is layered, each tier with its own store and its own rules, and every tier lives in the [data dir](/tenant/docs/setup/directories).

## The tiers

| Tier | What | Where | Who writes it |
|---|---|---|---|
| T0 Soul | identity, persona and operating rules, applied on every turn | `<config>/soul/<agent>.toml` | you (operator-only: the agent cannot rewrite who it is) |
| T1 Working | the current conversation | process memory, mirrored to T5 | the turn |
| T2 Episodic | past turns, searchable by vector and keyword | `episodes.db` | every turn |
| T3 Semantic | distilled facts, with importance, supersession and decay | `facts.db` | the distillation job, `tenant memory import` |
| T4 Skills | reusable recipes the agent retrieves into its prompt | `skills.db` | you, the agent, induction, imports; see [Skills](/tenant/docs/first-launch/skills) |
| T5 Archive | every message as it was written, append-only | `archive/YYYY-MM/<session>.jsonl` | every turn, write-through |

Recall needs an embedder (the [requirements](/tenant/docs/setup/requirements)). Without one the agent still runs, but T2 and T3 retrieval falls back to a hash stand-in and it is effectively amnesiac. `tenant doctor` says so.

## The soul

Tenant ships with a pre-wired soul from the creator: a default **Main** persona plus the five built-in specialists. It contains no personal data and works out of the box, so you do not need to touch it to start.

```text
/memory soul                      view the soul (T0)
/memory soul import <path>        replace it from a .md file or a folder (IDENTITY.md, SOUL.md, RULES.md)
/memory rules                     view the operating rules
/memory rules import <path>       set the rules (the same as soul import)
```

Write it as first- or second-person operating instructions: who the agent is, how it should work, what it must and must not do. The built-in specialists are merged underneath, so a custom soul does not drop them. The conductor persona is in the Tenant repository under `cmd/tenant/builtinsouls/agents/Main`:

```text
/memory soul import cmd/tenant/builtinsouls/agents/Main
```

The self-improvement loop can **propose** soul changes (`improve.soul_nudge_every`, off by default). Proposals land in `<config>/soul/proposed/` and wait for your review; nothing is applied on its own. The dashboard's **Memory** page shows and edits the soul too.

## Inspecting and searching

```text
/memory                     stats: episodes, facts, skills, soul
/memory search <q>          hybrid search over facts and episodes
/memory facts [q]           list distilled facts (T3)
/memory recent [n]          recent episodes (T2)
/memory profile [refresh]   view or rebuild the learned user model
/memory forget fact:<id>    hide a fact from recall (tenant privacy forget deletes for good)
/memory forget ep:<id>      hide an episode
```

```bash
tenant memory search "<query>"
tenant memory import notes.md [--protected] [--importance N] [--dry-run]   # your notes become facts
tenant memory reembed                                                       # recompute every vector with the current embedder
tenant doctor --context-debug "what do I prefer"                            # trace what a query would retrieve
```

`--protected` marks imported facts merge-protected (use it for feedback and corrections). The dashboard's **Memory** page is a fact inspector: provenance (which turns a fact came from), temporal history, edit, invalidate, restore, and a **Recently removed** list.

## Distillation and consolidation

The self-improvement scheduler turns episodes into facts in the background (`--distill-every`, 10 minutes by default) and re-synthesizes the user profile (`--profile-every`, 15 minutes). On demand:

```text
/memory distill             run a distillation pass now
```

```bash
tenant distill                                             # one episodic → semantic pass
tenant consolidate [--dry-run] [--threshold T] [--holistic] # merge near-duplicate facts; --holistic groups by meaning in one LLM pass
```

`improve.profile` in `config.json` pins the distillation and consolidation summarizers to a helper profile (a stronger model) instead of the main model. It never touches the embedder.

## Feedback

```text
/ack      mark the last turn as good: the self-improvement success signal
/undo     mark it as bad; suspends trusted auto-accept of induced skills
```

`tenant ack` and `tenant undo` do the same from a shell. The feedback drives `improve.auto_accept: "trusted"` (see [Skills](/tenant/docs/first-launch/skills)).

## Context compaction

When a conversation outgrows the model's context, Tenant compacts it from the **archive**: old turns are summarized, the summary is reversible and auditable (not a lossy fold), and a persistent goal header resists drift.

```text
/compress    (also /compact)   summarize old turns to free context now
/expand                         bring the latest compacted span back from the archive
```

## Privacy

`tenant privacy forget` deletes facts, episodes, sessions or any text for good, with a preview first; `tenant privacy retention set episodes 365` ages data out on its own. See [Privacy &amp; retention](/tenant/docs/setup/privacy). `tenant backup` carries every tier.
