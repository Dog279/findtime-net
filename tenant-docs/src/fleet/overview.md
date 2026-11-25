---
title: What a fleet is
description: One Tenant, the master, works on the other machines you own. Each of them runs the same binary as a child that serves its tools to the master's agent, and every approval is decided on the master.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

A **fleet** is one Tenant that owns other machines of yours. That Tenant is the **master**: it has the model, the agent, the memory, the dashboard and your approvals. Each other machine runs the same `tenant` binary as a **child**.

## What a child is

A child is `tenant child run`, installed as a service by `tenant child install`. It has no model, no agent loop and no dashboard. It dials the master, holds one link open, and serves that machine's tools to the master's agent: commands, files, and whatever else it is set up to serve (its browser, SQL, the wiki, local MCP servers).

- The child always dials the master. The master never dials a machine, so only the master needs to be reachable, on one port.
- The link is TLS 1.3 with both certificates pinned by fingerprint: no certificate authority and no token. A certificate that is not pinned is dropped before anything is answered.
- Idle, a link carries one ping and its answer every 30 seconds. A link that misses two pings is given up on, so a dead link is noticed within a minute, and the child dials again by itself.
- A call to a machine that is offline fails at once. Nothing is queued.

A child does not think and does not decide. It runs what the master's agent asks for, within the limits the machine sets on itself ([On a fleet machine](/tenant/docs/fleet/machines)).

## Fleet or peering

Peering (`tenant peer`) is a separate feature and is unchanged by the fleet.

| | Fleet child | Peer |
|---|---|---|
| Who runs it | you, the same person who runs the master | another operator |
| Model and agent | none: the master's agent does the work | a full Tenant of its own |
| Approvals | decided on the master | decided on the machine that runs the action |

A machine is a peer or a child, never both.

## The trust model

- **Approvals are decided on the master.** A tool on a child that needs an approval asks the master over the link, and you answer there. Each machine has its own approval scheme ([Approvals on fleet machines](/tenant/docs/fleet/approvals)).
- **Whoever controls the master controls every child**, with the rights each child was installed with. The master's data and config directories, its dashboard sign-in and its relays are the keys to the fleet. Protect the master accordingly.
- **What a machine returns is untrusted.** Command output, file contents, and what a machine says about itself (its OS, account, version) are that machine's words. The master's agent gets them framed and labelled as untrusted data, never instructions.
- **A machine limits itself.** Its `child.json` holds a ceiling that the master cannot lift, and every call is written to an audit log on the machine before it runs.

Run the master as `tenant serve`, as its service (`tenant service install`), so its machines stay connected. A terminal app alone holds the fleet only while it is open. One process holds the links; another process on the same directories says which one does.

## An install with no fleet

Nothing of the fleet is active until you ask for it:

- The fleet port is off until this Tenant is made a master (`tenant fleet init`, `/fleet init` in the terminal app, or **Set up the fleet** on the dashboard). After that it listens on `fleet.listen` in `config.json` (default `0.0.0.0:9777`), and nothing answers on it but the pinned link and the enroll endpoint.
- The `fleet_*` tools are registered only while a confirmed machine exists. With none, the agent has no fleet tools and is told about no machines.
- A relay (Discord, iMessage) or a cron job reaches no machine, reads included, until you open it.

## What the agent gets

Once a confirmed machine exists, the agent's context has one line per machine (name, OS, online or not) and these tools, each of which takes a `host`, the machine's name:

| Tool | On the machine |
|---|---|
| `fleet_list` | the machines: OS, the account Tenant runs as there, online or offline and since when |
| `fleet_exec`, `fleet_process` | run a shell command; the commands it left running in the background |
| `fleet_read`, `fleet_list_dir` | read a text file, list a folder; the machine refuses its secret files |
| `fleet_write`, `fleet_edit`, `fleet_copy` | change a text file; copy one text file between the master and the machine |
| `fleet_tools`, `fleet_call` | the other tools the machine serves, and a call to one of them |
| `fleet_note` | record a fact about the machine in its memory; nothing is sent to the machine |

A picture a tool makes on a machine (a screenshot, an image file it reads) stays on that machine: the link carries text, and the result says so. Helpers, teams, research and goal runs do not get the fleet tools. [Built-in tools](/tenant/docs/mcp/built-in-tools) lists their arguments.

## The fleet log

The master's fleet has a log of its own, `fleet`. It starts the moment a Tenant becomes a master; a Tenant with no fleet has none.

```bash
tenant logs query log:fleet
```

The same is `/logs log:fleet` in the terminal UI and the **Logs** page of the dashboard ([Logs &amp; alerts](/tenant/docs/dashboard/logs)).

| What | Events |
|---|---|
| this Tenant became a master; the addresses machines dial; the relay switch | `fleet/1001`, `5001`, `5002` |
| the fleet port open and closed, held by another process, or not started and why | `fleet/1`, `2`, `3001` |
| a code issued; a machine enrolled, confirmed, renamed or revoked; its settings copied again or applied | `fleet/1002`, `1003` |
| a group, the fleet's default categories or its rules changed (no machine moves with it) | `fleet/5003` |
| an enrollment or confirmation refused; a spent code presented again | `fleet/2101`, `2102`, `3101` |
| a machine connected, and disconnected with why | `fleet/1101`, `1102` |
| each call on a machine, with its outcome and the hash of the machine's own audit record | `fleet/1201` |
| each step of an update, and one that did not go through | `fleet/1301`, `2301` |
| the machines' memory: open or unavailable, copies, forgets, and what went wrong | `fleet/3`, `2003`, `1401`–`1407`, `2401`–`2414` |

The Security log keeps the audit record of each operator change and each refusal (`security/4321`–`4325`): who made it, and from where. A change to many machines at once has one record per machine. No line in either log holds an enrollment code or the recovery identity. A change made with a `tenant fleet` command is in the fleet log even when no Tenant is running. `tenant logs catalog` has every event's meaning, cause and what to do.

A fleet machine's own process has no log book: it keeps its [audit log](/tenant/docs/fleet/machines#the-audit-log) and writes to its own log and the system's.

## The fleet pages

| Page | Read it when |
|---|---|
| [Set up a fleet](/tenant/docs/fleet/setup) | you are making a master and adding machines, or choosing how they reach it |
| [On a fleet machine](/tenant/docs/fleet/machines) | you are on the machine itself: its service, its ceiling, its audit log, pausing or removing it |
| [Approvals on fleet machines](/tenant/docs/fleet/approvals) | you want to set what the agent may do on each machine, set the fleet's defaults and groups, change many machines at once, or open a relay or a cron job to the fleet |
| [A machine's memory](/tenant/docs/fleet/memory) | you want to know what the master remembers about a machine, where it is kept, and how forget reaches it |
| [Update, move and recover](/tenant/docs/fleet/updates) | you are updating machines, one, a group or a rollout of many, or the master was lost and its machines need a new one |

The commands are also in [CLI commands](/tenant/docs/reference/cli), and the Fleet page of the dashboard in [Page by page](/tenant/docs/dashboard/pages).
