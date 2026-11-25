---
title: Update, move and recover
description: Update fleet machines over their links, choose whose word a machine takes for an update, move a machine to a new master, and read its memory again after the master was lost.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

## Updating machines

```bash
tenant fleet update <name> | --all | --group <group> [--version vX.Y.Z] [--allow-older]
```

| Flag | Effect |
|---|---|
| `--all` | every confirmed machine, one after the other |
| `--group <group>` | every member of that group, one after the other ([Groups](/tenant/docs/fleet/approvals#groups)) |
| `--version vX.Y.Z` | that release instead of the latest |
| `--allow-older` | send a version older than the machine runs |
| `--arch ARCH` | the machine's processor, `amd64` or `arm64`, for a machine too old to report it |
| `--hub ADDR` | the running Tenant's dashboard address, when it is not where `config.json` says |

The command asks the running Tenant that holds the fleet, through its dashboard, since that Tenant has the links. It fetches the release for the machine's system and processor into `<data>/fleet-updates/`, verifies it as [`tenant update`](/tenant/docs/setup/update) verifies its own, and sends it over the link with its SHA-256. The machine needs no way to the internet.

On the dashboard, a machine's page on the Fleet page has **Update this machine**, with a version (empty for the latest) and a box to allow an older one.

Each step is printed, and how it ended: back on the new version, rolled back (with the machine's reason), refused, or failed. An offline machine is refused; nothing is queued. `--all` and `--group` update one machine after the other and go on past a failure. The exit status is 0 only when every machine runs the version asked for.

### A rollout: many machines, a few at a time

On the dashboard's Fleet page, tick machines (or narrow the list to a group and choose everyone shown), pick **Update**, a version (empty is the latest release) and how many update at once, 1 to 8. The page first says how many machines it will update and names them, with those it leaves out and why (pending, revoked, offline: nothing is queued). After the second button, the running Tenant that holds the fleet starts that many machines, in the list's order, and starts the next each time one ends:

- a machine that ends **done** is updated;
- a machine that is **refused** (offline, not confirmed, the same or a newer version without "allow older") is skipped with its reason, and the rollout goes on;
- the first machine that **rolls back or fails stops the rollout**: no further machine is started, those already updating finish, and the rest show as not started.

The Fleet page shows the rollout while it runs and afterwards (reload it): each machine as waiting, its live stage, done, skipped and why, rolled back, failed or not started. **Stop** starts no more machines; those updating finish. The rollout also stops when the fleet port goes down or another process takes the fleet: it starts nothing over links it no longer holds.

One rollout runs at a time. It is kept in the running Tenant's memory: a restart of the master forgets it, though each machine still finishes or rolls back by itself. A rollout takes a signed-in browser; the API key cannot start or stop one.

## What the machine does

1. It writes the archive to `<dir>-data/update/` (a dropped link resumes there) and touches nothing else until the archive is whole and hashes right.
2. It unpacks the new binary beside the installed one. On macOS it signs that binary with the hardened runtime first, as `tenant update` does; if signing fails, the update is refused and nothing has changed. Then it runs the new binary once with `version`.
3. It drops its link and its background commands, and runs the new binary as a trial, beside the old one.
4. When the trial reaches the master, the child stops it, swaps the binaries (the old one stays as `tenant.prev`), and restarts into the new one.
5. If the new version does not reach the master by the deadline, the machine puts the old binary back itself. A trial that exits, or does not reach the master within a minute, is deleted, and the machine reconnects on the old version.

A machine stopped in the middle finishes or undoes the update at its next start. Background commands on the machine end at the restart. `tenant child status` on the machine shows the last update, and an update in progress.

## Whose word a machine takes

### The default: `release`

By default a machine installs only a release it verified itself. With the archive, the master first sends the release's `checksums.txt` and its signatures. The machine, with no network:

1. checks that the archive's name is its own system's and processor's, for the version named;
2. verifies the signature over `checksums.txt`:
   - when its own binary carries the project key and the master sent the project signature (`checksums.txt.sig`), with that key, and nothing needs to be installed. A project signature that is sent and does not verify refuses the update at once;
   - otherwise with `cosign verify-blob --offline`, against the release workflow of the repository its own binary was built from (never a name the master gives it);
3. checks that the verified checksums list the archive with the SHA-256 the master named, and then the whole archive against that hash.

Anything that does not hold is refused before the archive is sent, and the master shows the machine's reason. So a master, or a master's disk, that changed an archive cannot install it. `tenant fleet update` says which check each machine passed.

What it needs:

- `cosign` on the machine's `PATH`, or a binary that carries the project key (the main project's release binaries do; a fork's do not);
- a release that carries the matching signature;
- a release build of Tenant on the machine. A development build names no release and refuses every update under this rule; its `tenant child status` says so.

Downgrades are refused on the master unless `--allow-older`. A signed older release is still a genuine release, and a machine on this rule takes it. [Update &amp; roll back](/tenant/docs/setup/update) and the project's `SECURITY.md` describe the two signatures.

### `master`: take the master's hash

To run a build of your own on a machine, set it to take its master's hash instead:

```bash
tenant child install --updates master   # at enrollment
tenant child updates master             # later, on the machine, with its child stopped
tenant child updates release            # back to the default
tenant child updates                    # which rule is in force
```

Under `master` the machine checks the archive only against the SHA-256 sent with it. **Whoever controls the master, or can change files on its disk, can then install any program on that machine**, with the rights its child runs with.

The rule is kept in `child.json` (`"updates": "master"`). It is set only on the machine, never over the link; a change is a record in the machine's audit log; `tenant child rehome` keeps it; `tenant child status` shows it. A machine running a Tenant from before machines verified releases takes its master's hash.

## Move a machine to another master

A master restored from an encrypted backup needs nothing: its machines reconnect. A master restored from a plain backup, or rebuilt from nothing, is a stranger to them: `tenant child status` on each says the master rejected it, or offline. Re-home each machine:

```bash
# on the new master
tenant fleet init                 # at a terminal: a new fleet key and recovery identity
tenant fleet enroll web1          # a one-time code

# on the machine, with its child stopped (its service, or the tenant child run holding it)
printf '%s\n' '<code>' | tenant child rehome     # or TENANT_ENROLL_CODE='<code>' tenant child rehome
#   add --system, from an elevated shell, for the machine's own child
# start its child again, then on the new master:
tenant fleet confirm web1         # the six digits rehome printed
```

`rehome` is enrollment with the key the machine already has. It changes only which master the machine trusts, in one step; its key, ceiling, tool list, sandbox, secret list, pause, update rule, audit log and memory copies stay. It refuses, with nothing changed, while a child process runs on the directory, and a code that does not enroll leaves the machine with its old master. Afterwards the old master's certificate is refused. The audit log records the account and both masters' fingerprints. Nothing on the link, no tool and no command on the master can make a machine re-home.

## Recover a machine's memory

A re-homed machine's copies were sealed to the old fleet's keys, so the new master shows its memory as **needs recovery key** and reads none of it. Bring the old fleet's recovery identity:

```bash
tenant fleet recover <name> [--was ID]
```

`--was` is the id the machine had under the old master (`rehome` prints it). The identity is read at the terminal without being shown, or from standard input; never from an argument. The running Tenant that holds the fleet reads the machine's newest copy with it, makes it the machine's memory, and sends it back under the new key. The old copies stay on the machine. `--hub ADDR` names the running Tenant when it is not where `config.json` says; the command sends the identity over plain http only to this computer, and otherwise only to an `https://` address. Without `--was`, the same command reads a machine's memory after the master's fleet key file was replaced.

What a recovered copy says the master recorded (the inventory, notes) cannot be checked, since the old fleet's secret is gone. It is recalled from then on as the machine's own words, inside its frame, and the new master takes the machine's inventory again. Look at those records before relying on them.

## What doctor shows

On a master, [`tenant doctor`](/tenant/docs/first-launch/doctor) has one line per machine that is not revoked, from the running Tenant that holds the fleet (it says so when there is none to ask): whether the machine is reachable, its version against the master's, whether the master still serves its link version, how its last update went, and its memory, with the command to run when it needs the recovery key. A machine still waiting for confirmation is a warning. The `fleet memory keys` line checks the fleet key and the recovery key.
