---
title: Update, move and recover
description: Update fleet machines over their links, choose whose word a machine takes for an update, move a machine to a new master, and read its memory again after the master was lost.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

## Updating machines

```bash
tenant fleet update <name> | --all | --group <group> [--version vX.Y.Z | --build ARCHIVE] [--allow-older]
```

| Flag | Effect |
|---|---|
| `--all` | every confirmed machine, one after the other |
| `--group <group>` | every member of that group, one after the other ([Groups](/tenant/docs/fleet/approvals#groups)) |
| `--version vX.Y.Z` | that release instead of the latest |
| `--build ARCHIVE` | send this archive, a build of your own, in place of a release ([Sending a build of your own](#sending-a-build-of-your-own)). Not with `--version` |
| `--allow-older` | send a version older than the machine runs |
| `--arch ARCH` | the machine's processor, `amd64` or `arm64`, for a machine too old to report it |
| `--hub ADDR` | the running Tenant's dashboard address, when it is not where `config.json` says |

The command asks the running Tenant that holds the fleet, through its dashboard, since that Tenant has the links. It fetches the release for the machine's system and processor into `<data>/fleet-updates/`, verifies it as [`tenant update`](/tenant/docs/setup/update) verifies its own, and sends it over the link with its SHA-256. The machine needs no way to the internet.

On the dashboard, a machine's page on the Fleet page has **Update this machine**, with a version (empty for the latest) and a box to allow an older one.

Each step is printed, and how it ended: back on the new version, rolled back (with the machine's reason), refused, or failed. An offline machine is refused; nothing is queued. `--all` and `--group` update one machine after the other and go on past a failure. The exit status is 0 only when every machine runs the version asked for.

Versions are ordered as semantic versioning orders them: one release candidate before the next (`0.3.0-rc.1`, then `0.3.0-rc.2`), and both before the release (`0.3.0`). A machine that already runs the version asked for is sent nothing, and one asked to take an older version is refused unless `--allow-older`.

### Calls while a machine updates

A machine can be updated while the agent works on it. From the moment the machine says it is applying the update:

- **The calls it is running finish first.** The machine gives them up to 2 minutes before it drops its link. A call still running then ends with the restart, and its outcome is not known.
- **New calls to it are not sent.** The master keeps them back until the machine is linked again and says how the update went, done or rolled back, and then makes them: on the new version, or on the old one after a rollback. A call waits at most 7 minutes this way; after that it is made, and fails as offline if the machine is still away. A call whose own time limit ends while it waits fails, and says it was not sent.
- **Background commands and the machine's browser still end at the restart.**

Each call that waited is in the fleet log (`fleet/1206`) with how long it waited.

Both halves need a Tenant that does this: the master's to keep calls back, the machine's to let its running calls finish. A machine on an older Tenant drops its link a second after it has the update, so the update that first brings a machine to such a version can still cut off a call that is running. Calls are kept back by the Tenant that watched the update start: one that restarts in the middle keeps none back ([When the master restarts](#when-the-master-restarts)).

### A rollout: many machines, a few at a time

On the dashboard's Fleet page, tick machines (or narrow the list to a group and choose everyone shown), pick **Update**, a version (empty is the latest release) and how many update at once, 1 to 8. The page first says how many machines it will update and names them, with those it leaves out and why (pending, revoked, offline: nothing is queued). After the second button, the running Tenant that holds the fleet starts that many machines, in the list's order, and starts the next each time one ends:

- a machine that ends **done** is updated; one that already runs the version asked for counts as done, and nothing is sent to it;
- a machine that is **refused** (offline, not confirmed, or the version asked for is older than the one it runs and "allow an older version" is not ticked) is skipped with its reason, and the rollout goes on;
- the first machine that **rolls back or fails stops the rollout**: no further machine is started, those already updating finish, and the rest show as not started.

The Fleet page shows the rollout while it runs and afterwards (reload it): each machine as waiting, its live stage, done, skipped and why, rolled back, failed or not started. **Stop** starts no more machines; those updating finish. The rollout also stops when the fleet port goes down or another process takes the fleet: it starts nothing over links it no longer holds.

One rollout runs at a time. A rollout takes a signed-in browser; the API key cannot start or stop one.

### How each machine's last update went

The Fleet page has one card, **Updates**, with a row for each machine shown:

| Column | What it says |
|---|---|
| **Version** | the version the machine reports, in quotes as its own words |
| **Last update** | the version this Tenant last sent it, or "none sent from this Tenant" |
| **When** | when that update ended, or started if it is still running |
| **How it went** | **done**; **rolled back**, with the machine's reason; **failed**, with the reason; **refused**; or the stage of an update that is running |

A machine that took an update, never said how it went and has no link now shows **has not redialled since** and a time: when its link ended, or, when that was before this Tenant started, when the update was last written down. What the machine says when it links again is recorded then, however much later: "the machine linked again: back on the new version 1.4.0", or "the machine linked again: rolled back to "1.3.2"" with its reason. A machine's own page says the same in its **Update** card, with every line of the update. A rollout that stopped at a machine because it said nothing in time shows that machine as "failed, then done" or "failed, then rolled back" once it has said.

A machine keeps its word about its last update until the next one starts its trial run. On a second try at a version that rolled back before, a machine that links in between still says what became of the first try. That word is not taken for the new try's: the master notes the time on the word the machine has when an update starts, by the machine's own clock, and takes only a later one as that update's.

### When the master restarts

The Tenant that holds the fleet writes the rollout and each machine's last update to `fleet-updates.json` in its [data folder](/tenant/docs/setup/directories) at every step, and reads it back when it starts. So the Fleet page shows the last rollout and each machine's last update after a restart too. A file that does not read does not stop the master: it is logged, treated as no record, and replaced at the next update.

**A rollout that was running is not taken up again.** It is closed where it stood, the status feed says so, and the Fleet page shows each machine:

- **done**, skipped, rolled back or failed, as recorded before the restart;
- **interrupted**: its update was under way. What became of it is filled in from the machine's own word on its next link ("interrupted, then done", "interrupted, then rolled back");
- **not started**: nothing was sent to it.

Nothing is sent to any machine because of the restart. To finish, start a new rollout over the same machines: one that already runs the version counts as done and is sent nothing.

Before the new rollout, give the machines shown as interrupted a few minutes to link again and say how their update went. A machine has one record, its last update, and an update sent to it replaces that record. Sent while the interrupted one is still unsettled, the new update takes its place, and how the interrupted one went may never be recorded: if the latest release has moved since, a machine that is still applying the first refuses the new archive, and that refusal is all its record then says. The machine itself finishes the first update or rolls it back all the same, and the version it reports says which.

An update that was under way is ended in the record by how far it had got:

| It was | The record says | On the machine |
|---|---|---|
| fetching the release | failed: this Tenant stopped before anything was sent | nothing changed |
| sending the archive | failed: this Tenant stopped while the archive was on its way | most likely nothing changed, and an update sent again goes on from what arrived. If the machine did have all of it, it goes on by itself, and its word on its next link corrects the record |
| being applied by the machine | failed, until the machine says how it went | the machine goes on by itself: it comes back on the new version, or puts the old one back |

The machines need nothing: each redials by itself, waiting from one second up to a minute between tries, and is online as soon as its link is made.

Run fleet updates from one Tenant on a data folder. Two Tenants on one data folder (serve and the terminal app) write the same file with nothing to keep them apart: the one that writes last wins, and one that takes the fleet from another that is still running reports that other's rollout as cut short. Start a rollout or an update from one Tenant, and let that one keep the fleet until every machine has said how it went.

## What the machine does

1. It writes the archive to `<dir>-data/update/` (a dropped link resumes there) and touches nothing else until the archive is whole and hashes right.
2. It unpacks the new binary beside the installed one. On macOS it signs that binary with the hardened runtime first, as `tenant update` does; if signing fails, the update is refused and nothing has changed. Then it runs the new binary once with `version`.
3. It lets the calls it is running finish, for up to 2 minutes ([Calls while a machine updates](#calls-while-a-machine-updates)). Then it drops its link and its background commands, and runs the new binary as a trial, beside the old one.
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

### Sending a build of your own

Between releases, a machine set to `master` can be sent what you built yourself. Build and pack it from a checkout of Tenant's repository, with Go installed:

```bash
go run ./scripts/devbuild                        # for the computer you are on
go run ./scripts/devbuild darwin/arm64           # for another system and processor
go run ./scripts/devbuild linux/amd64 windows/amd64
go run ./scripts/devbuild all                    # the six targets a release has
go run ./scripts/devbuild -o DIR darwin/arm64    # into DIR, not dist/dev
```

The targets are `linux`, `darwin` and `windows`, each for `amd64` and `arm64`. Each one becomes an archive in `dist/dev/` of the checkout, named as a release's archive is, under a development version of its own:

```
<the last release's numbers>-dev.<UTC time of the build>.<commit>[.dirty]
```

For example `0.3.0-dev.20261126193000.e56d774`. The time makes every build a version of its own, the commit says what it was built from, and `.dirty` marks a tree whose code had changes that were not committed. That version is what the machine then reports: in `tenant fleet show`, on the Fleet page, and from `tenant version` on the machine.

Then, on the master, with the archive on the master's own disk:

```bash
tenant fleet update web1 --build dist/dev/tenant_0.3.0-dev.20261126193000.e56d774_linux_x86_64.tar.gz
```

```
web1: sending tenant_0.3.0-dev.20261126193000.e56d774_linux_x86_64.tar.gz (14.8 MB): a build this Tenant was handed, which no release vouches for
web1: the machine is set to trust this master's hash (`updates master` on the machine): it checks the archive against the SHA-256 sent with it, not against a signature
web1: sent 14.8 MB; the machine checked its SHA-256 and is applying it. The calls it is running finish first, and new ones wait until it is back. Its background commands end at the restart
web1: the new version reached the master in its trial run; the machine is putting it in place
web1: back on the new version 0.3.0-dev.20261126193000.e56d774
```

- **Nothing is fetched and nothing is verified on the master.** The archive's name says its version, system and processor, and the master sends the archive's SHA-256 with it. An archive that is not named as a build's is refused, and so is a build for another system or processor than the machine's, before anything is sent.
- **The machine does what it does with a release.** It checks the hash, runs the binary once to see that it runs there and says the version it was sent as, runs it on trial, and rolls back by itself if the trial does not reach the master ([What the machine does](#what-the-machine-does)).
- **A machine on the default rule refuses a build** on the first piece, before any of the archive is sent: no release vouches for it. The command says so, and names what to set on the machine.
- **The archive has to be on the master's own disk.** The command checks that the file is there, and the running Tenant that holds the fleet then reads it itself.
- **`--version` does not go with `--build`, and `--allow-older` is not asked for.** Builds are not ordered against what a machine runs: one is sent unless the machine already reports that very version.
- **A release still updates over a build.** A development version sorts before the release candidates of the same numbers, so no `--allow-older` is needed for the next release. [`tenant update`](/tenant/docs/setup/update) on a computer that runs a build leaves it alone unless forced.

A build is sent from the command line. The Fleet page's **Update this machine** form and its rollouts send releases.

## Move a machine to another master

A master restored from an encrypted backup needs nothing: its machines reconnect. A master restored from a plain backup, or rebuilt from nothing, is a stranger to them: `tenant child status` on each says the master rejected it, or offline. Re-home each machine:

```bash
# on the new master
tenant fleet init                 # at a terminal: a new fleet key and recovery identity
tenant fleet enroll web1          # a one-time code

# on the machine, with its child stopped (its service, or the tenant child run holding it)
printf '%s\n' '<code>' | tenant child rehome     # or TENANT_ENROLL_CODE='<code>' tenant child rehome
#   from a root shell or a PowerShell run as administrator: the child is the machine's own
# start its child again, then on the new master:
tenant fleet confirm web1         # only with the six digits on: the digits rehome printed
```

`rehome` is enrollment with the key the machine already has. It changes only which master the machine trusts, in one step; its key, ceiling, tool list, sandbox, secret list, pause, update rule, audit log and memory copies stay. It refuses, with nothing changed, while a child process runs on the directory, and a code that does not enroll leaves the machine with its old master. The new master confirms the machine by its code or, with [the six digits](/tenant/docs/fleet/setup#the-six-digits-as-a-second-step) on, holds it as pending until you type them, as for any new machine. Afterwards the old master's certificate is refused. The audit log records the account and both masters' fingerprints. Nothing on the link, no tool and no command on the master can make a machine re-home.

## Recover a machine's memory

A re-homed machine's copies were sealed to the old fleet's keys, so the new master shows its memory as **needs recovery key** and reads none of it. Bring the old fleet's recovery identity:

```bash
tenant fleet recover <name> [--was ID]
```

`--was` is the id the machine had under the old master (`rehome` prints it). The identity is read at the terminal without being shown, or from standard input; never from an argument. The running Tenant that holds the fleet reads the machine's newest copy with it, makes it the machine's memory, and sends it back under the new key. The old copies stay on the machine. `--hub ADDR` names the running Tenant when it is not where `config.json` says; the command sends the identity over plain http only to this computer, and otherwise only to an `https://` address. Without `--was`, the same command reads a machine's memory after the master's fleet key file was replaced.

What a recovered copy says the master recorded (the inventory, notes) cannot be checked, since the old fleet's secret is gone. It is recalled from then on as the machine's own words, inside its frame, and the new master takes the machine's inventory again. Look at those records before relying on them.

## What doctor shows

On a master, [`tenant doctor`](/tenant/docs/first-launch/doctor) has one line per machine that is not revoked, from the running Tenant that holds the fleet (it says so when there is none to ask): whether the machine is reachable, its version against the master's, whether the master still serves its link version, how its last update went, and its memory, with the command to run when it needs the recovery key. A machine still waiting for confirmation is a warning. The `fleet memory keys` line checks the fleet key and the recovery key.
