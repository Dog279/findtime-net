---
title: On a fleet machine
description: The tenant child commands, the service a child installs on each system, child.json and its ceiling, the machine's own audit log, and what happens when the master revokes a machine.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

Everything on this page runs on the machine itself, not on the master.

## Commands

```bash
tenant child install [--dir D] [--ceiling full|no-exec|read-only] [--updates release|master]
tenant child updates [release|master]
tenant child rehome
tenant child status
tenant child pause | resume
tenant child audit
tenant child uninstall
tenant child run
```

| Command | Does |
|---|---|
| `install` | enrolls this machine with the code from `tenant fleet enroll` (read from standard input or `TENANT_ENROLL_CODE`, never an argument), shows the six digits to type on the master when it asks for them, and installs the service: the machine's own, which runs as root or SYSTEM from boot. Needs a root shell (or sudo) or a PowerShell run as administrator |
| `updates` | whose word an update from the master is taken on; see [Update, move and recover](/tenant/docs/fleet/updates) |
| `rehome` | trust another master; see [Update, move and recover](/tenant/docs/fleet/updates#move-a-machine-to-another-master) |
| `status` | where this machine stands: connected, waiting for confirmation (with the six digits), paused, rejected, offline. Exit 3 unless connected |
| `pause` | stop serving the master at once: the link drops, and running calls and background commands end. It lasts across restarts, until `resume` |
| `resume` | serve the master again |
| `audit` | check the chain of this machine's audit log |
| `uninstall` | remove the service and this machine's fleet key; the audit log stays |
| `run` | what the installed service runs: hold the link from this terminal |

| Flag | Effect |
|---|---|
| `--system` | the machine's own child, which is what `install` installs without it. Still accepted: the lines a master prints pass it |
| `--ceiling` | `install`: what this machine lets its master do: `full` (default), `no-exec` or `read-only` |
| `--updates` | `install`: `release` (default) or `master` |
| `--sandbox` | `install`: the sandbox backend this machine runs commands through (default `host`) |
| `--dir` | the child's directory, instead of the machine's. `install --dir <directory>` keeps the child there and runs it as your account from logon: for a machine nobody may administer. Refused from a root shell on Linux and macOS |

Exit codes: 0 done, 1 an error, 2 refused before anything changed (a code given as an argument, a machine that is already enrolled, an install without elevation), 3 from `status` when the machine is not connected.

## Where a child keeps its files

A child is the machine's own, and so is its directory:

| System | The child's directory |
|---|---|
| Windows | `%ProgramData%\tenant\child` |
| Linux | `/etc/tenant/child` |
| macOS | `/Library/Application Support/tenant/child` |

It holds `child.json`, the machine's key (`child-identity.pem`), the link's state (`child-link.json`) and the `audit` folder. What the child's tools work with goes beside it, in `<dir>-data`. A child that runs as one account keeps the same files in the directory `install --dir` named, or in `<config>/child` where an earlier Tenant installed it.

## The service on each system

| System | The machine's own (from boot) | With `--dir`, as your account (from logon) |
|---|---|---|
| Windows | service `TenantChild`, started automatically, as SYSTEM | scheduled task `\Tenant\Child`, started at logon |
| Linux | system unit `/etc/systemd/system/tenant-child.service`, as root | systemd user unit `tenant-child.service` |
| macOS | LaunchDaemon `com.tenant.child` in `/Library/LaunchDaemons`, as root | LaunchAgent `com.tenant.child` in `~/Library/LaunchAgents` |

On Linux, a user unit stops when you log out unless lingering is on; `install --dir` prints the `loginctl enable-linger` command when it is off. The child's labels differ from `tenant service`'s, so a child can be installed beside a full Tenant on the same machine.

## What running as root or SYSTEM means

Whoever adds a machine to a fleet owns or administers it. As root or SYSTEM the child is there from boot, whoever is logged on, and what its master can do on the machine is limited by the ceiling below and the master's approvals, not by an account.

- Every command the master runs there runs as root or SYSTEM, in that account's environment: not a user's `PATH`, shell profile, keychain or signed-in tools. Files it writes are root's or SYSTEM's.
- The binary the service runs must be where only an administrator can replace it; `install` refuses one that is not. On Linux and macOS that is a path that is root's all the way up and closed to writing by group and others (`/usr/local/bin`). On Windows it is under `%ProgramFiles%` and nowhere else: a folder of its own on the system drive, such as `C:\Tenant`, lets every signed-in account change its files. The install script puts the binary in the right place; a Tenant in your own folder (`~/.local/bin`, `%LOCALAPPDATA%\Programs\tenant`) is refused.
- **Linux: the child's browser does not start.** Chrome refuses to run as root with its own sandbox on, and Tenant turns that sandbox off only inside a container or a user namespace, when `browser_no_sandbox` says so. The other tools are not affected.

A child that an earlier Tenant installed for an account keeps running, and `status`, `pause`, `resume`, `rehome` and `uninstall` still find it. While it is there `install` refuses, so that one machine does not become two to its master. To make it the machine's own, `tenant child uninstall` and enroll again from an elevated terminal: a new enrollment is a new key.

## child.json and the ceiling

`child.json` is what the machine lets its master do. It is owner-only, and it is read from the disk on every call, so an edit takes effect on the next call with no restart.

```json
{
  "version": 1,
  "id": "m0123456789abcdef",
  "name": "web1",
  "master_addresses": ["192.168.1.5:9777"],
  "master_fingerprint": "…",
  "sandbox": "host",
  "ceiling": "no-exec",
  "tools": ["os_read_file", "os_list_dir"],
  "secret_paths": ["/srv/app/secrets"]
}
```

| Key | Meaning |
|---|---|
| `ceiling` | `full`, `no-exec` or `read-only` (below) |
| `tools` | when present, the only tools this machine serves. An empty list is an error, not "none" |
| `secret_paths` | absolute paths of files or folders that this machine's file tools never read or write, added to the built-in list (the child's own directory, the machine's password databases and key stores, every account's credential stores and browser profiles) |
| `sandbox` | the backend commands run through; a backend the machine does not have runs nothing |
| `updates` | `master` when set so; left out means the default, `release` |

The id, name, addresses and fingerprint are written at enrollment; leave them alone.

### What each ceiling guarantees

| Ceiling | The machine refuses, without asking the master | How firm |
|---|---|---|
| `full` | nothing: the master's approvals decide | with the `host` sandbox, a command runs as the account that owns `child.json` |
| `no-exec` | every action that runs a command: the `os_exec` family, and any action Tenant does not declare, such as a local MCP server's tool | not a firm guarantee: file writes the master approves still happen, and a written file can be one that something on the machine runs later |
| `read-only` | every action that would need an approval | firm: nothing that changes the machine is done |

`no-exec` and `read-only` are limits the master cannot lift. A refusal the machine makes by itself ends the result with `[fleet: this machine refused, without asking its master: os_exec (ceiling read-only)]`, and nobody on the master is asked.

## The audit log

Every call from the master is written to `<child dir>/audit/audit.jsonl` before it runs, and again when it has ended. Each record carries the SHA-256 of the one before it, and each also goes to the system log: syslog (the journal on a systemd machine) or, on Windows, the Application event log under the source `TenantChild`. If the record cannot be written, the call is not run.

`tenant child audit` checks the chain. The chain shows a change inside the log; it cannot show records cut off its end. For that, the master keeps the hash of each record with its own record of the call (event `fleet/1201` in [the fleet log](/tenant/docs/fleet/overview#the-fleet-log)), so the two can be compared, and the system log has a line per record.

## Pausing

`tenant child pause` drops the link and ends running calls and background commands. While paused the machine serves nothing. The pause lasts across restarts; `tenant child resume` reconnects.

## When a machine is revoked

On the master:

```bash
tenant fleet revoke <name>                  # at a terminal: asks whether to keep or delete its scheme
tenant fleet revoke <name> --keep-scheme    # the record and the approval scheme stay under its id
tenant fleet revoke <name> --delete-scheme  # both go, and the machine's memory with them
```

From then on the master refuses the machine's certificate. If the machine is online, the master sends it a "revoked" notice and closes its link within a second; the child stops and does not start again, and `tenant child status` says it is revoked. A machine revoked while it was offline is refused at its next handshake: its status says the master rejected it, and it keeps trying, slowly, until it is uninstalled.

A kept scheme can be given to a machine enrolled later with `tenant fleet enroll <name> --adopt <id>`; `--keep-scheme` also keeps the machine in its [groups](/tenant/docs/fleet/approvals#groups), and `--delete-scheme` takes it out of every one. Otherwise a new machine under an old name starts clean.

To use a revoked machine again, uninstall it and enroll it anew, or give it a code with `tenant child rehome`.

## Uninstalling

`tenant child uninstall` (from an elevated terminal, as the child is the machine's own) removes the service, the machine's key and `child.json`, and the child's working files. It keeps the audit log, the record of what the master did on this machine. Revoke the machine on the master too.
