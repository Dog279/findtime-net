---
title: Teams, research &amp; goals
description: Multi-agent orchestration over a live bus, deep research that ends in a cited report, an autonomous goal loop with a judge, and cascading plan review.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

## Orchestrate: a team

```bash
tenant orchestrate "<task>" [--await-timeout 3m]       # alias: tenant team
```

An orchestrator plans the task, spawns concurrent helpers (the built-in five or [yours](/tenant/docs/models/helpers)), and they coordinate over a live bus until the work self-resolves. The envelope is `budgets` in `config.json` ([defaults](/tenant/docs/models/tuning)): concurrent helpers, agents per run, tool calls, tokens, cost, wall time, browser instances. `--await-timeout` is how long the orchestrator waits for its helpers (default 3 minutes).

The terminal UI's feed shows each helper's lines prefixed with its name (`[writer] thought for 2.5s`); the `subagents` log keeps them.

## Deep research

```text
/research <question>           plan → parallel web researchers → cited report
/research! <question>          skip the clarification step for a vague query
/cancel-clarify                abort a pending clarification
/research history [N]          past runs, newest first
/research show <id>            a past run's report and metadata
/research replay <id>          re-run a past question against the current model
/research delete <id>          purge a run from disk
```

```bash
tenant research "<question>" [--out FILE] [--stdout] [--no-clarify] \
  [--agents 5] [--parallel 3] [--depth 2] [--await-timeout 10m] [--max-time 20m]
tenant research list | show <id> | delete <id>
```

| Flag | Default | Meaning |
|---|---|---|
| `--agents` | 5 | sub-questions per cycle (the plan, then each reflection) |
| `--parallel` | 3 | concurrent researchers per wave |
| `--depth` | 2 | reflection cycles; 1 is a single pass, more is iterative deepening |
| `--await-timeout` | 10m | how long to wait for each wave |
| `--max-time` | 20m | wall-clock cap across all cycles (0: none) |
| `--out FILE` | | write the report here instead of the wiki or stdout |
| `--stdout` | | print the report; skips the wiki deposit |
| `--no-clarify` | | skip the up-front clarification of a vague question |

A run plans sub-questions, fans out researchers over the web plugin, reflects, deepens, and writes a cited Markdown report. The report is saved to the run (`<data>/research/`) and, when a wiki folder is configured, deposited there as notes. A report cut off by the token limit, or made mostly of planning, is retried once and otherwise fails the run. The dashboard's **Research** page starts, watches and stops runs; a source on your own network shows as plain text there, not a link.

## Goal: the autonomous loop

```text
/goal <condition>      set and start: e.g. /goal write a test for feature X and make it pass
/goal show             the condition, turns used, the judge's last verdict
/goal clear            stop (aliases: stop, off, reset, cancel); Esc or Ctrl-C also clears it
```

```bash
tenant goal "<condition>" [--max-turns 20] [--verbose]
```

A judge model reads each turn's result and decides whether the condition holds; while it does not, the loop auto-continues. `--max-turns` (default 20) is the safety cap. `goal.loop_ceiling` in `config.json` gives goal turns their own per-turn ceiling (`-1` lifts it). The dashboard's **Autopilot** page shows a goal started from the terminal UI with **Stop after this step**; a background service has no Autopilot.

## Plan review

```text
/review <plan.md>              CEO, Engineer and Designer reviews, appended to the file
/review <plan.md> ceo,eng      a subset (ceo, eng, design)
```

```bash
tenant review <plan.md> [--reviewers ceo,eng,design]
```

Three reviewer personas (shipped in the binary beside the built-in helpers) read a plan file in turn and append their findings. `/skills seed gstack` installs the matching founder-mode skills.

## Peers (federation)

Two Tenants can pair with mutual consent and share what each permits: the wiki, memory, skills, exec or an LLM.

```text
/peer                                list peers and their share policy (also /peer show|remove)
/peer serve [addr]                   start the listener (default 0.0.0.0:9100, TLS)
/peer invite <name> <ip|url>         pair: they Approve/Deny and match a PIN
/peer rename <old> <new>
/peer reconnect                      fold paired peers' shared knowledge into your search now
/peer stats                          per-peer federated-search tally
/configure peer <name>               the share editor: set <item> allow|deny
```

```bash
tenant peer invite <name> (--url <addr> | --to <peer-url>) [--as <self>]
tenant peer join <code> [--as <local-name>]
tenant peer list | show <name> | rename <old> <new> | remove | revoke | rotate <name>
tenant peer share <name> wiki=on|off memory=on|off [skills=…] [exec=…] [llm=…]
tenant peer query <name> <wiki|memory> "<query>"
```

`peer.listen` in `config.json` binds the listener at launch; a non-loopback bind is refused without TLS unless `peer.transport` is `overlay` (you run Tailscale or WireGuard). A pairing request on the dashboard asks a second time and shows the PIN.
