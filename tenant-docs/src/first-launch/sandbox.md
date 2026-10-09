---
title: The execution sandbox
description: Where os_exec commands run on each OS, the exec_profiles that confine them, dry run vs enforcement, exceptions, and the sandbox commands.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

Every command the agent runs goes through the execution sandbox seam. What that seam does depends on the OS, the **surface** the command came from, and your `exec_profiles`.

## Surfaces and backends

| Surface | Commands from |
|---|---|
| `local` | the terminal UI, the dashboard, serve chat |
| `discord` | the Discord relay |
| `imessage` | the iMessage responder |
| `cron-exec` | a scheduled prompt job with `exec` on |
| `cron-shell` | a scheduled shell job |

Sub-agents take their parent's surface.

| Backend | What it does | Where |
|---|---|---|
| `host` | no boundary: the command runs as the Tenant process, behind your approvals | every OS |
| `restricted` | filesystem and network confinement (Seatbelt) | macOS only |
| `jobobject` | resource caps and the environment allowlist only, no filesystem or network confinement | Windows, for local MCP servers |
| `container` | a Docker container | planned |

## The built-in defaults

| Surface | macOS | Linux and Windows |
|---|---|---|
| `local`, `discord`, `imessage` | **host**, behind approvals (like a coding assistant without a sandbox) | host |
| `cron-exec` | `restricted` in **dry run** | host |
| `cron-shell` | `restricted` in dry run, network `none` | host |

Any `exec_profiles` entry for an interactive surface opts it back into the sandbox. In a **dry run** the sandbox runs the command first; if it refuses something (a write outside the allowed folders, a read of a credential store, a network call with the network off) the command runs again outside the sandbox and the refusal is logged (`sandbox/2002`, "would have refused"). Nothing is blocked and no approval is asked; the log tells you what enforcement would stop. A dry run can therefore repeat a side effect: whatever ran before the refusal runs again.

Every command, on any backend, gets a **clean environment**: `PATH`, `HOME`, `USER`, `SHELL`, `LANG`, `TZ`, `TERM`, `TMPDIR` and their Windows equivalents, plus what the profile's `env_pass` and `env_set` add. API keys, tokens and proxy passwords in Tenant's environment never reach a command.

## `os_exec` itself

The tool takes `command`, `workdir` (default: your home folder, never Tenant's own directory), `timeout` (seconds; default 120, up to 600) and `background` (return at once with a process id). Long output keeps its start and its end, up to 30 KB. A command still running at its timeout on a host surface is moved to the background instead of killed; `os_process` lists, reads (`log`, paged), waits for, writes to and kills background processes, whose logs live under `<data>/proc/`. Processes die with Tenant, and a finished one is forgotten after an hour.

## `exec_profiles`

In `settings.<agent>.json`, keyed by surface or `default` (every surface without its own entry). The running hub re-reads the file within about 3 seconds. No agent tool can write it, and the file tools refuse the settings file.

```json
"exec_profiles": {
  "default":    { "enforce": true, "env_pass": ["JAVA_HOME", "HTTPS_PROXY"] },
  "cron-shell": { "backend": "host" },
  "local":      { "backend": "restricted", "network": "none", "write_roots": ["~/projects"] }
}
```

| Field | Values | Meaning |
|---|---|---|
| `backend` | `host`, `restricted`, `container` | the backend; naming one also keeps the older defaults (enforce on, network inherited) |
| `enforce` | `true`, `false` | `false` is a dry run; unset follows the built-in default |
| `network` | `inherit`, `none`, `full` | an allowlist is rejected until a backend enforces one |
| `read_roots` | paths | empty: the whole host is readable (deny roots still mask) |
| `write_roots` | paths | writable, in addition to the work dir |
| `deny_roots` | paths | added to the built-in deny set (Tenant's own dirs, its binary and the credential stores can never be removed from it) |
| `env_pass` | names | environment variables forwarded beyond the safe base set |
| `env_set` | map | fixed environment values |
| `cpu_seconds`, `memory_mb`, `max_pids` | numbers | resource caps |

Turning enforcement on, once the log shows only refusals you want:

```json
"exec_profiles": { "default": { "enforce": true } }
```

With enforcement on, a refused command on an interactive surface raises a `sandbox` prompt: **approve** re-runs it outside the sandbox (`os_exec_unsandboxed`). Cron surfaces never escalate: with enforcement on, a refusal fails the job. An enforcing profile whose backend this machine lacks fails closed (`sandbox/3001`); a dry-run one runs on the host and logs `sandbox/2005`.

## Exceptions

**Always** on a sandbox prompt does not open the category. It saves the one folder that was refused as an exception for that surface, under `exec_exceptions`, and nothing else:

```json
"exec_exceptions": { "local": ["~/projects"], "cron-shell": ["C:\\Tenant\\reports"] }
```

The prompt says in advance what it will save, or why nothing: a network refusal, a refusal inside Tenant's folders or a credential store, your home folder or anything above it, a system folder or a volume root, a path that does not exist, or output that names no absolute path. Exceptions are saved as real paths with symlinks resolved; one that later stops being that folder is not used and `sandbox/2006` says why.

## Commands

```bash
tenant sandbox probe                       # what each surface's profile enforces on this host, its roots and exceptions
tenant sandbox selftest [--backend restricted|container]   # the escape suite
tenant sandbox redteam [--backend restricted|host]         # the model-in-the-loop containment eval
tenant sandbox run --surface S [--backend B] -- CMD        # run one command under a surface's profile
tenant security audit                      # execution.dry-run, execution.host, execution.unavailable findings
tenant permissions effective               # execution.profile per surface
tenant logs query "log:sandbox id:2001-2003 since:7d"      # every violation of the last week
```

| Sandbox event | Meaning |
|---|---|
| `sandbox/1`, `sandbox/1001` | every command, with its backend, surface and exit |
| `sandbox/2001` | refused (enforcing) |
| `sandbox/2002` | dry run: would have refused |
| `sandbox/2003` | approved to run outside the sandbox |
| `sandbox/2004` | an exception saved |
| `sandbox/2005` | backend unavailable, so a dry run ran on the host |
| `sandbox/2006` | an exception not used (gone, or a symlink now) |
| `sandbox/3001` | backend unavailable and the profile enforces, so nothing ran |

The built-in `sandbox-unattended` alert rule banners violations from unattended surfaces, and every cron prompt job's summary starts with `🛡 SANDBOX: N sandbox violation(s) since the last run` when there were any.

## Known limits

- A dry run misses refusals it cannot recognise, and those commands fail instead of re-running: on macOS a command that hides its errors (`2>/dev/null`), and services Seatbelt blocks such as the clipboard (`pbcopy`), `open`, `defaults` and `osascript`. Put a surface that needs them on the host.
- Linux and Windows run on the host until the container backend ships.
- The danger classifier in the OS plugin is a guardrail against accidents, not a security boundary. The real containment is keeping `exec` at `ask`, running Tenant as a least-privilege user, and an enforcing sandbox profile.

Chrome, which the web plugin drives, keeps its own process sandbox. `"browser_no_sandbox": true` in `config.json` is accepted only inside a Linux container or user namespace; `tenant security audit` reports its effective state.
