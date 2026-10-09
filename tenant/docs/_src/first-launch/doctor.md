---
title: Doctor
description: tenant doctor checks the whole setup, from file permissions to the model endpoint to the background service, and --fix repairs what it safely can.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

```bash
tenant doctor            # every check, a summary, non-zero exit on a FAIL
tenant doctor --fix      # apply the safe repairs
tenant doctor --json     # machine-readable: {"checks": [...], "fail": n, "warn": n, "healthy": bool}
```

Each check reports **OK**, **WARN**, **FAIL** or **SKIP** with a detail line and, when it knows one, a fix. A plain `tenant doctor` never changes anything, not even file permissions (it reads secrets without hardening them, so the report reflects what it found).

## The checks

| Check | What it looks at |
|---|---|
| directories | the config and data dirs exist and are writable |
| private data permissions | owner-only permissions on the stores; `--fix` applies them |
| launch config | `config.json` parses, its schema version, the active provider exists |
| secret storage protection | `credentials.json` and the token file: `0600` and a `0700` parent on Unix, a current-user-only DACL on Windows |
| credentials | every keyed provider has a resolvable secret (an env var, or a stored key) |
| profiles/router | every model role resolves to a provider |
| fallback health gating | whether latency gating is on and has a chain to move to |
| generation endpoint | the active provider answers (for `claudecode`, the `claude` program exists) |
| tokenize endpoint | vLLM's `/tokenize`, or the chars/4 estimate other kinds use |
| embedding endpoint | the embedder answers |
| embedding dimension consistency | stored vectors match the current embedder's dimension; the fix is `tenant memory reembed` |
| sqlite stores | every store opens |
| db integrity | `PRAGMA integrity_check` on each; `--fix` renames a corrupt file to `.corrupted` so the next start gets a fresh one |
| agent profiles | every helper's provider exists and resolves |
| skills store | `skills.db` opens |
| research store | the research dir and its manifests |
| soul | the soul TOML parses |
| exec sandbox | what each surface's commands really run under on this host |
| log book location, integrity, size, housekeeper, mirror-only, losses | the log book's store and text files |
| one check per plugin | for example `discord (if enabled)`: the token is resolvable and reachable |
| dashboard (if configured) | reachability, and the bind policy (a non-loopback address needs TLS and a key) |
| serve liveness (if running) | `/api/status` of a running hub: a stuck turn, a waiting approval queue |
| background service | installed, pointing at these dirs, answering; `--fix` rewrites a drifted unit |
| update | a newer release, or an update that never finished |
| distill cursor | the self-improvement cursor advances |
| project SME (memory) | the reflection doc's health and the merge-protected fraction |
| tool-calling (deep) | one real tool-calling turn against the model |
| mcp surface (deep) | the MCP memory server round-trips |
| remote MCP auth | a remote connector whose OAuth refresh token died, read offline from its cache |

## What `--fix` does

Only safe, reversible repairs: owner-only permissions on secret files and stores, a corrupt database renamed aside, the service unit rewritten to match the current binary and directories. It never deletes data and never changes your configuration.

## Reading a failure

- **embedding endpoint FAIL**: start Ollama and `ollama pull nomic-embed-text`, or point `embed` at your embedder. Until then the agent runs amnesiac.
- **embedding dimension consistency FAIL**: you switched embedders after storing data. `tenant memory reembed` recomputes every vector with the current one.
- **generation endpoint FAIL**: the endpoint or key. `tenant model models` lists what the provider serves; `/model reload` re-reads a rotated key.
- **secret storage protection WARN**: run `tenant doctor --fix` from the account that owns the files (on a Windows service, an administrator window).
- **exec sandbox WARN**: the surface runs commands on the host, or a profile names a backend this OS lacks. See [The execution sandbox](/tenant/docs/first-launch/sandbox).

`tenant doctor --context-debug "what do I prefer"` traces which facts and episodes a query would retrieve, then exits: the fastest way to see whether memory recall works.
