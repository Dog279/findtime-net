---
title: Security commands
description: Every command that shows or changes what the agent may do, grouped by what you are trying to do. Slash commands for the terminal UI, the shell command where there is one, and the page that explains each.
area: Security
area-url: /tenant/docs/security/overview
---

`/…` is typed into the terminal UI (`tenant tui`): it takes effect at once, in the running Tenant, and is saved. `tenant …` is a shell command. Where a row shows both, they do the same thing. Most of these are also a switch on the dashboard: **Approvals &amp; safety** for the host's categories, **Access** for Discord and iMessage, **Tools** for tool rules, **Remote services** for MCP servers and **Fleet** for machines.

A category is one of `exec`, `write`, `destructive`, `web`, `send`, `egress`, `mcp` and `sandbox`. A mode is `ask`, `allow` or `deny` ([The permission categories](/tenant/docs/security/permissions)).

## See what is in force

| Command | Shows |
|---|---|
| `/permissions` (or `/perms`) | the host's modes and its tool rules |
| `tenant permissions effective` | what each surface may do once categories, rules and trust are combined; `--surface local`, `discord` or `imessage` for one surface, `--agent ID` for one agent |
| `tenant security audit` | what each surface may do unasked, listeners, secret files and the sandbox; non-zero exit on a critical finding, `--json` for a script |
| `/relay` | whether the Discord relay runs, its operator, and whether exec is unlocked |
| `/imessage` | the allowlist and the responder's state |
| `/permissions fleet <name>`<br>`tenant fleet permissions <name>` | one fleet machine's scheme |
| `/fleet relay`<br>`tenant fleet relay` | whether Discord and iMessage may reach the fleet |
| `tenant sandbox probe` | what each surface's sandbox profile enforces on this machine |
| `tenant doctor` | process protection, secret-file permissions, the container sandbox |
| `/logs log:security`<br>`tenant logs query "log:security"` | every request, every answer and every change |

## Answer a request

| In the terminal UI | Does |
|---|---|
| `/approve` | this one action |
| `/approve session` | the same kind of action, until Tenant restarts or you revoke it |
| `/approve always` | sets the category to `allow`. On a command's prompt it saves that command's family as a rule; on a sandbox prompt it saves the one refused folder as an exception |
| `/deny` (or `/reject`) | refuse |

The dashboard has the same answers as buttons, a Discord card has **Approve** and **Deny**, and iMessage takes `Y <nonce>` or `deny <nonce>` from the operator handle ([Answering a request](/tenant/docs/first-launch/permissions#answering-a-request)).

## The host's categories and rules

| Command | Does |
|---|---|
| `/permissions set <category> <mode>` | set one category, for example `/permissions set exec ask` |
| <code>/permissions add &lt;tool&#124;pattern&gt; &lt;mode&gt;</code> | a tool rule: a tool's name, an exact id or a glob, such as `delete_* deny` or `mcp:127.0.0.1:9000:* allow` |
| `/permissions add os_exec(<glob>) <mode>` | a command rule, such as `os_exec(brew install *) allow` |
| `/permissions rm <pattern>` | remove a rule |
| <code>tenant permissions preset safe&#124;balanced&#124;full</code> | every category to `deny`, to `ask`, or to `allow` with `sandbox` left at `ask`; `--surface discord` or `imessage` for a relay's own modes |

Details: [Permissions &amp; approvals](/tenant/docs/first-launch/permissions).

## The Discord relay

| In the terminal UI | Does |
|---|---|
| <code>/relay on &#124; off</code> | start or stop the relay; the choice is kept |
| `/relay allow <discord-user-id>` | the one operator whose messages drive the agent |
| <code>/relay exec on &#124; off</code> | unlock `exec`, `write`, `destructive`, `sandbox` and `send` over Discord (off by default). Each then follows the relay's modes |
| `/relay permissions set <category> <mode>` | the relay's own mode for a category; `ask` posts a card with buttons |
| `/relay timeout <duration>` | how long a card waits before it is denied (30 s to 24 h; `10m` to begin with) |

## The iMessage responder

| In the terminal UI | Does |
|---|---|
| <code>/imessage on &#124; off</code> | start or stop the responder |
| <code>/imessage passive &#124; respond</code> | read every text and answer none, or answer the allowlist |
| `/imessage allow <handle>` | let a phone number or an email address drive the agent |
| <code>/imessage deny &lt;handle&gt; &#124; clear</code> | take one handle off the allowlist, or empty it |
| `/imessage permissions set <category> <mode>` | the responder's own mode for a category (`deny` to begin with) |

Details for both: [Access: Discord &amp; iMessage](/tenant/docs/dashboard/access).

## MCP servers and scheduled jobs

| In the terminal UI | Does |
|---|---|
| <code>/mcp trust &lt;label&gt; &lt;ask&#124;allow&#124;deny&gt;</code> | one server's trust: `allow` stops the per-call prompts, `deny` refuses and hides its tools ([Trust &amp; tool rules](/tenant/docs/mcp/trust)) |
| <code>/cron exec on &#124; off</code> | the one switch for shell jobs and for commands in prompt jobs (off by default) ([Scheduled jobs](/tenant/docs/dashboard/cron)) |
| <code>/cron fleet &lt;id&gt; &lt;machine&gt;&#46;&#46;&#46; &#124; none</code> | the fleet machines a job may reach (none by default) |

## Who can reach the dashboard

| In the terminal UI | Does |
|---|---|
| <code>/dashboard on &#124; off &#124; status</code> | run the dashboard or stop it, and show its address |
| `/dashboard serve lan [HOST:PORT]` | a second listener for your local network, over HTTPS (off by default) |
| `/dashboard serve off` | turn that listener off |
| `/tailscale serve` | publish the dashboard on your tailnet |

Every way in still asks for the sign-in key ([Turn it on &amp; sign in](/tenant/docs/dashboard/overview)).

## The fleet, on the master

| Command | Does |
|---|---|
| `/permissions fleet <name> set <category> <mode>`<br>`tenant fleet permissions <name> set <category> <mode>` | one category on one machine |
| `/permissions fleet <name> add <pattern> <mode>`<br>`tenant fleet permissions <name> add <pattern> <mode>` | a tool or command rule on one machine; `rm <pattern>` removes one |
| `tenant fleet permissions <name> --from master` | copy the host's scheme to the machine again, with the fleet's defaults and its groups |
| `tenant fleet permissions <name> --from defaults` | lay the fleet's rules and its groups' rules over the scheme the machine has |
| `/permissions fleet --defaults set <category> <mode>`<br>`tenant fleet permissions --defaults set <category> <mode>` | what every newly confirmed machine starts with; also `unset`, `add` and `rm` |
| `tenant fleet permissions --group <group> …`<br>`tenant fleet permissions --all …` | the same change to each member of a group, or to every confirmed machine |
| `/fleet group …`<br>`tenant fleet group …` | named groups of machines with rules of their own |
| <code>/fleet relay discord&#124;imessage on&#124;off</code><br><code>tenant fleet relay discord&#124;imessage on&#124;off</code> | whether a turn from that relay may reach the fleet at all (off by default) |
| `tenant fleet pause <name>`<br>`tenant fleet resume <name>` | switch a machine off for now: no call goes to it and its link is refused |
| <code>/fleet revoke &lt;name&gt; [keep&#124;delete]</code><br>`tenant fleet revoke <name>` | end a machine for good: its certificate is refused from then on. Its scheme is kept or deleted, as you choose |
| <code>tenant fleet digits [on&#124;off]</code> | whether a machine that joins waits for you to type the six digits it shows (off by default: its one-time code confirms it) |
| <code>/fleet remote-confirm [on&#124;off]</code><br><code>tenant fleet remote-confirm [on&#124;off]</code> | whether a signed-in dashboard browser on another computer may confirm a machine (off by default) |

Details: [Fleet and relay permissions](/tenant/docs/security/fleet) and [Approvals on fleet machines](/tenant/docs/fleet/approvals).

## On a fleet machine

| In a shell, on the machine | Does |
|---|---|
| <code>tenant child install &#45;&#45;ceiling full&#124;no-exec&#124;read-only</code> | what this machine lets its master do, set when it joins. The master cannot lift it |
| `tenant child pause`, `tenant child resume` | stop serving the master at once, until `resume` |
| `tenant child status` | connected, waiting, paused, rejected or offline |
| `tenant child audit` | check the chain of this machine's audit log of the master's calls |

Details: [On a fleet machine](/tenant/docs/fleet/machines).

## The sandbox

| In a shell | Does |
|---|---|
| `tenant sandbox probe` | what each surface's profile enforces on this machine, its folders and its exceptions |
| `tenant sandbox selftest` | run the escape suite; `--backend restricted` or `container` for one backend |
| `tenant sandbox run --surface S -- CMD` | run one command under a surface's profile |
| `tenant sandbox stop-all` | remove every Tenant sandbox container now |
| `tenant sandbox image build` | build the image the `container` backend runs commands in |

Profiles themselves have no command. They are `exec_profiles` in `settings.<agent>.json`, which you edit by hand ([Sandbox defaults](/tenant/docs/security/sandbox)).

## Changes that take a person

A few switches ask you to type a word at a terminal and refuse when their input is not one, so that a script or the agent cannot make them:

- `tenant fleet remote-confirm on`. In the terminal UI, only a line you type yourself changes it.
- `tenant fleet digits off`, which takes the second step out of joining.
- `tenant fleet confirm <name>`, when digits are on: the six digits are typed by a person, and there is no flag for them.

There is no command, in either place, that lets the agent write a rule or a mode for itself.
