---
title: A machine's memory
description: The master keeps a memory for each fleet machine, encrypted on its own disk and copied, encrypted, to the machine. What goes into it, how it comes back into a conversation, the keys that protect it, and how forget reaches it.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

Each fleet machine has a memory of its own, kept by the master. A child has no memory it can read: it only stores encrypted copies for its master.

## Where it lives

| Where | What |
|---|---|
| The master's RAM | the machine's memory while the master works with it |
| The master's disk, under `<data>/fleet/` | only an encrypted snapshot of it |
| The machine, in the `memory` folder of its child directory | the last three copies, encrypted; the machine cannot read them |

Every five minutes a memory that changed becomes a new generation, encrypted to the fleet key and to the recovery key, and goes to the machine.

Each time a machine connects, the two sides compare. The newer copy wins, so a machine's copy rebuilds a master that lost or damaged its own. A copy made under another fleet key marks the machine **needs recovery key**, and nothing is overwritten. A memory that was replaced is kept aside on the master for thirty days.

Every snapshot ends with an authenticator that only the fleet key's secret can make. A copy that names this master's key and does not carry it is refused unread, so knowing the public half of the fleet key or of the recovery key is not enough to put a memory on the master.

`/fleet`, `tenant fleet show <name>`, the dashboard's Fleet page and `tenant doctor` say each machine's memory: in step, behind, needs recovery key, or not known, with the reason.

## The two keys

**The fleet key** is made by `tenant fleet init`, in the master's config directory (`<config>/fleet-key`). On Windows it is sealed by the system's data protection; elsewhere it is an owner-only file. Every machine's memory is encrypted to it.

**The recovery identity** is shown once by `tenant fleet init` at a terminal (or by `/fleet init`, which hands the terminal over for that step; never by the dashboard) and recorded only after you have typed it back ([Set up a fleet](/tenant/docs/fleet/setup)). Tenant keeps only its public half. Keep the identity itself away from the master, in a password manager or on paper: with it, and only with it, a master rebuilt from nothing, or restored from a plain backup, can read its machines' memory again (`tenant fleet recover`, in [Update, move and recover](/tenant/docs/fleet/updates)). Kept on the master, it would be lost with the master.

`tenant doctor` checks the fleet key (and that it is held in memory kept out of the swap file) and that the recovery key was proven. A recovery key that was never proven names `tenant fleet init`, which asks at a terminal for the identity you kept.

## What goes into a machine's memory

- **The turns that worked on it.** A turn's episode stays in the master's memory, tagged with the machines it worked on. Each of those machines gets the request and its own calls with what came back. Never another machine's output, the agent's answer, or the master's own memory.
- **An inventory.** At confirmation the master records the machine's OS, account, version, sandbox and ceiling as facts, each from a field it checked.
- **Notes.** `fleet_note` records a fact about a machine in the agent's own words: one sentence, at most 1000 characters. Nothing is sent to the machine. A note that quotes a machine's output asks first.
- **Distilled facts.** Distillation runs over each machine's own turns, into that machine's facts.

A machine's memory needs an embedder on the master, as the master's own memory does ([Memory &amp; soul](/tenant/docs/first-launch/memory)).

## How it comes back into a conversation

A machine's memory comes into a conversation with the first answer from that machine there. After that, `memory_search` takes a `host` to search that machine's memory.

What is recalled has two parts. The master's own records (the inventory, notes) are quoted lines. Everything else came from the machine and is shown inside that machine's frame, escaped and labelled untrusted, so the egress check covers it as it covers a live result ([Approvals on fleet machines](/tenant/docs/fleet/approvals)).

A relay or a cron job that may not reach a machine gets none of its memory. Neither does a helper, team, research or goal run, which has no fleet tools.

## Forget

`tenant privacy forget` reaches every machine's memory. The Tenant that holds the fleet deletes what is forgotten from each machine's memory and from the memory kept aside, sends the machine a new copy, and tells it to delete its older ones. A machine that is offline is told when it is back. A memory later rebuilt from a copy older than the forget has it applied again.

The request names what is forgotten, so it is kept sealed to the fleet key and the recovery key. It is kept until every machine still in the fleet has had it, has dropped its older copies and keeps no copy under another fleet key; then it is deleted.

The limits, stated plainly:

- **A machine restored from an older backup.** Once the request is deleted, a copy older than the forget that comes back (from a backup of the machine's own disk) is not purged. If the master then loses its own memory of that machine while that copy is the machine's newest, the memory is rebuilt from it and holds what was forgotten. Forget again then.
- **Copies under another fleet key** are not deleted by a forget, and you are told. Delete them on the machine, in the `memory` folder of its child directory.
- Retention pruning does not reach the machines' memory.

[Privacy &amp; retention](/tenant/docs/setup/privacy) covers forget on the master itself.

## Backups

- A master restored from an **encrypted** `tenant backup` has its certificate, `fleet.json` and the fleet key back. Its machines reconnect by themselves, and their memory is read as before.
- A **plain** backup leaves those out, and `tenant backup` warns when it makes one on a fleet master. A master restored from it, or rebuilt from nothing, is a stranger to its machines: re-home each one, then bring the recovery identity ([Update, move and recover](/tenant/docs/fleet/updates)).

Use encrypted backups on a master ([Backup &amp; restore](/tenant/docs/setup/backup)). `tenant fleet revoke <name> --delete-scheme` deletes that machine's memory as well.
