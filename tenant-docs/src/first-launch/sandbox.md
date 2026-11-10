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
| `container` | a fresh, hardened Linux container per command, through the `docker` CLI: only the work dir and the profile's roots exist inside, no network unless the profile says `full`, non-root, no capabilities | every OS with Docker (Docker Desktop on Windows and macOS) |

### What the container backend needs

`container` fails closed: when any of these is missing, an enforcing profile runs nothing and says why (`tenant sandbox probe`, `tenant doctor`).

- The `docker` CLI on `PATH`, and an engine it can reach over a local pipe or socket, `ssh://`, or mutual-TLS `tcp://`. A plain `tcp://` endpoint is refused, and so is running while anything answers on `127.0.0.1:2375` (Docker Desktop's "Expose daemon … without TLS" setting).
- Docker Engine 29.4.3 or later, with runc and containerd at or past their fixed releases, and seccomp on. On Windows: Docker Desktop 4.44.3 or later (4.76.0 to clear the warning), WSL 2.7.10 or later with a kernel at or past 6.18.40 (`wsl --update`).
- The sandbox image, built once with `tenant sandbox image build`; the backend never pulls.
- An engine that can start a container. Before a surface first uses the backend, Tenant runs one check container through the same hardened arguments, with a 20-second limit. A Docker Desktop that is still starting answers `docker info` but starts nothing; the surface's commands are then refused with that reason, and the check is retried with back-off. The check also records whether a user namespace is in effect and the kernel containers run on.

On Windows the kernel floor applies to the kernel that is **running**. `wsl --version` prints the installed kernel, and a WSL VM started before an update keeps the old one: below the floor the backend refuses; a running kernel that only trails the installed one is a warning. `wsl --shutdown`, then start Docker Desktop again, to run the installed kernel.

A `container` profile has no dry run: `"enforce": false` on one is rejected when the settings load. So is a `container` profile whose `read_roots` or `write_roots` contain, equal or sit inside a folder a container may never mount: Tenant's config or data dir, its binary, a credential store, or the entry's own `deny_roots`. A container sees exactly its mounts, so it cannot mount a folder and hide part of it. The skipped entry is reported with the grant and the folder named (`tenant sandbox probe`, `tenant doctor`, the start-up feed).

A command is also refused when its work dir or a `write_roots` folder is itself a git directory: a bare repository, or a checkout's `.git` given directly. Its `hooks` folder and `config` file would be the command's to write, and git runs them on the host the next time it is used there. Give the command a folder that holds a checkout, or grant the repository under `read_roots`.

To use an engine other than the local default, name it in `config.json` under [`container`](/tenant/docs/reference/config#container): `endpoint`, and for a `tcp://` endpoint `tls_cert_dir`. A `tcp://` endpoint is always launched with mutual TLS (`--tlsverify`, with the CA, certificate and key from that folder).

`tenant doctor`'s **container sandbox** row says whether the backend can run a command right now, and the fix when it cannot.

Every command a surface runs is a record in the Security log (**Logs** → Security; `tenant logs query "log:security"`). On the `container` backend the record also says what the run was held to: the image and the id its tag resolved to, each folder mounted and whether it was writable, the network, the limits, the names (never the values) of the environment variables passed in, how much the command wrote and whether that hit the output cap, and how long it took. The record of an approved re-run says where it ran: on the host, or in a container with one more grant.

## The built-in defaults

| Surface | macOS | Linux and Windows |
|---|---|---|
| `local`, `discord`, `imessage` | **host**, behind approvals (like a coding assistant without a sandbox) | host |
| `cron-exec` | `restricted` in **dry run** | host |
| `cron-shell` | `restricted` in dry run, network `none` | host |

Any `exec_profiles` entry for an interactive surface opts it back into the sandbox. In a **dry run** the sandbox runs the command first; if it refuses something (a write outside the allowed folders, a read of a credential store, a network call with the network off) the command runs again outside the sandbox and the refusal is logged (`sandbox/2002`, "would have refused"). Nothing is blocked and no approval is asked; the log tells you what enforcement would stop. A dry run can therefore repeat a side effect: whatever ran before the refusal runs again.

Every command, on any backend, gets a **clean environment**: `PATH`, `HOME`, `USER`, `SHELL`, `LANG`, `TZ`, `TERM`, `TMPDIR` and their Windows equivalents, plus what the profile's `env_pass` and `env_set` add. API keys, tokens and proxy passwords in Tenant's environment never reach a command.

`env_pass` is the exception you write yourself. When a name in it looks like a credential (`…_TOKEN`, `…_API_KEY`, `…PASSWORD`, `SSH_AUTH_SOCK` and the like), `tenant sandbox probe` and `tenant doctor` point it out, per surface: a sandboxed command can read every variable it is passed, and with the network on it can send it anywhere. The name is still passed; this is a hint, and a secret under a plain name is not noticed.

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

With enforcement on, a refused command on an interactive surface raises a `sandbox` prompt (`os_exec_unsandboxed`) that shows the exact command, with control characters spelled out, and a line Tenant writes about what approving opens. On the `container` backend, **approve** re-runs the command in a fresh container with one more grant: the refused folder as a writable root, or the network for that one command. Only a Windows program a Linux container cannot run (`cmd.exe`, a `.exe`) is re-run on the host, as shown; a command written for `sh` is never handed to PowerShell. An approval on `container` covers the exact run you were shown: the command, the folders mounted, the network and the image. If any of those changes while the prompt waits (the image is rebuilt, a folder is re-pointed), nothing runs and the refusal says to ask again. The approved run is started from that same description, with the image named by its id, not its tag, so a tag moved at the last instant changes nothing. On `restricted`, approve re-runs the command outside the sandbox. Cron surfaces never escalate: with enforcement on, a refusal fails the job. An enforcing profile whose backend this machine lacks fails closed (`sandbox/3001`); a dry-run one runs on the host and logs `sandbox/2005`.

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
tenant sandbox stop-all                                     # remove every Tenant sandbox container now
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
- Linux and Windows run on the host until a profile names the `container` backend.
- Inside a container, Windows paths appear as `/mnt/c/...`; commands run under `sh`, so a cron shell job in `cmd` syntax belongs on the host.
- The danger classifier in the OS plugin is a guardrail against accidents, not a security boundary. The real containment is keeping `exec` at `ask`, running Tenant as a least-privilege user, and an enforcing sandbox profile.

Chrome, which the web plugin drives, keeps its own process sandbox. `"browser_no_sandbox": true` in `config.json` is accepted only inside a Linux container or user namespace; `tenant security audit` reports its effective state.
