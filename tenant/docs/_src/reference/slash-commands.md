---
title: Slash commands
description: Every slash command of the terminal UI, by /help category, with its syntax. Type /help &lt;category&gt; inside Tenant for the same list.
area: Reference
area-url: /tenant/docs/reference/config
---

Slash commands are typed into the terminal UI (`tenant tui`). Each belongs to one `/help` category; a command's changes apply live and persist. The detail pages linked under each heading explain them.

## Models ([providers](/tenant/docs/models/providers), [switching](/tenant/docs/models/switching), [tuning](/tenant/docs/models/tuning), [routing](/tenant/docs/models/routing))

```text
/model                                 list configured model backends and the active one
/model pick                            arrow-key picker: provider → its live model list → swap
/model use <name> [<model>]            switch the primary; optionally pin a variant
/model models [<name>]                 the model variants a provider serves (live)
/model add <name> <endpoint> [fmt]     register a self-hosted backend mid-session
/model add-cloud <kind> <key>          register a keyed cloud provider (zai, openai, grok, anthropic)
/model add claudecode                  register the Claude Code subscription backend (no key)
/model remove <name>                   delete a backend (not the active one)
/model reload                          re-resolve the active provider's key live
/model fallback <name...> | off        auto-route to these providers when the active one fails
/ceiling [n]                           view or set the loop ceiling (also /loops, /loop-ceiling)
/ceiling repeat [n|off|default]        view or set the repeat guard: identical rounds before a forced answer (0 = off)
/reasoning [level|off]                 reasoning effort: Fugu high/xhigh, Claude Code low→max (also /effort)
/route                                 router status and a classifier health probe
/route configure                       wizard: big cloud model → small local model → policy
/route on|off|shadow|assisted|everywhere
/route force <profileID>               force a named profile (logged)
/route stats                           big/disagreement/failure rates, latency, breaker trips
/route why [n]                         explain the nth most recent routing decision
/setup                                 arrow-key setup menu: provider, model, endpoint, key, embeddings, gateway
```

## Sub-agents ([Helpers](/tenant/docs/models/helpers))

```text
/agents                                           list named sub-agent profiles
/agents add <name> <provider> [model] [-- desc]   register one
/agents model <name> <provider> [model]           swap its model (live; soul preserved)
/agents rename <old> <new>
/agents soul <name> <markdown>                    set its identity (empty clears)
/agents show <name>
/agents remove <name>
```

## Deep research ([Teams, research &amp; goals](/tenant/docs/models/teams))

```text
/research <question>          kick off a research run (also /deep)
/research! <question>         skip the vague-query clarification step
/research history [N]         past runs, newest first
/research show <id>           a past run's report and metadata
/research replay <id>         re-run a past question against the current model
/research delete <id>         purge a past run from disk
/cancel-clarify               abort a pending clarification
```

## Memory ([Memory &amp; soul](/tenant/docs/first-launch/memory))

```text
/memory                       stats: episodes, facts, skills, soul (also /mem)
/memory search <q>            hybrid search over facts and episodes
/memory facts [q]             list distilled facts (T3)
/memory recent [n]            recent episodes (T2)
/memory forget fact:<id>|ep:<id>   hide from recall (tenant privacy forget deletes for good)
/memory soul                  view the soul (T0)
/memory soul import <path>    replace it from a .md file or folder
/memory rules                 view the operating rules
/memory rules import <path>   set the rules (same as soul import)
/memory profile [refresh]     view or rebuild the learned user model
/memory distill               run a distillation pass now
/compress                     summarize old turns to free context now (also /compact)
/expand                       bring the latest compacted span back from the archive
```

## Tools &amp; plugins ([Built-in tools](/tenant/docs/mcp/built-in-tools), [Integrations](/tenant/docs/mcp/integrations))

```text
/tools                        every tool and its on/off state
/enable <name>                turn on a tool or whole plugin (smart match: /enable os, /enable os_sysinfo)
/enable skill <plugin>        every tool in a plugin, explicitly
/disable <name>               turn off; it leaves the prompt entirely
/disable skill <plugin>
/skill list                   configurable integrations and their state
/skill show <id>              one integration's fields, masked
/skill configure <id> <args>  alias of /configure
/skill probe <id>             re-test an integration's credentials
/skill clear <id> <field>     remove a stored credential
/configure                    arrow-key key picker for any service
/configure <id>               interactive walkthrough (e.g. /configure gsuite)
/configure <id> <key=value …> one shot (e.g. /configure gsuite auth=gcloud)
/configure peer <name>        a peer's share editor (set <item> allow|deny)
/cancel                       abort an in-flight /configure session
```

## MCP connectors ([Remote](/tenant/docs/mcp/remote), [Trust](/tenant/docs/mcp/trust), [Teams](/tenant/docs/models/teams))

```text
/mcp                                  connected remote MCP servers and their state
/mcp add <url>                        connect a server; its tools arrive with trust: ask
/mcp trust <label> <ask|allow|deny>   live trust (also /mcp allow|ask|deny <label>)
/mcp remove <url>                     disconnect and forget it
/peer                                 federation peers and their share policy (also /peer show|remove)
/peer serve [addr]                    start the peer listener (default 0.0.0.0:9100, TLS)
/peer invite <name> <ip|url>          pair with a peer: they Approve/Deny and match a PIN
/peer rename <old> <new>
/peer reconnect                       fold paired peers' shared knowledge into your search now
/peer stats                           per-peer federated-search tally
/github                               watched repos and which are writable (also /github add|remove; alias /gh)
/github write <owner/name>            let the agent modify this repo (writes still gated per action)
/github readonly <owner/name>         watch and report only
```

## Skills ([Skills](/tenant/docs/first-launch/skills))

```text
/skills                                   list reusable skill recipes
/skills add <name> | <desc> | <recipe>    save a skill
/skills enable|disable|forget|accept <name>
/skills show <name>                       trust, origin, package, required tools, instructions
/skills trust|untrust <name>
/skills history <name>                    prior versions
/skills diff <name> [vN]
/skills revert <name> vN
/skills import <dir|SKILL.md> [--trust]
/skills export <name> <dir>
/skills auto [off|on|trusted]             auto-accept induced skills
/skills seed gstack                       install the CEO/founder-mode bundle
/ack                                      mark the last turn good
/undo                                     mark the last turn bad
```

## Eval &amp; quality ([Quality evals](/tenant/docs/models/eval))

```text
/eval                                     the nightly-eval schedule and the last run
/eval every <dur> | at <HH:MM> | off
/eval now
/eval trend [n]
/eval diff
/judge [set <kind> <model>|clear|status]  the eval judge model
```

## Safety &amp; approvals ([Permissions](/tenant/docs/first-launch/permissions), [Access](/tenant/docs/dashboard/access))

```text
/permissions                              per-category modes and the tool rules (also /perms)
/permissions set <cat> <mode>
/permissions add <tool|pattern> <mode>    a per-tool rule: a name, an exact id, a glob, or os_exec(<glob>)
/permissions rm <pattern>
/approve [session|always]                 approve a paused dangerous action (also /approve!)
/deny                                     refuse it (also /reject)
/relay [status]
/relay on | off
/relay allow <discord-user-id>
/relay exec on|off
/relay timeout <duration>
/relay permissions [set <cat> <mode>]
/imessage [list]                          (also /imsg)
/imessage on | off
/imessage passive | respond
/imessage permissions [set <cat> <mode>]
/imessage allow <handle>
/imessage deny <handle> | clear
```

## Automation ([Scheduled jobs](/tenant/docs/dashboard/cron))

```text
/cron [list]                      (also /cronjob)
/cron add <sched> | <prompt>      e.g. /cron add 0 9 * * 1-5 | run the tests
/cron enable <id> | disable <id>
/cron run <id>
/cron rm <id>
/cron exec on|off
```

## Logs ([Logs &amp; alerts](/tenant/docs/dashboard/logs))

```text
/logs [filter]            the newest 200 events the filter matches
/logs follow [filter]     the same, then each new one as it is written
```

## Goal and plan review ([Teams, research &amp; goals](/tenant/docs/models/teams))

```text
/goal <condition>          set and start the autonomous loop
/goal show                 condition, turns used, the judge's last verdict
/goal clear                stop (aliases: stop, off, reset, cancel)
/review <plan.md>          run all 3 reviewers; the report is appended to the file
/review <plan.md> ceo,eng  a subset (ceo, eng, design)
```

## Session ([The terminal UI](/tenant/docs/first-launch/terminal-ui))

```text
/help | /help <category> | /help all
/whoami                               agent id, backend and model (also /who)
/dashboard [on|off|status]
/tailscale [serve|serve off|status]   (also /ts)
/clear                                fresh conversation and screen; memory is kept
/cls                                  clear the screen only
/mouse on|off
/exit, /quit                          the only way out
```
