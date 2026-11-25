---
title: Approvals on fleet machines
description: Each fleet machine has its own approval scheme, decided on the master. What it starts with, how to change it, the fleet's defaults and groups, changes to many machines, how relays and cron jobs are kept off the fleet, and why a machine's results are treated as untrusted.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

Every approval for a fleet machine is decided on the master. A tool on the machine that needs one asks the master over the link, and the card comes up where any card of the master's does: the terminal app, the dashboard, or a relay that has been opened to the fleet. The categories and modes are the ones in [Permissions &amp; approvals](/tenant/docs/first-launch/permissions).

Before the master is asked at all, the machine applies its own ceiling from `child.json` ([On a fleet machine](/tenant/docs/fleet/machines)). The master cannot lift it.

## Each machine has its own scheme

A call on a machine is decided by that machine's own stored scheme and nothing else. The fleet's defaults and its groups are never read when a call is decided: they are laid over a scheme on purpose, at a step you take, and each such step leaves one Security record per machine.

A machine's **fresh copy**, what it gets when you confirm it or copy it again with `--from master`, is built in this order, each layer winning over the one before it where they disagree:

1. **A copy of the master's local scheme** as its settings file holds it: category modes, tool rules and command rules. Launch-flag grants and session grants are not copied. `exec`, `write`, `destructive`, `send` and `sandbox` start no looser than `ask`, whatever the master allows, and every copied allow rule that could reach those categories becomes `ask` too.
2. **The fleet's default categories**: each category you set for new machines replaces the copy's mode. A category you did not set comes from the copy.
3. **The fleet's rules** for new machines.
4. **The rules of each group the machine is in**, groups in name order (compared without case): a later group wins over an earlier one, and any group wins over a fleet rule.

Then anything you set at confirmation with `--set category=mode`. The confirm screen marks each line that came from a layer (`fleet default`, `fleet rule`, `group <name>`).

A rule laid over a scheme replaces every rule of the machine's that it answers for (the same pattern, a narrower command under its prefix, a tool its glob covers), and leaves the machine's categories alone.

Once laid, the scheme is the machine's. An edit made to it (a category, a rule, an **always** on its card) stands, over every layer, until a layer is laid over it again. A later change to the master's own scheme, to a default or to a group moves no machine; when you change a default or a group, the answer says so and names the step that does.

The schemes are kept in `settings.<agent>.json`, under `fleet_schemes` (by machine id), with the layers beside them: `fleet_permissions` (the default categories), `fleet_rules` and `fleet_groups` ([settings.&lt;agent&gt;.json](/tenant/docs/reference/settings)). An entry that cannot be read leaves that machine with no scheme, and every call to it is refused, reads included, until `tenant fleet permissions <name> --from master` writes it again.

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
```

| Form | Does |
|---|---|
| `tenant fleet permissions web1` | show the machine's scheme |
| `... web1 set exec allow` | set a category for that machine |
| `... web1 add "os_exec(systemctl status *)" allow` | add a tool or command rule for that machine |
| `... web1 --from defaults` | **Apply**: lay the fleet's rules, then the rules of each of the machine's groups, over the scheme it has; its categories stay |
| `... web1 --from master` | copy the master's local scheme again, with the floor, the fleet's defaults and its groups: a fresh copy |

A laid rule replaces every rule of the machine's own that it answers for, **a block included**: a group rule `os_exec(git *)` allow removes the machine's `os_exec(git status)` deny. The answer and the machine's Security record say which rules were replaced and what they were.

In the terminal app the same edits are `/permissions fleet <name> [set|add|rm …]`. The dashboard's Fleet page shows and changes each machine's settings ([Page by page](/tenant/docs/dashboard/pages)).

## The defaults for new machines

```bash
tenant fleet permissions --defaults [set <category> <mode> | unset <category> | add <pattern> <mode> | rm <pattern>]
```

| Form | Does |
|---|---|
| `tenant fleet permissions --defaults` | show the categories you set for new machines and the fleet's rules |
| `... --defaults set web deny` | a category every newly confirmed machine starts with: `ask`, `allow` or `deny` |
| `... --defaults unset web` | back to the master's copy for that category |
| `... --defaults add "os_exec(uptime)" allow` | a rule every newly confirmed machine starts with |
| `... --defaults rm "os_exec(uptime)"` | remove that rule |

A default reaches a machine only when it is confirmed or copied again; the fleet's rules also when it is applied. In the terminal app the same is `/permissions fleet --defaults [set <category> <mode> | unset <category> | add <pattern> <mode> | rm <pattern>]`.

## Groups

A group is a name, the machines in it and rules. It has no categories. A machine may be in any number of groups, in any state; members are kept by id, so a rename does not take a machine out.

```bash
tenant fleet group [show <group> | create <group> | delete <group>]
tenant fleet group add|remove <group> <machine>...
tenant fleet group rules <group> [add <pattern> <mode> | rm <pattern>]
tenant fleet group apply <group>
```

| Form | Does |
|---|---|
| `tenant fleet group` | the groups; `show web` for one |
| `... group create web` | a new group. A name is 1 to 63 letters, digits, dots, dashes or underscores, starting with a letter or a digit; not `all`, not the shape of a machine id, and not another group's name in any case |
| `... group add web web1 web2` | put machines in it, by name or id; `remove` takes them out |
| `... group rules web add "os_exec(systemctl restart nginx)" allow` | a rule of the group's; `rm` removes one |
| `... group apply web` | lay the fleet's rules, then each member's groups' rules, over each confirmed member's scheme; categories stay |
| `... group delete web` | the group goes; its members keep what it laid |

Changing a group, its rules or its machines moves no machine: **Apply** is the step that does. A member that is pending, revoked or whose scheme cannot be read is skipped and named in the answer, and the command exits 1.

A pending machine in a group starts with the group's rules when it is confirmed, and its confirm screen shows them. Revoking a machine with `--delete-scheme` takes it out of every group; `--keep-scheme` keeps its memberships, for a machine that adopts its id.

In the terminal app the same verbs are `/fleet group …`. The command line and the terminal app take a loosening (an allow) without a second step, as for one machine.

## Many machines at once

```bash
tenant fleet permissions --group <group> | --all [set <category> <mode> | add <pattern> <mode> | rm <pattern> | --from defaults|master]
```

The same edits as for one machine, made to each member of a group, or with `--all` to every confirmed machine, one machine at a time through the one-machine path. Each machine gets one line in the answer and one Security record; the batch gets none. It never stops at a failure, and exits 1 if any machine was not changed.

```bash
tenant fleet permissions --group web set exec ask
tenant fleet permissions --all --from defaults
```

On the dashboard's Fleet page you can tick machines, or narrow the list to a group and choose everyone shown, and make one change to all of them ([Page by page](/tenant/docs/dashboard/pages)).

## When the defaults or the groups can't be read

`fleet_permissions` and `fleet_groups` are read strictly, as `fleet_rules` is: an unknown category, a mode that is not `ask`, `allow` or `deny`, a key twice (group names that differ only in case are the same name), `null`, trailing text, a member that is not a machine id, or more than 256 groups, 4096 machines or 512 rules in a group makes the whole key unreadable. Then no machine can be confirmed or copied again (and, for `fleet_groups`, no group applied or changed), you are told once, and the text is kept as written for you to fix. Machines that have a scheme keep deciding by it.

## What is recorded

Confirming a machine, copying its scheme again and applying each leave one Security record per machine (`security/4323`): a confirmation names the defaults and the groups it laid, and an Apply names the rules of the machine's own it replaced, with the mode each had. A change to many machines is recorded once per machine, never once for the batch: a category by the record a change of that category on one machine leaves, a rule as `security/4323`. A change to a default, to the fleet's rules or to a group is `security/4325` in the Security log and `fleet/5003` in the fleet log; it moves no machine, and says so. Each record says where you were: `cli`, `tui`, `dashboard`, or `dashboard-remote` for a machine confirmed from a browser on another computer.

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
