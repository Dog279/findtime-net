---
title: Scheduled jobs
description: Recurring agent prompts and shell jobs on a crontab or @every schedule, run by the background hub. The schedule syntax, the kinds, the exec switch, catch-up, and the agent's own cron tools.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

A scheduled job is either a **prompt** (an agent turn, with the full tool surface and your permissions) or a **shell** command. Definitions live in `config.json` under `cron.jobs`; run state and history live in `<data>/cron-history.json`, so the config is not rewritten on every run.

## Commands

```text
/cron [list]                      the jobs, with their next run
/cron add <schedule> | <prompt>   e.g. /cron add 0 9 * * 1-5 | run the tests and summarize failures
/cron enable <id> | disable <id>
/cron run <id>                    run once now; the result appears in the feed
/cron rm <id>
/cron exec on | off               the global switch for shell jobs and exec-opted-in prompt jobs (default off)
```

The dashboard's **Scheduled jobs** page adds jobs with preset schedules (the cron line is still typable), shows each job's last error, runs, enables and deletes (confirms first), and has the switch **Scheduled jobs may make changes** (confirms first).

## Schedules

| Form | Meaning |
|---|---|
| `m h dom mon dow` | a standard 5-field crontab: numbers, `*`, ranges, lists and steps; `dow` 0 or 7 is Sunday |
| `@every 30m` | an interval (a Go duration; at least a minute) |
| `@hourly`, `@daily` (`@midnight`), `@weekly`, `@monthly`, `@yearly` (`@annually`) | macros |

Out-of-range values, inverted ranges, zero steps and sub-minute intervals are rejected, never clamped. Times are in `cron.timezone` (an IANA zone; empty is the machine's local time) or the job's own `tz`.

## Configuration

```json
"cron": {
  "timezone": "America/Los_Angeles",
  "allow_exec": false,
  "catchup": false,
  "per_run_minutes": 15,
  "jobs": [
    { "id": "brief", "name": "Daily brief", "spec": "0 7 * * *", "prompt": "Summarize my calendar and inbox for today.", "enabled": true },
    { "id": "tests", "spec": "@every 6h", "kind": "shell", "prompt": "cd ~/proj && go test ./...", "enabled": true, "tz": "UTC" }
  ]
}
```

| Key | Default | Meaning |
|---|---|---|
| `jobs[].id`, `name` | | the id you address; an optional name |
| `jobs[].spec` | | the schedule |
| `jobs[].prompt` | | the prompt (kind `prompt`) or the command line (kind `shell`) |
| `jobs[].kind` | `prompt` | `prompt` or `shell` |
| `jobs[].exec` | false | a prompt job that may use `os_exec`; it only runs while `allow_exec` is on |
| `jobs[].tz` | | the job's own zone |
| `jobs[].enabled` | | paused or not |
| `timezone` | local | the default zone |
| `allow_exec` | false | the global kill-switch: shell jobs and exec-opted-in prompt jobs run only when true |
| `catchup` | false | fire a safe job once at start-up if it missed a cycle while Tenant was down. Leave it off on a 24/7 box: a restart after downtime would fire every missed job at once. |
| `per_run_minutes` | 15 | the wall-clock cap of one run; a request for your OK raised by the job is refused when the run ends |

## How a job runs

- A prompt job is one agent turn on the shared hub, queued behind the active turn with the `cron` source quota ([turn admission](/tenant/docs/models/tuning)). Its tool calls show in the feed and the log views as `cron:<tool>`; its sensitive egress follows the `egress` permission (ask prompts you).
- A shell job runs on the `cron-shell` sandbox surface: on macOS the restricted backend in dry run with no network, elsewhere the host ([The execution sandbox](/tenant/docs/first-launch/sandbox)). A prompt job with `exec` runs commands on `cron-exec`. With enforcement on, a refusal fails the job; cron surfaces never escalate.
- A job's summary starts with a sandbox banner when there were violations since its last run, and with a re-authorization banner while any remote MCP connector needs a sign-in.
- A run cut by a shutdown is marked `interrupted: Tenant stopped` in its history and is not re-run. Each run's lines are in the `cron` log (`tenant logs query "log:cron"`).

## The agent's cron tools

In the terminal UI and serve (never inside a cron run), the agent has `cron_list`, `cron_add`, `cron_set_enabled`, `cron_run_now` and `cron_remove`, so "remind me every weekday at 9 to check the build" becomes a job. Changes are audit records in the log book.

A log alert can also create a one-off prompt job as its action (`"action": {"kind": "cron", "target": "<prompt>"}`); see [Logs &amp; alerts](/tenant/docs/dashboard/logs).
