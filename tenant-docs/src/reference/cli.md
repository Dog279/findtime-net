---
title: CLI commands
description: Every tenant subcommand, by section, with its syntax. The same registry renders tenant help, so this list is what the binary knows.
area: Reference
area-url: /tenant/docs/reference/config
---

`tenant help` lists the jobs to start with, `tenant help all` every command by section, `tenant help <command>` one command's rows, and `tenant <command> --help` its flags. `tenant completion bash|zsh|fish|powershell` prints a completion script.

## Common flags

Most commands take these; they are merged with `config.json`, and an explicit flag wins.

| Flag | Default | Meaning |
|---|---|---|
| `--backend echo\|vllm\|anthropic\|claudecode` | the configured provider, else `echo` | the inference backend |
| `--agent ID` | `main` | the agent id |
| `--data DIR`, `--config DIR` | the OS dirs | the data and config directories |
| `--log-dir DIR` | `<data>/logs` | the log book root |
| `--vllm-endpoint URL`, `--vllm-model NAME`, `--vllm-tool-format FMT` | from config | the OpenAI-compatible provider for this launch |
| `--embed-endpoint URL`, `--embed-model NAME`, `--embed-dim N` | from config | the embedder for this launch |
| `--api-key KEY` | | a hosted provider's key for this launch |
| `--plan-loop-ceiling N` | 16 | planner↔tool iterations per turn |

Plugin flags (`--os`, `--os-allow-exec`, `--web`, `--gsuite`, …) are on [Built-in tools](/tenant/docs/mcp/built-in-tools).

## Get started

```text
tenant setup [--provider KIND --vllm-endpoint URL …] [--non-interactive] [--show] [--reset]
tenant tui                                   full-screen terminal UI
tenant chat                                  the agent loop without the UI; one stdin line is one turn
tenant doctor [--fix] [--json]               diagnose the setup; --fix repairs what it safely can
tenant help | help all | help <command>
tenant version                               the version and build provenance; a build made with -tags debugattach says so
tenant version --protection                  also this process's protection report, as one line of JSON (tenant update reads it from the new binary)
tenant update [--version vX.Y.Z] [--yes] [--now] [--force]
tenant update --check                        running vs latest; exit 10 when an update exists
tenant update --rollback
tenant completion bash|zsh|fish|powershell
```

## Run Tenant

```text
tenant serve [--dashboard-addr ADDR] [--dashboard=false] [--dashboard-lan[=HOST:PORT]] [--self-improve=false] [--distill-every D] [--profile-every D] [--eval-every D] [--allow-no-memory] [--stop-budget D]
tenant attach [URL] [--follow] [--interval D] [--source NAME] [--level warn|error] [--trace ID] [--token T] [--since …]
tenant service install [--print] [--system]
tenant service status | start | stop | restart [--now] | uninstall
tenant orchestrate "<task>" [--await-timeout 30m]       (alias: team)
tenant logs [query|show|trace|stats|export|verify|config|clear|debug|catalog|components|recover|alerts] …
tenant log <source> "<msg>" [k=v …] [--level debug|info|warn|error] [--list] [--file] [--url U] [--token T]
```

`tenant logs` in full is on [Logs &amp; alerts](/tenant/docs/dashboard/logs).

## Memory

```text
tenant memory search <query>
tenant memory import <file.md> [--protected] [--importance N] [--dry-run]
tenant memory reembed
tenant distill                               one episodic → semantic pass
tenant consolidate [--dry-run] [--threshold T] [--holistic]
tenant ack                                   mark the last turn good
tenant undo                                  mark the last turn bad
tenant skills list | show <name> | trust <name> | untrust <name>
tenant skills import <dir|SKILL.md> [--trust]
tenant skills export <name> <dir>
tenant skills seed <bundle>                  e.g. gstack
tenant skills auto [off|on|trusted]
```

## Models and routing

```text
tenant model list | show <name>
tenant model use <name> [model]
tenant model models [name]                   what a provider serves, live
tenant model add <name> --endpoint URL [--kind K] [--model M] [--tool-format F]
tenant model remove <name>
tenant route status | on | off | shadow | assisted | everywhere | stats
tenant route export-dataset [--out FILE]
tenant eval --subset smoke|fitness|full|vision [--json] [--quiet] [--list] [--compaction] [--gate-only] [--quality-model M] [--baseline-check FILE] [--baseline-from FILE] [--append-trend] [--baseline-diff]
```

## Agents, research and goals

```text
tenant agents list | show <name>
tenant agents add <name> <provider> [model]
tenant agents model | rename | soul | remove …
tenant research "<question>" [--out FILE] [--stdout] [--no-clarify] [--agents N] [--parallel N] [--depth N] [--await-timeout D] [--max-time D]
tenant research list | show <id> | delete <id>
tenant goal "<condition>" [--max-turns N] [--verbose]
tenant review <plan.md> [--reviewers ceo,eng,design]
```

## One-shot plugin turns (read by default; --allow-* to act)

```text
tenant os "<task>" [--allow-exec] [--allow-write]
tenant web "<task>" [--show] [--allow-interact]
tenant sql "<q>" --db FILE [--allow-write]
tenant wiki "<q>" --dir DIR
tenant gsuite "<task>" [--auth gcloud|sa] [--sa-json FILE] [--subject EMAIL] [--allow-send]
tenant x "<task>" [--bearer T] [--allow-post]  |  tenant x --login [--client-id ID] [--redirect-uri URI]
tenant imessage "<task>" [--bb-url URL] [--bb-password P] [--private-api] [--allow-send]
tenant simplefin [--days N]
```

## Connections and federation

```text
tenant atlassian login --site <url> --client-id <id>
tenant oauth-setup gsuite
tenant mcp connect <url> [--trust-annotations] [--callback host:port] [--no-browser]
tenant peer invite <name> (--url <addr> | --to <peer-url>) [--as <self>]
tenant peer join <code> [--as <local-name>]
tenant peer list | show <name> | rename <old> <new> | remove <name> | revoke <name> | rotate <name>
tenant peer share <name> wiki=on|off memory=on|off [skills=…] [exec=…] [llm=…]
tenant peer query <name> <wiki|memory> "<query>"
tenant mcp-memory [--allow-writes] [--tools] [--sse-addr ADDR] [--insecure-lan] [--allow-no-memory]   # over --sse-addr, clients send the token in gateway-auth-token
tenant fleet init [--listen ADDR] [--address HOST:PORT]...                    make this Tenant a fleet master (once)
tenant fleet enroll <name> [--ttl 15m] [--adopt ID]                           a one-time code and the line to paste on the new machine
tenant fleet address [list | add HOST:PORT | remove HOST:PORT]                the addresses a code tells a new machine to dial
tenant fleet list | show <name>                                               the machines; one machine in full
tenant fleet confirm <name> [--set category=mode]...                          confirm a pending machine with the six digits it shows
tenant fleet rename <name> <new-name>                                         relabel a machine; its id stays
tenant fleet revoke <name> [--keep-scheme | --delete-scheme]                  refuse its certificate from now on and close its link
tenant fleet permissions <name> [set <category> <mode> | add <pattern> <mode> | rm <pattern>]   show or edit one machine's own approval scheme
tenant fleet permissions <name> --from defaults|master                        lay the fleet's rules and the machine's groups' rules over it again, or copy the master's scheme again
tenant fleet permissions --group <group> | --all [set <category> <mode> | add <pattern> <mode> | rm <pattern> | --from defaults|master]   the same change to each member of a group, or every confirmed machine; exit 1 if any was not changed
tenant fleet permissions --defaults [set <category> <mode> | unset <category> | add <pattern> <mode> | rm <pattern>]   the categories and rules every newly confirmed machine starts with
tenant fleet group [show <group> | create <group> | delete <group>]           named groups of machines, each with rules; changing a group moves no machine
tenant fleet group add|remove <group> <machine>...                            put machines (by name or id) into a group, or take them out
tenant fleet group rules <group> [add <pattern> <mode> | rm <pattern>]        a group's rules, laid after the fleet's rules, groups in name order
tenant fleet group apply <group>                                              lay the fleet's rules and each member's groups' rules over every confirmed member
tenant fleet relay [discord|imessage [on|off]]                                whether a turn from that relay may reach the fleet (off by default)
tenant fleet remote-confirm [on|off]                                          whether a signed-in dashboard browser on another computer may confirm a machine (off by default)
tenant fleet update <name> | --all | --group <group> [--version vX.Y.Z] [--allow-older]   send machines a newer Tenant over their links
tenant fleet recover <name> [--was ID]                                        read a machine's memory made under another fleet key, with the recovery identity
tenant child install [--dir D] [--ceiling full|no-exec|read-only] [--updates release|master]   enroll this machine and install its service, which runs as root or SYSTEM from boot (an elevated terminal)
tenant child updates [release|master]        whose word an update from the master is taken on
tenant child rehome                          trust another master, keeping this machine's key, ceiling, audit log and memory copies
tenant child status                          connected, waiting for confirmation, paused, rejected, offline; exit 3 unless connected
tenant child pause | resume                  stop serving the master at once, until resume
tenant child audit                           check the chain of this machine's audit log
tenant child uninstall                       remove the service and this machine's fleet key; the audit log stays
tenant child run                             what the installed service runs: hold the link from this terminal
```

`tenant fleet` runs on the master and `tenant child` on a machine it owns. `child install` and `child rehome` read the code from standard input or `$TENANT_ENROLL_CODE`, never from an argument. `fleet remote-confirm on` asks at a terminal and refuses when its input is not one. The walk-through is on [Fleet](/tenant/docs/fleet/overview); groups and the defaults are in [Fleet approvals](/tenant/docs/fleet/approvals).

## Safety

```text
tenant security audit [--json]
tenant permissions effective [--surface local|discord|imessage] [--agent ID]
tenant permissions preset safe|balanced|full [--surface S] [--agent ID]
tenant sandbox probe
tenant sandbox selftest [--backend restricted|container]
tenant sandbox redteam [--backend restricted|host]
tenant sandbox run --surface S [--backend B] -- CMD
tenant sandbox stop-all       remove every Tenant sandbox container on the engine (the emergency stop)
```

## Your data

```text
tenant backup [create] [--out FILE|DIR] [--encrypt] [--passphrase-file F] [--recipient age1…] [--recipients-file F] [--include-mirror] [--json]
tenant backup verify FILE [--identity F] [--json]
tenant backup restore FILE [--dry-run] [--yes] [--force] [--identity F]
tenant privacy [status]
tenant privacy retention set <class> <days|forever>
tenant privacy prune [--yes]
tenant privacy forget [--session ID] [--episode N] [--fact N] [--skill NAME] [--match "text"] [--before DATE] [--archive-month YYYY-MM] [--connector NAME] [--only-agent ID] [--yes]
tenant privacy sessions [--limit N]
tenant privacy export --out DIR [--no-archive] [--only-agent ID]
tenant runs export [--out FILE]
```

## Diagnostics and development

```text
tenant mcp-selftest          spawn mcp-memory as a subprocess and exercise the protocol against it
tenant tool-test [-q "…"]    one tool-calling agent turn (the hardening harness)
```
