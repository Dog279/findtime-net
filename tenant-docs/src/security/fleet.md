---
title: Fleet and relay permissions
description: "Who has a say when the agent works on another machine: your approvals on the master, the machine's own ceiling, and the relay or scheduled job the turn came from. What a new machine starts with, how one joins, and how to stop one."
area: Security
area-url: /tenant/docs/security/overview
---

A fleet puts your other machines within the agent's reach, so three parties each have a say in a call: the **master**, where your approvals are; the **machine**, which sets a ceiling on itself; and **where the turn came from**, because Discord, iMessage and scheduled jobs reach no machine until you open them. This page is the map. [Approvals on fleet machines](/tenant/docs/fleet/approvals) has every command and exception.

## Who decides a call on a machine

1. **Where the turn came from has to be open.** A turn from the terminal UI or the dashboard always is. A turn from Discord or iMessage reaches no machine, reads included, until that relay is opened for the fleet. A scheduled job reaches only the machines on its own list.
2. **The machine applies its own ceiling.** A machine set to `read-only` or `no-exec` refuses there and then, and the master is not asked.
3. **An action that needs an approval is asked of the master**, over the link. Two checks must both pass: the rules of the relay or job the turn came from, and the machine's own scheme. A `deny` on either side refuses. An `ask` on either side raises a request where that turn asks: the terminal UI and the dashboard, the Discord card, or the iMessage text. A scheduled job has nobody to ask, so there an `ask` is a refusal.
4. **The machine writes the call to its audit log before it runs**, and the master writes it to the fleet log.

Listing the machines, a machine's tools and a folder, and reading a file, ask nobody once the first step passes. The machine itself refuses to read its secret files.

## A machine's scheme

Every machine has its own approval scheme, kept on the master: the eight category modes and its own rules. A call on a machine is decided by that machine's scheme and nothing else.

| When | What the scheme is |
|---|---|
| a machine joins | **a copy of the host's categories and rules as they are.** What this Tenant allows without asking, the machine does too. Grants from launch flags and session grants are not copied |
| you set fleet defaults first | each category you set for new machines replaces the copy's mode, and the fleet's rules and the machine's groups' rules are laid over it |
| afterwards | the machine's own. A later change to the host's modes, to a default or to a group moves no machine until you copy or apply again |

To start every machine tighter than the master, set a default before machines join:

```bash
tenant fleet permissions --defaults set exec ask
```

To give machines the host's scheme again:

```bash
tenant fleet permissions web1 --from master      # one machine
tenant fleet permissions --all --from master     # every confirmed machine
```

A machine confirmed by an earlier version of Tenant, which held five categories at `ask` whatever the master allowed, keeps the scheme it has until you copy again.

Three things differ from the host:

- While a machine's `exec` is `ask`, **every** shell command on it asks. The read-only judgement that lets `ls` run unasked on the host is not used on a machine.
- **Always** on a machine's request saves a rule for that machine alone. It does not carry to another machine or to the master.
- A machine keeps no session grant.

## Relays and scheduled jobs

Besides the machine's scheme, a turn from a relay or a job has to pass a check of its own.

| The turn came from | Reaches the fleet | Its own check | Asks |
|---|---|---|---|
| the terminal UI, the dashboard | always | none | in the terminal UI and on the dashboard |
| the Discord relay | once you open it | the relay's exec lock and its own category modes | on the Discord card |
| the iMessage responder | once you open it | the responder's own category modes, `deny` to begin with | by text, answered from the operator handle |
| a scheduled job | only the machines on its list | a job that may not run commands can read on a machine and do nothing more; one that may is held to the rules for unattended jobs | nobody: an `ask` is a refusal |

```text
/fleet relay discord on | off        open the Discord relay to the fleet, or close it; imessage likewise
/cron fleet <id> <machine>...        the machines a job may reach
/cron fleet <id> none                take them all away again
```

The relay switches are `relay.allow_fleet` and `imessage.allow_fleet` in `config.json`, both off to begin with. Opening a relay loosens nothing else: a call from Discord still has to pass the relay's own rules and then the machine's scheme.

Helpers, teams, research and goal runs do not get the fleet tools at all.

## What the machine keeps for itself

These are set on the machine, in its `child.json`, which is read from the disk on every call. The master cannot change them.

| On the machine | Effect |
|---|---|
| `ceiling: full` | nothing is refused on the machine: the master's approvals decide. This is what a machine starts with |
| `ceiling: no-exec` | every action that runs a command is refused, and so is any action Tenant does not declare, such as a local MCP server's tool. File writes the master approves still happen |
| `ceiling: read-only` | every action that would need an approval is refused. Nothing that changes the machine is done |
| `tools` | when present, the only tools the machine serves |
| `secret_paths` | files and folders the machine's file tools never read or write, added to a built-in list (the child's own folder, the machine's password databases and key stores, every account's credential stores and browser profiles) |
| `tenant child pause` | the machine stops serving its master at once, until `tenant child resume` |

Choose the ceiling when the machine joins: `tenant child install --ceiling read-only` ([On a fleet machine](/tenant/docs/fleet/machines#child.json-and-the-ceiling)).

## How a machine joins

- **A one-time code.** `tenant fleet enroll <name>` on the master prints a code and the line to paste on the new machine. A code that is valid, unused and not expired confirms the machine as it enrolls. You are told when a machine joins, with the address it came from and what it reports about itself, and the Security log has the record.
- **The code is the whole check**, so treat it as a password for as long as it lasts: fifteen minutes, unless you gave `--ttl`. If a code is presented a second time, the second machine is refused, an alert is raised, and the machine that code enrolled is paused until you have looked.
- **Six digits as a second step, if you want one.** After `tenant fleet digits on`, a machine that enrolls shows six digits and waits as `pending` until a person types them on the master. Turning it on needs nobody; turning it off takes a person at a terminal.
- **Confirming from another computer** applies only with digits on, and is off until you run `tenant fleet remote-confirm on` at the master's terminal.
- **The link.** The machine always dials the master, over TLS 1.3 with both certificates pinned by fingerprint. The master opens one port for this (`0.0.0.0:9777` unless you set `fleet.listen`), and only once this Tenant has been made a master.

The steps, the lines to paste and the routes between sites are in [Set up a fleet](/tenant/docs/fleet/setup).

## Stopping a machine

| Command | Where | Effect |
|---|---|---|
| `tenant fleet pause <name>` | master | no call goes to the machine and its link is refused; its certificate, scheme and memory stay. `tenant fleet resume <name>` undoes it |
| `tenant fleet revoke <name>` | master | the machine's certificate is refused from then on, and its link closes within a second if it is online |
| `tenant child pause` | machine | the link drops, and running calls and background commands end. It lasts across restarts |
| `tenant child uninstall` | machine | removes the service and the machine's key; the audit log stays |

## What a machine says is untrusted

Everything a machine returns is that machine's words: command output, file contents, what it reports about itself.

- **It reaches the agent framed and labelled** as untrusted data, never instructions.
- **The egress check follows it.** Text a machine returned that turns up in a later call that sends data out raises a request in the `egress` category.
- **One machine cannot steer work on another.** After a turn has read from one machine, anything but a plain read on another machine asks, whatever that machine's scheme allows.

## What is recorded

| Where | What |
|---|---|
| the machine's audit log | every call from the master, before it runs and when it has ended, each record chained to the one before by its hash. `tenant child audit` checks the chain |
| the master's fleet log | every call with its outcome and the hash of the machine's own record; joins, links, updates. `tenant logs query log:fleet` |
| the master's Security log | every change you make to a scheme, a default or a group, and every refusal, with who made it and from where (`security/4321` to `4325`) |

## The master is the key

Whoever controls the master controls every machine in the fleet, with the rights each child was installed with. Its config and data folders, the dashboard's sign-in key (which is also the API key) and any relay you opened to the fleet are the ways in. Keep the master's `exec` at `ask` unless its commands run in an enforcing sandbox, leave the relays closed to the fleet unless you use them, and give a machine that only needs watching the `read-only` ceiling.
