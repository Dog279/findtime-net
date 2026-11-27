---
title: How Tenant is kept safe
description: "The layers between your agent and your computer, in the order an action meets them: who may give it work, what needs your approval, where commands run, what protects Tenant itself and what is recorded. Every default is in one table."
area: Security
area-url: /tenant/docs/security/overview
---

Tenant's agent runs as your account, on your computer, with your files in reach. What keeps that safe is a set of layers, and each is a separate thing you can read and set. This area explains how they fit together and what each one starts as. The pages it links to have every key, flag and exception.

## The layers

| Layer | What it decides | Starts as | In full |
|---|---|---|---|
| Surfaces | who can give the agent work | the terminal UI and the dashboard, on this computer only; Discord, iMessage and the fleet are off | [Turn it on &amp; sign in](/tenant/docs/dashboard/overview), [Access](/tenant/docs/dashboard/access) |
| Approvals | which actions run, which are refused and which wait for you | every category asks | [The permission categories](/tenant/docs/security/permissions) |
| Rules and trust | the same, for one tool, one command or one MCP server | no rules; every server asks | [Trust &amp; tool rules](/tenant/docs/mcp/trust) |
| The sandbox | where a command runs and what it can touch | the host, behind your approvals | [Sandbox defaults](/tenant/docs/security/sandbox) |
| The fleet | what the agent may do on your other machines | nothing: there is no fleet until you make one | [Fleet and relay permissions](/tenant/docs/security/fleet) |
| Process protection | whether your other programs can read Tenant's memory while it runs | on, with no switch | [Process protection](/tenant/docs/setup/process-protection) |
| Secret files | where keys are kept and what can read them | owner-only files that the agent's file tools refuse | [Files &amp; directories](/tenant/docs/setup/directories) |
| The Security log | what was asked, who answered and what was changed | always on, and it cannot be cleared | [Logs &amp; alerts](/tenant/docs/dashboard/logs) |

## What happens to one action

1. **Reading is not gated.** Tools read by default. A tool that changes something (runs a command, writes a file, sends a message, clicks a form) goes to the approval broker first.
2. **Where the turn came from picks the settings.** A turn from the terminal UI, the dashboard or a scheduled job uses the host's. A turn from Discord uses the relay's, and one from iMessage the responder's. A call on a fleet machine uses that machine's own scheme.
3. **The action resolves to one of eight categories**, such as `exec` or `write`. An action that no table knows is `destructive`.
4. **A rule decides first, when one matches** the tool or the command. Otherwise the category's mode does: `allow` runs it, `deny` refuses it, and `ask` raises a request and waits. A tool of an MCP server also passes that server's trust mode.
5. **You answer where you are:** in the terminal UI, on the dashboard, on a Discord card or by an iMessage text. The first answer counts, and no answer is a refusal.
6. **A command then goes through the execution sandbox**, which for that surface is the host or a confined backend.
7. **The request, the answer and who gave it are written to the Security log.**

## Defaults at a glance

What a fresh install does before you change anything.

| What | Default | Change it with |
|---|---|---|
| The host's categories (terminal UI, dashboard, scheduled jobs) | `ask`, all eight | `/permissions set`, the dashboard's **Approvals &amp; safety** page |
| Read-only commands such as `ls` and `git status` | run unasked on the host and over Discord while `exec` is `ask` | a command rule |
| The Discord relay | off. Once on: `ask`, with `exec`, `write`, `destructive`, `sandbox` and `send` refused until `/relay exec on` | `/relay` |
| The iMessage responder | off, with nobody on its allowlist. Once on: `deny` for every category | `/imessage` |
| Scheduled jobs | shell jobs and commands in prompt jobs are off (`cron.allow_exec`); a request a job raises is refused when its run ends | `/cron exec` |
| A new MCP server | trust `ask`: every gated call prompts | `/mcp trust` |
| Where commands run | the host on the interactive surfaces. Scheduled jobs on macOS: confined, in a dry run. Scheduled jobs on Linux and Windows: the host | `exec_profiles` |
| A command's environment | a short allowlist (`PATH`, `HOME` and the like), with none of Tenant's API keys or tokens | `env_pass` |
| The dashboard | `127.0.0.1:9770` behind a sign-in key; the local-network listener is off | `/dashboard`, `dashboard` in `config.json` |
| The fleet | no port open and no fleet tools until `tenant fleet init` | |
| A new fleet machine | a copy of the host's categories and rules | `tenant fleet permissions --defaults` |
| Discord, iMessage and scheduled jobs on the fleet | closed, reads included | `/fleet relay`, `/cron fleet` |
| What a fleet machine lets its master do | `full`: the master's approvals decide | `--ceiling` at `tenant child install` |
| Process protection | on | there is no switch |

## What the model cannot change

Some settings have no tool on purpose, so that the agent cannot widen its own reach.

- No agent tool writes a category's mode or a tool rule. Those change from a slash command you type, the dashboard, the command line or the settings file.
- The agent's file tools refuse `credentials.json`, `settings.<agent>.json` and the dashboard's key file. `exec_profiles` live in that settings file, so no tool can write them either.
- Adopting an MCP server, or changing its trust, is itself a gated action, in the `mcp` category.
- The agent's own `tenant service`, `tenant update`, `tenant child` and `tenant fleet`, written plainly in a command, are filed under `destructive` and ask even when `exec` is allowed.
- `tenant fleet remote-confirm on` and `tenant fleet digits off` ask you to type the word at a terminal, and refuse when their input is not one.

These hold while commands cannot reach Tenant's own files. With `exec` on `allow` and commands running on the host, a command can change Tenant's settings, and the agent could then answer its own requests. Keep `exec` at `ask` unless your commands run under an enforcing sandbox profile.

## What is not a boundary

- **The danger classifier** catches the plain spellings of catastrophic commands. It is a guardrail against accidents. A variable, an alias or a script file still hides a command from it.
- **The `host` backend** confines nothing: a command runs as the account Tenant runs as. The real containment is `exec` at `ask`, an enforcing sandbox profile, and running Tenant as a user with no more rights than it needs.
- **Reads are not asked about.** What a read hands the model (`env`, a private key file under your home folder) reaches the model. The sandbox's deny list and the file tools cover Tenant's own secrets, not all of yours.
- **Process protection** covers the running process. It does not cover the files on disk, and it does not stop an administrator or root.
- **Whoever controls a fleet's master controls every machine in it**, with the rights each child was installed with.

## Check what is in force

```bash
tenant security audit              # what each surface may do unasked, listeners, secret files, the sandbox; non-zero exit on a critical finding
tenant permissions effective       # the composed result, by agent and surface
tenant sandbox probe               # what each surface's profile enforces on this machine
tenant doctor                      # process protection, secret-file permissions, the container sandbox
tenant logs query "log:security"   # every request, every answer and every change
```

## The pages in this area

| Page | Read it when |
|---|---|
| [The permission categories](/tenant/docs/security/permissions) | you want to know what each category covers, where each surface starts, and what a rule or a trusted server changes |
| [Security commands](/tenant/docs/security/commands) | you know what you want to change and need the slash command or the shell command |
| [Sandbox defaults](/tenant/docs/security/sandbox) | you want to know where a command runs on your system today, and what turning enforcement on changes |
| [Fleet and relay permissions](/tenant/docs/security/fleet) | you run a fleet, or want Discord, iMessage or a scheduled job to reach it |
