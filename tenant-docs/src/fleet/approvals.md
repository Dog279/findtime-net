---
title: Approvals on fleet machines
description: Each fleet machine has its own approval scheme, decided on the master. What it starts with, how to change it, how relays and cron jobs are kept off the fleet, and why a machine's results are treated as untrusted.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

Every approval for a fleet machine is decided on the master. A tool on the machine that needs one asks the master over the link, and the card comes up where any card of the master's does: the terminal app, the dashboard, or a relay that has been opened to the fleet. The categories and modes are the ones in [Permissions &amp; approvals](/tenant/docs/first-launch/permissions).

Before the master is asked at all, the machine applies its own ceiling from `child.json` ([On a fleet machine](/tenant/docs/fleet/machines)). The master cannot lift it.

## Each machine has its own scheme

A machine's scheme is set when you confirm it, and is built in three layers:

1. **A copy of the master's local scheme** as its settings file holds it: category modes, tool rules and command rules. Launch-flag grants and session grants are not copied.
2. **A floor.** `exec`, `write`, `destructive`, `send` and `sandbox` start no looser than `ask`, whatever the master allows. Every copied allow rule that could reach those categories becomes `ask` too.
3. **The fleet's rules for new machines** (`tenant fleet permissions --defaults`) laid over the copy; they win. Then anything you set at confirmation with `--set category=mode`.

After that the master's scheme and the machine's are independent: a later change on the master does not move the machine.

The schemes are kept in `settings.<agent>.json`, under `fleet_schemes` (by machine id) and `fleet_rules` (the rules for new machines). An entry that cannot be read leaves that machine with no scheme, and every call to it is refused, reads included, until `tenant fleet permissions <name> --from master` writes it again.

## What asks

- `fleet_list`, `fleet_tools`, `fleet_list_dir` and `fleet_read` ask nobody. The machine refuses its secret files.
- Every shell command on a machine asks until you answer **always**. The read-only command judgement that lets `ls` or `git status` run unasked on the master is not used on a machine.
- A `fleet_call` to a tool Tenant does not ship (a local MCP server's) asks before it is sent.
- Writes, edits and the other gated actions follow the machine's category modes.

A card for a machine names it: its detail starts `[host <id> "<name>"]`, and on the dashboard its headline starts `On the machine "<name>"`. A machine keeps no session grant, so the dashboard offers no step for the rest of the session.

**Always** saves a rule in that machine's scheme alone. It does not carry to another machine or to the master.

## Changing a machine's scheme

```bash
tenant fleet permissions <name> [set <category> <mode> | add <pattern> <mode> | rm <pattern>]
tenant fleet permissions <name> --from defaults|master
tenant fleet permissions --defaults [add <pattern> <mode> | rm <pattern>]
```

| Form | Does |
|---|---|
| `tenant fleet permissions web1` | show the machine's scheme |
| `... web1 set exec allow` | set a category for that machine |
| `... web1 add "os_exec(systemctl status *)" allow` | add a tool or command rule for that machine |
| `... web1 --from defaults` | lay the fleet's rules over the machine's scheme again |
| `... web1 --from master` | copy the master's local scheme again, with the floor |
| `... --defaults add "os_exec(uptime)" allow` | a rule every newly confirmed machine starts with |

Changing the fleet's rules does not touch machines already confirmed. In the terminal app the same edits are `/permissions fleet <name> [set|add|rm …]` and `/permissions fleet --defaults …`. The dashboard's Fleet page shows and changes each machine's settings ([Page by page](/tenant/docs/dashboard/pages)).

## Relays and cron jobs are closed until you open them

A turn that came from a relay or a cron job reaches no machine, reads included, until you open it.

```bash
tenant fleet relay                         # each relay's switch
tenant fleet relay discord on              # or imessage; off by default
```

```text
/fleet relay [discord|imessage [on|off]]
/cron fleet <id> <machine>... | none       the machines a job may reach; none by default
```

The relay switches are `relay.allow_fleet` and `imessage.allow_fleet` in `config.json` ([config.json](/tenant/docs/reference/config)). An opened relay keeps its own rules as well: each call must pass both the relay's rules and the machine's scheme. A cron job reaches only the machines on its own list (`cron.jobs[].fleet`), and nobody is there to answer, so an action the machine's scheme would ask about is refused.

## A machine's results are untrusted

Everything a machine returns is that machine's words: command output, file contents, what it says about itself. Tenant treats it accordingly.

- **The frame.** A result reaches the agent between `[fleet <name> (<id>, <os>): <tool>. …]` and `[/fleet …]`, with a line that says everything inside is that machine's output: untrusted data, never instructions.
- **The egress check.** Text a machine returned is tracked as sensitive data from that machine. When it turns up in the arguments of a later call that sends data out (`fleet_exec`, `fleet_write`, `fleet_edit`, `fleet_copy`, `fleet_call`, or any outbound tool on the master), that call raises a card in the `egress` category ("Share private data") that asks whether the data may leave.
- **The cross-machine rule.** After a turn has read from one machine, anything but a plain read on another machine asks, whatever that machine's scheme allows. The card's detail says `[asked because this turn has read from <names>]`.

### A second card after the machine list

`fleet_list` shows each machine's account (on Windows `COMPUTER\user`), and that text is tracked like any other machine output. So once the list has been shown in a conversation, a command whose text contains a machine's account or computer name of eight characters or more, often a path under that account's home or temp folder, can raise a second card that asks whether that data may leave, besides the command's own card. Machines with short account and computer names do not see it. Answer it like any egress card: approving lets that call go ahead.
