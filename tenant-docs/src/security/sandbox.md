---
title: Sandbox defaults
description: Where the agent's commands run on each system before you change anything, what every command is held to on any backend, what a dry run is, and the setting that turns enforcement on.
area: Security
area-url: /tenant/docs/security/overview
---

Approvals decide **whether** a command runs. The execution sandbox decides **what it can touch** once it does. Every command the agent runs (`os_exec`) goes through it, and what it does depends on your system, the surface the command came from, and the `exec_profiles` in your settings file. This page is the short version of [The execution sandbox](/tenant/docs/first-launch/sandbox).

## Where commands run by default

| Commands from | Surface | macOS | Linux and Windows |
|---|---|---|---|
| the terminal UI, the dashboard, serve chat | `local` | the host | the host |
| the Discord relay | `discord` | the host | the host |
| the iMessage responder | `imessage` | the host | the host |
| a scheduled prompt job that may run commands | `cron-exec` | confined, in a dry run | the host |
| a scheduled shell job | `cron-shell` | confined, in a dry run, with no network | the host |

A sub-agent takes the surface of the turn that started it.

**The host** means no boundary: the command runs as the account Tenant runs as, and your approvals are what stand in front of it. The interactive surfaces start there on purpose, because you are there to answer. Scheduled jobs have nobody to ask, so on macOS they start confined.

## The backends

| Backend | What it confines | Where |
|---|---|---|
| `host` | nothing | every system |
| `restricted` | the filesystem and the network, with Seatbelt | macOS |
| `container` | a fresh, hardened Linux container for each command: only the work folder and the profile's folders exist inside, no network unless the profile says `full`, not root, no capabilities | every system with Docker |
| `jobobject` | resource limits and the environment only | Windows, for local MCP servers |

## What every command is held to

These hold on any backend, the host included.

- **A clean environment.** A command gets `PATH`, `HOME`, `USER`, `SHELL`, `LANG`, `TZ`, `TERM`, `TMPDIR` and their Windows equivalents, plus what its profile passes on purpose. The API keys, tokens and proxy passwords in Tenant's own environment never reach it.
- **A work folder that is not Tenant's.** A command starts in your home folder unless it names another, never in Tenant's own directory.
- **Its approval.** The sandbox does not replace the `exec` category. A command still asks, or matches a rule, first.

On a confining backend, Tenant's config and data folders, its binary and the credential stores are always denied. No profile can take them off that list.

## A dry run, and enforcement

A confined profile is in one of two states.

| State | A command the sandbox refuses | Use it to |
|---|---|---|
| **Dry run** | runs again outside the sandbox, and the refusal is logged as `sandbox/2002`, "would have refused". Nothing is blocked and nothing is asked | see what enforcement would stop before you turn it on |
| **Enforcing** | does not run. On an interactive surface it raises a `sandbox` request; on a scheduled job it fails the job | hold commands to the profile |

A dry run can repeat a side effect: whatever ran before the refusal runs a second time.

To turn enforcement on, edit `exec_profiles` in `settings.<agent>.json`. The running Tenant reads the change within about 3 seconds.

```json
"exec_profiles": { "default": { "enforce": true } }
```

On macOS that one entry also moves the interactive surfaces off the host and into the `restricted` backend. On Linux and Windows commands stay on the host until a profile names the `container` backend, which needs Docker and has no dry run: it enforces from the start.

```json
"exec_profiles": { "default": { "backend": "container" } }
```

An enforcing profile whose backend the machine does not have runs nothing, and says why. The fields of a profile (folders, network, environment, limits) are in [`exec_profiles`](/tenant/docs/first-launch/sandbox#exec_profiles).

## When the sandbox refuses

On an interactive surface, a refused command raises a request in the `sandbox` category that shows the exact command and what approving would open.

- **Approve** runs it once more: on `container`, in a fresh container with one more grant (the refused folder, or the network for that command); on `restricted`, outside the sandbox.
- **Always** does not open the category. It saves the one refused folder as an exception for that surface.
- **Scheduled jobs never ask.** With enforcement on, a refusal fails the job, and a prompt job's summary starts with a count of the violations since its last run.

## What the sandbox does not cover

- **The file tools.** `os_write_file` and its relatives do not run commands. They have their own limit: they write only under their write roots (Tenant's folders, Desktop, Documents, Downloads and the temp folder, unless you start Tenant with `--os-write-roots`), and never under their deny roots.
- **The browser.** Chrome, which the web tools drive, keeps its own process sandbox.
- **A fleet machine.** A child runs commands through the backend named in its own `child.json` (`host` unless you chose another at install). A backend the machine does not have runs nothing ([On a fleet machine](/tenant/docs/fleet/machines)).

## Check it

```bash
tenant sandbox probe                                      # what each surface's profile enforces here, its folders and exceptions
tenant sandbox selftest [--backend restricted|container]  # the escape suite
tenant security audit                                     # findings execution.dry-run, execution.host, execution.unavailable
tenant logs query "log:sandbox id:2001-2003 since:7d"     # every refusal of the last week
```

`execution.host` in the audit is the finding to read first: it names each surface whose commands run on the host with no confinement.
