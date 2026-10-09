---
title: Approvals
description: When the agent needs your OK, where the request appears, what the buttons do, what happens if nobody answers, and the rows that set what it may do on its own.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

Some things the agent wants to do wait for you first: running a command, changing files, sending a message. Doing nothing never says yes. The model behind this is on [Permissions &amp; approvals](/tenant/docs/first-launch/permissions); this page is the dashboard's side of it.

## Where a request appears

Within a second:

- on **Approvals &amp; safety**, under "Waiting for your OK";
- above the message box on **Chat**, when you are there;
- on every page, in the line under the title: "1 action is waiting for your OK", with an **Answer it** link;
- on **Overview**, in the "Waiting for your OK" count.

Each request says what the agent wants to do, in which area, which tool asked, how long it has waited, and the full text of what it wants to run or send. Characters that could hide text show as markers like `⟨U+202E⟩`. A long request says so: read all of it before you allow it.

## The buttons

| Button | Effect |
|---|---|
| **Allow once** | this one action goes ahead |
| **Deny** | refused; the agent is told no and carries on without it |
| **Allow for the rest of this session** | behind a second step, only on some requests: the same kind of action goes ahead without asking until Tenant restarts, or until you press **Ask me again** on its row. Not offered where the grant would be hidden or let the agent get around your settings: commands that do not run in the sandbox, leaving the sandbox, requests from iMessage, and requests a tool rule made ask. |
| a pairing request from another computer | asks a second time: allow it only if the person pairing told you the same PIN the request shows |

There is no "always" button here. To stop being asked about a whole area, change its row (below): a deliberate step with a warning.

**"This was already answered (here, in another tab, or in the terminal) or it timed out."** Someone got there first. The first answer counts.

**Requests from a Discord conversation** are answered on Discord, with the buttons on the card; the page only says they are there. **Requests from iMessage** are in the list, marked "from iMessage", and are answered here (or by the operator's text reply).

## If nobody answers

| Request from | Refused when |
|---|---|
| a scheduled job | its run ends: 15 minutes (`cron.per_run_minutes`) |
| your Chat message | you press **Stop** |
| an alert investigation | 15 minutes |
| a Discord card | `relay.approval_timeout` (10 minutes) |
| anything still waiting | Tenant stops |

## What the agent may do on its own

One row per area, in words. Each says what the agent can do now.

| Area | Covers | Recommended |
|---|---|---|
| Run commands | run commands and programs on the computer running Tenant | Ask |
| Change files | create and change files | Ask |
| Irreversible actions | things that cannot be undone | Ask |
| Act on websites | click, type and submit forms on websites | Ask |
| Send messages | email, texts and posts in your name | Ask |
| Share private data | send private information it has read to an outside service | Ask |
| Connect remote services | connect new remote services and trust their tools | Ask |
| Leave the sandbox | run a command outside the safety box after the box stopped it | Ask |

- **Ask:** it asks you first, every time. One tap.
- **Allow:** it goes ahead without asking. Choosing Allow opens a second step that explains it before anything changes.
- **Deny:** it cannot, and does not ask. One tap. Two settings are stronger than Deny, for their own tools only: a tool rule on **Tools** that lets a tool go ahead (**Don't ask**), and a remote service set to **Don't ask**. Discord's lock (**Access** → Discord may not run commands) holds even over those.

**New.** An area an update added, which you have not chosen for yet, asks until you choose. A notice on every page links here, and **Keep them at Ask** chooses Ask for all of them at once.

**Before you set Run commands to Allow,** read its warning. It names the account commands run as; as SYSTEM on Windows that account has full control of the computer. Unless commands run in the sandbox, a command can change Tenant's own settings, and the agent could then answer its own requests on this page. Keep it at Ask unless your commands run in an enforcing sandbox profile. **Leave the sandbox** always carries the same warning.

**Scheduled jobs that run commands** follow their own switch on **Scheduled jobs**, not these rows. Everything else follows these rows: Chat, alerts, research, and scheduled jobs that do not run commands.

**Approvals &amp; safety or Access?** **Access** sets who may message the agent on Discord and iMessage and what those conversations may make it do. **Approvals &amp; safety** sets what it does for you and for its own jobs.

## By REST

```http
GET  /api/approvals                     [{id, category, action, detail, age_secs}]
POST /api/approvals/{id}                {"decision": "approve" | "approve_session" | "approve_always" | "deny"}
```

`approve_always` exists only here; on the page a permanent change is an area's row. See [REST API](/tenant/docs/dashboard/api).
