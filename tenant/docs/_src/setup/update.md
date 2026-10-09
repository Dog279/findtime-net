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
| `--force` | proceed past a warning (a version that is not newer, an unfinished previous update) |
| `--rollback` | swap `tenant.prev` back in and print the data-restore command |

`TENANT_UPDATE_REPO=owner/name` points the check at another repository (a fork, or a private mirror).

## What an update does

1. Downloads the release archive for this OS and CPU, verifies its SHA-256 against `checksums.txt`, and verifies the cosign signature when `cosign` is on `PATH`.
2. Runs the new binary's `version` before touching anything.
3. Asks (unless `--yes`).
4. Writes an unencrypted backup of the config and data dirs to `<data>-backups/pre-update-<old version>.tenant-backup`. Credentials are left out; the previous pre-update backup is replaced.
5. Swaps the binary in with no gap, keeping the old one as `tenant.prev` beside it.
6. Restarts the service (`tenant service restart`, which waits for the running turn unless `--now`).
7. Polls `/api/status` for up to 90 seconds until it reports the new version. If it never does, the old binary goes back and the service is restarted again.

A dev build (one built from source without release stamping) refuses to update. Nothing is ever applied automatically: serve checks for a newer release once a day and files one log-book event per new tag, which `"update_check": false` in `config.json` turns off.

## Rolling back

Schemas move forward only: once a new version has migrated a store, the old binary alone is not enough, and the log book refuses a database written by a newer version. Rollback is the old binary plus the pre-update backup, restored by hand:

```bash
tenant update --rollback
tenant service stop && tenant backup restore "<data>-backups/pre-update-<old version>.tenant-backup" --yes && tenant service start
```

An OS stop in the middle of an update leaves `<data>/update-state.json`: serve logs it at boot, `tenant doctor` warns, and the next `tenant update` clears it when the new version is what runs, or offers `--rollback`.
