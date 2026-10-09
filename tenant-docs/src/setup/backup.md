---
title: Backup &amp; restore
description: One file holds every store, the archive and your config. Verify it end to end; restore it anywhere.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

## Commands

```bash
tenant backup [create] [--out FILE|DIR] [--encrypt] [--recipient age1…] [--include-mirror] [--json]
tenant backup verify FILE [--json]
tenant backup restore FILE [--dry-run] [--yes] [--force] [--identity FILE]
```

| Flag | Applies to | Effect |
|---|---|---|
| `--out FILE\|DIR` | create | the backup file, or a directory to put it in (default: the current directory, named `tenant-backup-<date>-<time>.tar.gz`) |
| `--encrypt` | create | encrypt with a passphrase; the file gets `.age` and **carries `credentials.json`** |
| `--passphrase-file FILE` | create, restore | read the passphrase from a file instead of the prompt |
| `--recipient age1…` | create | encrypt to an [age](https://age-encryption.org) public key (repeatable); also carries credentials |
| `--recipients-file FILE` | create | one age recipient per line |
| `--identity FILE` | verify, restore | the age identity that decrypts a recipient-encrypted backup |
| `--include-mirror` | create | also take the log book's text files; `logbook.db` already holds the same events |
| `--json` | all | machine-readable result |
| `--dry-run` | restore | verify the backup beside the live dirs and report; change nothing |
| `--yes` | restore | do not ask for confirmation |
| `--force` | restore | restore a backup made by a newer Tenant |

## What is in a backup

A tar.gz with `MANIFEST.json` first, then the config dir and the data dir: every SQLite store, the archive, the log book, research, the soul, `config.json` and `settings.<agent>.json`. The backup is consistent even while Tenant runs: it holds the data-dir lock shared, so a command cannot restore underneath it, and copies the databases through SQLite's backup API.

**Credentials are left out of an unencrypted backup.** An encrypted one (`--encrypt` or `--recipient`) carries `credentials.json` too, so a restore on another machine is complete.

`verify` checks every checksum in the manifest, opens every database and runs its integrity check, checks every log and schema. `restore` verifies first, then swaps the directories in, keeping the replaced ones beside them; it takes the data-dir lock exclusively, so stop the service first:

```bash
tenant service stop
tenant backup restore tenant-backup-20261008-090000.tar.gz --yes
tenant service start
```

## Related

- `tenant update` writes `<data>-backups/pre-update-<version>.tenant-backup` on its own before every upgrade.
- `tenant privacy export --out DIR` writes everything as readable files (JSONL, Markdown) rather than a restorable archive. See [Privacy &amp; retention](/tenant/docs/setup/privacy).
