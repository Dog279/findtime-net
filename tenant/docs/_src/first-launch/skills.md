---
title: Skills
description: Reusable recipes in the open Agent Skills format. How Tenant saves, imports, exports, versions and trusts them, and why nothing untrusted reaches the agent.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

A **skill** is know-how: a recipe the agent retrieves into its operating rules when a task matches. Skills are one of Tenant's two extension boundaries (the other is [MCP](/tenant/docs/mcp/overview)): you extend what the agent knows with `SKILL.md` packages, not by changing Tenant.

Two commands look alike and are not: `/skills` (plural) is this library; `/skill` (singular) configures integrations such as Gmail or Discord ([Integrations](/tenant/docs/mcp/integrations)).

## Where skills come from

| Origin | How |
|---|---|
| operator | you wrote it: `/skills add <name> \| <desc> \| <recipe>` |
| agent | the agent saved it with its `skill_save` tool |
| induction | the self-improvement loop distilled it from turns you acked |
| seed | a starter bundle: `/skills seed gstack` |
| import | a `SKILL.md` package: `/skills import <dir\|SKILL.md>` |

## Trust

Only a skill that is **live, enabled and trusted** is offered to the agent, and for the main agent only when every tool it requires is enabled. Everything the agent saves, everything imported without `--trust`, and every edit that widens a skill's required tools starts **untrusted** and waits for you. A skill is injected into every later turn, and the agent may be writing what a web page, an email or a relayed message told it to; trust is the review step that closes that door.

```text
/skills                              list recipes, marking untrusted ones and who wrote them
/skills show <name>                  trust, origin, version, required tools, package provenance, the instructions
/skills trust <name>                 offer it to the agent
/skills untrust <name>
/skills enable|disable <name>
/skills accept <name>                accept an induced skill waiting for review
/skills forget <name>                delete it
/skills history <name>               every prior version, who changed it, trust decisions
/skills diff <name> [vN]             current vs a prior version (default: the most recent prior)
/skills revert <name> vN             restore a version (the current state is kept in history; trust travels with the version)
```

The same from a shell: `tenant skills list | show | trust | untrust | import | export | seed | auto`. The dashboard's **Skills** page has a **Waiting for your review** group with the instructions, a **Trust** button and **Stop trusting**.

## Packages (Agent Skills format)

Tenant reads and writes the open `SKILL.md` format: YAML frontmatter (`name`, `description`, `version`, `compatibility`, `metadata`, `allowed-tools`) and a Markdown body.

```text
/skills import <dir|SKILL.md> [--trust]   import; untrusted unless --trust
/skills export <name> <dir>               write <dir>/<name>/SKILL.md
```

```bash
tenant skills import ./my-skill --trust
tenant skills export deploy-checklist ./out
```

- The body becomes the recipe; `allowed-tools` names map to Tenant's tools (`Bash` is `os_exec`, `Read` is `os_read_file`, …) and decide where the skill is offered; a name Tenant does not know is reported and never available.
- Bundled `scripts/`, `references/` and `assets/` are listed, not installed. Nothing in Tenant runs a skill's code.
- The same package imported twice changes nothing; a changed one comes back untrusted with the prior version in history. A package replaces only a skill it imported earlier, never one you, the agent or a seed made.
- Export writes the required tools as `allowed-tools` and Tenant's version and origin in `metadata`. Trust is never written: it is the importing operator's decision.

## Induced skills and auto-accept

The self-improvement loop proposes skills from successful turns. By default each waits for `/skills accept`. `improve.auto_accept` in `config.json`, or the command below, changes that:

```text
/skills auto off       every induced skill waits for you (default)
/skills auto on        accept all new skills
/skills auto trusted   accept only while recent feedback is healthy
```

```json
"improve": { "auto_accept": "trusted", "trust_min_acks": 5, "trust_window": 20 }
```

`trusted` accepts while the last `trust_window` fed-back episodes (default 20) hold at least `trust_min_acks` acks (default 5) and zero undos. `/undo` on a bad turn suspends it. The dashboard's **Skills** page offers **Choose On** and **Choose Trusted** behind a confirmation.

## Seeds

```text
/skills seed gstack    install the CEO/founder-mode bundle (5 skills), recorded as seeds
```
