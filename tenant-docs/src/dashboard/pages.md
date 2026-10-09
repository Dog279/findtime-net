---
title: Page by page
description: Every dashboard page, what it is for, and which of its buttons ask for a second click.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

The menu groups the pages. On a phone, **Menu** at the top opens it; **Log out** is at its bottom. "Asks first" means the button opens a second step that says what will happen, with **Yes** to go ahead and **Cancel** to back out.

| Page | Path | What it is for | Asks first |
|---|---|---|---|
| **Overview** | `/` | how the agent is (an alert, a model it cannot reach), what is waiting for you, what it may do, the services it is connected to; its model and quality score once they have data | nothing |
| **Chat** | `/chat` | talk to the agent; its requests for your OK appear above the message box; a `thinking…` row counts up while it answers | nothing; **Stop** is immediate |
| **Autopilot** | `/goal` | a `/goal` started from the terminal UI; **Stop after this step** | nothing |
| **Logs** | `/logs` | everything the agent and Tenant do, newest first: filters, saved views, **○ live**, an event's detail and timeline ([Logs &amp; alerts](/tenant/docs/dashboard/logs)) | **Clear** a log; **Reveal** shows a hidden value and is recorded; the Security log can never be cleared |
| **Memory** | `/memory` | what the agent knows about you: facts with provenance and history, the soul, the user profile, **Recently removed** with restore | nothing |
| **Skills** | `/skills` | induced skills waiting for review, trust decisions, auto-accept | **Dismiss**, **Remove**, **Trust**, **Choose On**, **Choose Trusted** |
| **Quality** | `/eval` | eval scores over time; run a check; the judge model | nothing |
| **Research** | `/research` | start, watch and stop a deep-research run; past reports | **Stop** a run, **Delete** one |
| **Tools** | `/tools` | every tool, **All on** / **All off** for the acting ones, tool rules | **All on**, a rule that lets a tool go ahead, removing a rule that made a tool ask or blocked it |
| **Helpers** | `/agents` | the specialists, each with its model and instructions | **Remove**, **Reset**, **Clear instructions** |
| **Remote services** | `/mcp` | MCP connectors: connect, trust, reconnect, disconnect | **Disconnect**, **Don't ask** |
| **Scheduled jobs** | `/cron` | cron jobs with preset schedules or a typed cron line, run now, enable, the exec switch | **Delete** a job; turning on **Scheduled jobs may make changes** |
| **Approvals &amp; safety** | `/safety` | what is waiting for your OK; what the agent may do on its own ([Approvals](/tenant/docs/dashboard/approvals)) | **Allow** for an area, **Allow for the rest of this session**, a pairing's **Allow once** |
| **Access** | `/access` | who may message the agent on Discord and iMessage and what those conversations may make it do ([Access](/tenant/docs/dashboard/access)) | **Add someone**, **Remove everyone**, removing the last person, **Turn on** / **Start**, changing the approving Discord account, letting Discord run commands, **Allow** for an area |
| **Model** | `/models` | which model answers; add a server on your network or a cloud model; the loop ceiling and the repeat guard; **Reload API keys** | **Use this model**, **Remove** |
| **Integrations** | `/integrations` | Google, Atlassian, GitHub and the others: save, test, disconnect; GitHub repositories and their write mode | **Disconnect**, **Allow changes** on a repository |
| **Provider keys** | `/settings/keys` | the API keys, write-only; a new key for the model in use applies on **Reload API keys** | **Remove** |
| **Settings** | `/settings` | the rest | |

**Busy.** While the agent answers a Chat message, the line under every page title says "Your agent is answering a message", with **Stop**. Scheduled jobs, Discord and iMessage conversations and alert checks run alongside and never hold up Chat. A second message sent while it is answering is not sent and stays in the box.

**Live updates paused. Reload the page to see new requests.** The page lost its connection to Tenant (a restart, or the network dropped). Reload.

Every page is also reachable by its path, so a bookmark to `http://127.0.0.1:8770/safety` opens straight to approvals after sign-in.
