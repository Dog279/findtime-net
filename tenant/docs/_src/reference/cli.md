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
tenant version                               the version and build provenance
tenant update [--version vX.Y.Z] [--yes] [--now] [--force]
tenant update --check                        running vs latest; exit 10 when an update exists
tenant update --rollback
tenant completion bash|zsh|fish|powershell
```

## Run Tenant

```text
tenant serve [--dashboard-addr ADDR] [--dashboard=false] [--self-improve=false] [--distill-every D] [--profile-every D] [--eval-every D] [--allow-no-memory] [--stop-budget D]
tenant attach [URL] [--follow] [--interval D] [--source NAME] [--level warn|error] [--trace ID] [--token T] [--since …]
tenant service install [--print] [--system]
tenant service status | start | stop | restart [--now] | uninstall
tenant orchestrate "<task>" [--await-timeout 3m]        (alias: team)
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
tenant eval --subset smoke|fitness|full [--json] [--quiet] [--list] [--compaction] [--gate-only] [--judge-model M] [--baseline-check FILE] [--baseline-from FILE] [--append-trend] [--baseline-diff]
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
tenant mcp-memory [--allow-writes] [--tools] [--sse-addr ADDR] [--insecure-lan] [--allow-no-memory]
```

## Safety

```text
tenant security audit [--json]
tenant permissions effective [--surface local|discord|imessage] [--agent ID]
tenant permissions preset safe|balanced|full [--surface S] [--agent ID]
tenant sandbox probe
tenant sandbox selftest [--backend restricted|container]
tenant sandbox redteam [--backend restricted|host]
tenant sandbox run --surface S [--backend B] -- CMD
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
