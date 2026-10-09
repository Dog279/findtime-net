---
title: Run in the background
description: tenant service installs Tenant under launchd, systemd or Windows so it starts at login, restarts after a crash, and survives reboots without losing a task.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

`tenant serve` is the headless 24/7 hub: the same agent, memory, tools, approvals and self-improvement as the terminal UI, driven from the [dashboard](/tenant/docs/dashboard/overview) instead of a terminal. `tenant service` runs it under the operating system.

## Commands

```bash
tenant service install [--print] [--system]   # write the unit, enable it, start it
tenant service status                         # installed? running (version, turn_active)? where the logs are
tenant service start
tenant service stop
tenant service restart [--now]                # waits for the running turn unless --now
tenant service uninstall                      # stop, disable, remove the unit
```

| Flag | Effect |
|---|---|
| `--print` | print the unit instead of installing it |
| `--system` | Windows only: a real Windows service running as SYSTEM, from an elevated terminal |
| `--now` | on `restart`: do not wait for the running turn to finish (15 minutes is the ceiling otherwise) |

`tenant setup` offers the install at the end. `tenant doctor` reports the service and warns when the unit no longer matches the binary or the directories this command uses; `tenant doctor --fix` rewrites it.

## What gets installed

| | macOS | Linux | Windows | Windows `--system` |
|---|---|---|---|---|
| Unit | LaunchAgent `~/Library/LaunchAgents/com.tenant.serve.plist` | systemd user unit `~/.config/systemd/user/tenant.service` | Scheduled task `\Tenant\Serve` at logon, as you | Windows service `Tenant`, as SYSTEM |
| Logs | `~/Library/Logs/tenant/serve.log` and `serve.err.log` | `journalctl --user -u tenant -f` | none for stdout (the log book has everything) | none for stdout |
| Stop budget | 90 s | 90 s | 4 s | 120 s |

The unit pins `--config` and `--data` to the directories the install ran with and passes `--stop-budget`, the grace the OS grants a stop.

Platform notes:

- **macOS (TCC).** The install refuses a binary, config dir or data dir under `~/Desktop`, `~/Documents` or `~/Downloads`: macOS silently denies those to a background process. Good homes are `~/.local/bin`, `~/.config/tenant` and `~/Library/Application Support/tenant`. Under launchd Tenant fills in the login-shell `PATH` (`path_helper` plus Homebrew), so `brew`, `node` and the like resolve in commands.
- **Linux (linger).** The user manager stops at logout unless the account lingers. `install` prints `loginctl enable-linger <user>` when it is off; run it once.
- **Windows.** The task keeps a hidden console, which is how logoff and shutdown reach the process; `restart` and `stop` end the task hard, hence the 4-second budget. `--system` is a real service with a Stop control and `sc failure` restarts.

## What runs in serve mode

| Subsystem | Default | Notes |
|---|---|---|
| Agent and the full tool surface | on | memory, skills, recall, helpers |
| Web dashboard | on | the control surface: chat, tools, approvals, models, memory, logs |
| Headless approval queue | on | gated **ask** actions wait on the dashboard's Approvals page and at `/api/approvals` |
| Self-improvement scheduler | on | distill, skill induction, consolidate, user profile; `--self-improve=false` turns it off |
| Scheduled jobs (cron) | on | honours `cron.allow_exec` and `cron.timezone` |
| Remote and local MCP connectors | on | reconnect silently at start |
| Federation peer listener | if `peer.listen` is set | |
| Discord relay | if a bot token is configured and `relay.enabled` | drive the hub from your phone |
| iMessage responder | if `imessage.enabled` | macOS Messages or BlueBubbles |
| Nightly eval, soul nudge, reflection | off | `improve.eval_every`, `improve.soul_nudge_every`, `improve.reflect_every` |
| Daily update check | on | one log line when a newer release exists; `"update_check": false` turns it off |

While the model is unreachable Tenant degrades to the offline echo backend and suspends every autonomous job (cron, self-improvement, relay turns). The reconnect monitor restores the model without a restart once the endpoint answers again.

Flags of `tenant serve` (also used by the unit):

| Flag | Default | Effect |
|---|---|---|
| `--dashboard-addr ADDR` | `127.0.0.1:8770` | listen elsewhere; a non-loopback address is refused without TLS and a key ([dashboard](/tenant/docs/dashboard/overview)) |
| `--dashboard=false` | | run without the panel |
| `--self-improve=false` | | no background distill, consolidate or profile jobs |
| `--distill-every 10m`, `--profile-every 15m` | | cadences of the self-improvement jobs |
| `--eval-every 24h` | off | the nightly eval (also `improve.eval_every` / `improve.eval_at`) |
| `--allow-no-memory` | | start even when embeddings are down |
| `--stop-budget 90s` | 5 s hand-run | how long a stop may take before the teardown is cut short |

## Restarts and shutdowns lose nothing

A stop has two speeds. The first seconds make the data safe on every OS: the turn gate closes, pending approvals are denied, and every turn in flight is cancelled at once (the model call ends, a running tool's child process dies with the process group or job object). Every message is already in the archive, the stores are WAL SQLite, and the file tools replace files by rename, so a kill at any instant leaves the old file or the new one, never a torn one. The stop budget then bounds the tidy teardown: stop intake (peer listener, Discord relay, dashboard), drain, close the stores last.

What you see afterwards:

- A Discord or iMessage turn the stop cut gets, within 2 seconds: "I was stopped mid-task by a system shutdown or restart. Say `continue` when I'm back." After boot each recorded channel gets one more line naming the time, the task and how many tool calls had run. The turn is **never re-run on its own**: say `continue` and the agent picks up from the archive.
- Discord DMs sent while Tenant was down are routed after boot, oldest first (text only; attachments are not fetched). iMessage catches up through its `chat.db` cursor.
- A cron run the stop cut is marked `interrupted: Tenant stopped` in its history; its next run is the next scheduled one.

## Health

`tenant doctor` probes a running hub's `/api/status` and warns on a stuck turn or a waiting approval queue; it skips silently when no hub is running. `GET /healthz` answers without the sign-in key, for an uptime monitor.

```bash
tenant attach --follow                 # tail the running hub's activity feed
tenant attach --follow --source cron   # one log folder only
tenant logs query "level>=warning since:24h"
```
