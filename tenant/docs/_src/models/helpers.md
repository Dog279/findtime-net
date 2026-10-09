---
title: Helpers
description: The specialists your agent hands work to. Five ship in the binary; add your own with a pinned model and identity, from the terminal UI, the shell or the dashboard.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

A **helper** (a sub-agent profile) is a named recipe the orchestrator can spawn: a provider and model, an identity (soul), and a description that tells the orchestrator what it is for. When the main agent delegates (`spawn_agent(role="Researcher", task=…)`), the runtime looks the name up and builds the helper on that profile. The dashboard calls them **Helpers**; the terminal UI and the shell say **agents**.

## The built-in five

They ship in the binary, inherit your primary model, and need no setup: point Tenant at a model and you have a team.

| Helper | What it does |
|---|---|
| **Programmer** | implements features and fixes: smallest diff, root cause only, regression test, clean build before done |
| **Researcher** | deep multi-source research: pulls the primary source, adversarially verifies every claim, cites everything |
| **Writer** | docs, READMEs, commit, PR and ticket prose, summaries: direct voice, accuracy over polish, never overclaims |
| **QA** | adversarial verifier: tries to break the work, verifies against reality with file:line evidence, hunts edge cases |
| **Strategist** | founder-mode scoping and neutral judge: challenges the premise, finds the narrowest high-value wedge, decides what not to build |

Their identity files live in the Tenant repository under `cmd/tenant/builtinsouls/agents/<Name>/` (`IDENTITY.md`, `SOUL.md`, `RULES.md`), with a sixth, **Main**, the conductor persona meant for your primary agent's soul (`/memory soul import cmd/tenant/builtinsouls/agents/Main`). Built-ins are read-only; a profile you add **with the same name overrides** the built-in, which is how you pin a specialist to a bigger model.

```bash
tenant orchestrate "add rate limiting to the API and prove it works"
```

## Your own helpers

```text
/agents                                         list profiles (built-in and yours)
/agents add <name> <provider> [model] [-- desc]  register one; provider is a name from /model
/agents model <name> <provider> [model]         swap its model, live; the soul is kept
/agents rename <old> <new>
/agents soul <name> <markdown>                  set its identity (empty clears)
/agents show <name>                             full identity and model
/agents remove <name>
```

```bash
tenant agents list | show <name>
tenant agents add <name> <provider> [model]
tenant agents model | rename | soul | remove …
```

In `config.json`:

```json
"agents": {
  "Researcher": { "provider": "zai", "model": "glm-4.6", "description": "deep research on the coding plan" },
  "synthesizer": { "provider": "gpu", "model": "aeon-ultimate", "soul": "You write the final report. Cite everything.",
                   "description": "turns researchers' notes into the cited report" }
}
```

| Field | Meaning |
|---|---|
| `provider` | a name from `providers`; empty means inherit the primary (what the built-ins do) |
| `model` | override that provider's default model |
| `soul` | identity and persona as Markdown; blank stamps the role label onto the base soul |
| `description` | shown in listings and injected into the orchestrator's prompt, so it knows what each helper is for |

The main agent sees helpers added, renamed or removed while it runs; no restart. `tenant doctor` (**agent profiles**) checks that every helper's provider exists, its model resolves and its key is available.

## On the dashboard

**Helpers** lists each one with its model and instructions; a helper on a hosted model says "Sends its work to <provider>". Add, change the model, set instructions, **Reset** a built-in you overrode, **Remove** and **Clear instructions** (the last three confirm first).

## Where else helpers are used

- `improve.profile` pins the self-improvement proposer (soul nudges, fact consolidation, distillation summaries) to a helper, typically a stronger reasoning model than the daily driver. It never touches the embedder or the eval model-under-test.
- Deep research spawns researchers per sub-question; a `Researcher` profile you define is what they run on. See [Teams, research &amp; goals](/tenant/docs/models/teams).
- Each helper gets its own loop ceiling and shares the team [budgets](/tenant/docs/models/tuning).
