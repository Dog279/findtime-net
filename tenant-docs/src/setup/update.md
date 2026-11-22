---
title: Update &amp; roll back
description: tenant update moves an install to the latest release with a verified download, a pre-update backup and a way back.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

## Commands

```bash
tenant update --check                            # one line: running vs latest; exit 10 when an update exists
tenant update [--version vX.Y.Z] [--yes] [--now] [--force]
tenant update --rollback                         # put the previous binary back
```

| Flag | Effect |
|---|---|
| `--check` | look only; nothing changes |
| `--version vX.Y.Z` | install that release instead of the latest |
| `--yes` | skip the confirmation prompt |
| `--now` | restart the service without waiting for the running turn |
| `--force` | proceed past a warning (a version that is not newer, an unfinished previous update), or update a development build |
| `--rollback` | swap `tenant.prev` back in and print the data-restore command |

`TENANT_UPDATE_REPO=owner/name` points the check at another repository (a fork, or a private mirror).

## What an update does

1. Downloads the release archive for this OS and CPU, checks the project key's signature when this binary carries the key (see below), verifies the archive's SHA-256 against `checksums.txt`, and verifies the cosign signature when `cosign` is on `PATH`.
2. On macOS, signs the new binary with the hardened runtime before it first runs. If that fails, nothing has changed and the running version stays.
3. Runs the new binary's `version --protection` before touching anything, and asks about each [process protection](/tenant/docs/setup/process-protection) the new version cannot apply on this system and nobody has acknowledged for it (`Continue without it? [y/N]`). `--yes` does not answer this question. With no terminal, the update stops here, exits 2 and the running version keeps running; run `tenant update` at a terminal once to acknowledge it.
4. Asks whether to update (unless `--yes`).
5. Writes an unencrypted backup of the config and data dirs to `<data>-backups/pre-update-<old version>.tenant-backup`. Credentials are left out; the previous pre-update backup is replaced.
6. Swaps the binary in with no gap, keeping the old one as `tenant.prev` beside it.
7. Restarts the service (`tenant service restart`, which waits for the running turn unless `--now`).
8. Polls `/api/status` for up to 90 seconds until it reports the new version. If it never does, the old binary goes back and the service is restarted again.

A dev build (one built from source without release stamping) refuses to update unless you pass `--force`. Nothing is ever applied automatically: serve checks for a newer release once a day and files one log-book event per new tag, which `"update_check": false` in `config.json` turns off.

## Signatures

A release carries up to two signatures over `checksums.txt`: `checksums.txt.sigstore.json`, a keyless cosign signature made by the release workflow, and `checksums.txt.sig`, an Ed25519 signature made with the project's key. The public half of that key is built into the release binaries of the main repository, and checking it needs nothing installed.

- **A binary that carries the key** takes only a release whose `checksums.txt.sig` verifies under it. A missing, malformed or wrong signature refuses the update and changes nothing, and no flag skips it. When `cosign` is installed it is checked as well, and then both must pass.
- **A fork's binaries** carry no key. For them `checksums.txt.sig` is not looked at, and the update checks the SHA-256 and, with `cosign` on `PATH`, the cosign signature, as before. Development builds carry no key either (and refuse to update without `--force`).

The update prints which checks passed, for example `verified checksum and the project key's signature (install cosign to verify the release workflow's signature as well)`.

## Rolling back

Schemas move forward only: once a new version has migrated a store, the old binary alone is not enough, and the log book refuses a database written by a newer version. Rollback is the old binary plus the pre-update backup, restored by hand:

```bash
tenant update --rollback
tenant service stop && tenant backup restore "<data>-backups/pre-update-<old version>.tenant-backup" --yes && tenant service start
```

An OS stop in the middle of an update leaves `<data>/update-state.json`: serve logs it at boot, `tenant doctor` warns, and the next `tenant update` clears it when the new version is what runs, or offers `--rollback`.
