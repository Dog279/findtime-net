---
title: "Access: Discord &amp; iMessage"
description: Let your agent be driven from your phone. The Discord relay with button approvals, the iMessage responder with an allowlist and text approvals, and the per-surface permissions for each.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

Two channels let messages from a phone drive the agent. Each is deny-by-default, has its own permission map, and answers its own approvals on its own channel. The dashboard's **Access** page and the slash commands below are the same switches.

## The Discord relay

Your DMs to a bot drive the agent; the bot DMs the answers back; a dangerous action posts a card with **Approve** / **Deny** buttons. You can also DM it files (png, jpg, heic, pdf, csv, txt, mp4): they download into `<data>/relay-inbox/` and the agent gets the paths.

1. Configure the bot token and your Discord user id: `/configure discord` (see [Integrations](/tenant/docs/mcp/integrations)).
2. Turn the relay on:

```text
/relay [status]                            running? the operator, exec on or off
/relay on | off                            start or stop live; the choice persists (relay.enabled)
/relay allow <discord-user-id>             the one operator whose DMs drive the agent (relay.operator_id)
/relay exec on | off                       unlock exec, write, destructive, sandbox and send offsite (relay.allow_exec; default off)
/relay timeout <duration>                  how long a card waits before auto-denying (30s to 24h; default 10m)
/relay permissions [set <cat> <mode>]      per-category ask | allow | deny for the relay (ask = a button card)
```

```json
"relay": { "enabled": true, "operator_id": "123456789012345678", "allow_exec": false,
           "approval_timeout": "10m", "card_style": "v2",
           "permissions": { "web": "ask", "egress": "ask", "mcp": "deny" } }
```

| Key | Default | Meaning |
|---|---|---|
| `enabled` | false | start the relay at launch |
| `operator_id` | | the single Discord user whose DMs are obeyed; everyone else is ignored |
| `allow_exec` | false | while false, `exec`, `write`, `destructive`, `sandbox` and `send` are refused offsite whatever the permissions or a tool rule say (the bot's own post and react still follow `send`); true: those categories follow `permissions` |
| `permissions` | all `ask` | per-category modes for Discord turns; `ask` posts a card |
| `approval_timeout` | `10m` | a card nobody taps is denied after this |
| `card_style` | `v2` | the Components-v2 container card; `legacy` is plain content with a button row; v2 falls back on its own if Discord rejects the post |

Every resolution edits the card in place (verdict, who, when; buttons disabled), so a resolved card stays as the record. Only the operator's click counts; anyone else gets an ephemeral reply. On the dashboard, **Access** has the same switches: the operator, **Discord may run commands** (confirms first), per-area modes. **Approvals &amp; safety** only says that Discord requests are answered on Discord.

After a restart the relay catches up: DMs sent while Tenant was down are routed oldest first, and a turn the stop cut gets "I was stopped mid-task… say `continue`" ([Run in the background](/tenant/docs/setup/service)). A dead remote-MCP sign-in, or a log alert whose action is `discord`, arrives as a DM too.

## The iMessage responder

Texts from allowed handles drive the agent; it replies in the same chat. Native on a Mac (Messages' `chat.db`, which needs Full Disk Access) or over BlueBubbles from any OS. Group chats, SMS and RCS never drive the agent and cannot approve an action.

```text
/imessage [list]                           the allowlist and the responder's state
/imessage on | off                         start or stop the responder live (imessage.enabled)
/imessage passive | respond                passive: read every text, answer none; respond: answer the allowlist and the operator, 1:1 iMessage only
/imessage permissions [set <cat> <mode>]   per-category modes for the responder's tools (default: deny)
/imessage allow <handle>                   permit a phone number or email to drive the agent
/imessage deny <handle> | clear            remove one handle, or empty the allowlist
```

```json
"imessage": { "enabled": true, "passive": false, "allow_from": ["+15550001111", "pat@example.com"],
              "operator": "+15550001111", "permissions": { "web": "ask", "send": "ask" } }
```

| Key | Default | Meaning |
|---|---|---|
| `enabled` | false | start the responder at launch |
| `passive` | false | observe only: every text is logged as an `imessage` Observed event and shown in the feed, none drives a turn |
| `allow_from` | empty (nobody) | the handles that may drive the agent, matched per message |
| `operator` | | the handle whose `Y <nonce>` approves a gated action; unset, an `ask` category prompts at the host (TUI or dashboard) instead |
| `permissions` | all `deny` | per-category modes for iMessage turns |

An allowlisted contact can chat but not approve: a gated action texts a prompt with a nonce to the chat it came from, and only `Y <nonce>` (or `deny <nonce>`) from the operator handle resolves it. One turn runs at a time; a second text mid-turn gets a "busy" reply. On a Mac, senders are named from Contacts ("Pat Lee (+15550001111)"), read-only under the same Full Disk Access. Turning the responder on gives the agent its `imessage_*` tools at once.

## Which surface decides what

| | Host (TUI, dashboard, cron) | Discord relay | iMessage responder |
|---|---|---|---|
| default modes | `ask` | `ask`, plus the `allow_exec` lock | `deny` |
| stored in | `settings.<agent>.json` | `config.json` → `relay.permissions` | `config.json` → `imessage.permissions` |
| approvals answered | TUI card, dashboard, REST | the Discord card | `Y <nonce>` by the operator, or the dashboard |
| tool rules | shared | shared | shared |
| read-only commands skip the prompt | yes | yes | no |

`tenant permissions effective --surface discord` and `tenant security audit` show the composed result per surface.
