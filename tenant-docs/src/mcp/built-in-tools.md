---
title: Built-in tools
description: The first-party plugins compiled into the binary, every tool they register, the launch flags and allow flags, the one-shot commands, and how to turn tools on and off live.
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

Each plugin registers tools with the tool multiplexer. A plugin is **read by default**: its acting tools are gated by a [permission category](/tenant/docs/first-launch/permissions), and an `--<plugin>-allow-*` flag or a saved mode opens them.

## Turning tools on and off

```text
/tools                          every tool and its state
/enable os                      a whole plugin (smart match)
/enable os_sysinfo              one tool
/enable skill gsuite            every tool of an integration, explicitly
/disable web                    off: it leaves the prompt entirely (no context, no compute)
```

The choice persists in `settings.<agent>.json` (`tools`) and overrides the launch flags on the next run; tools missing from the map keep their flag default. The dashboard's **Tools** page toggles tools and plugins, with **All on** / **All off** for the acting tools (confirming first). Heavy plugins (Chrome, a database handle, a Google sign-in) initialize lazily on first enable. Several plugins (SQL, wiki, CRM, iMessage, Discord) pick up config changes on `/disable` then `/enable`, no restart. Turning on iMessage with `/imessage respond` or `/enable imessage` gives the agent its tools at once.

## The plugins

| Plugin | Tools | Launch flags | Acts with |
|---|---|---|---|
| **os** | `os_sysinfo`, `os_list_dir`, `os_read_file` (paged: `offset`, `limit`), `os_read_image`, `os_processes`, `os_exec`, `os_process`, `os_write_file`, `os_edit_file`, `os_append_file`, `os_make_dir` | `--os`, `--os-write-roots DIRS`, `--os-deny-roots DIRS` | `--os-allow-exec` (`exec`), `--os-allow-write` (`write`) |
| **web** | `web_search`, `web_navigate`, `web_read`, `web_links`, `web_find`, `web_screenshot`, `web_click`, `web_fill`, `web_select` | `--web`, `--web-show` (a visible Chrome window) | `--web-allow-interact` (`web`) |
| **sql** | `sql_schema`, `sql_query`, `sql_exec` | `--sql-db FILE` (SQLite) | `--sql-allow-write` (`destructive` for DROP/ALTER) |
| **wiki** | `wiki_list`, `wiki_read`, `wiki_search`, `wiki_links`, `wiki_suggest_links`, `wiki_reindex` | `--wiki-dir DIR` (a Markdown folder; a transparent indexer) | read-only |
| **gsuite** | `gmail_search`, `gmail_read`, `gmail_labels`, `gmail_draft`, `gmail_modify`, `gmail_send`, `gmail_trash`, `calendar_calendars`, `calendar_list`, `calendar_freebusy`, `calendar_create`, `calendar_update`, `calendar_delete`, `drive_list`, `drive_search`, `drive_read`, `drive_folder`, `drive_create`, `drive_update`, `drive_trash` | `--gsuite`, `--gsuite-auth gcloud\|sa`, `--gsuite-sa-json FILE`, `--gsuite-subject EMAIL` | `--gsuite-allow-send` (`send`) |
| **x** | `x_search`, `x_get_tweet`, `x_get_user`, `x_user_timeline`, `x_post`, `x_delete` | `--x`, `--x-bearer TOKEN` | `--x-allow-post` (`send`) |
| **imessage** | `imessage_list_chats`, `imessage_read_chat`, `imessage_search`, `imessage_send`, `imessage_new_chat` | `--imessage`, `--bb-url URL`, `--bb-password P`, `--bb-private-api` | `--imessage-allow-send` (`send`) |
| **discord** | `discord_list_guilds`, `discord_list_channels`, `discord_read_channel`, `discord_send_message`, `discord_react` | `--discord`, `--discord-bot-token T` | `--discord-allow-send` (`send`) |
| **github** | `github_search`, `github_list_files`, `github_read_file`, `github_changes`, `github_get_issue`, `github_get_pr`, `github_pr_checks`, `github_check_logs`, `github_merge_readiness`, `github_create_branch`, `github_delete_branch`, `github_create_issue`, `github_comment`, `github_create_pr`, `github_update_pr`, `github_merge` | `--github`, `--github-repo owner/name`, `--github-api-base URL` | `--github-allow-write`, or `/github write owner/name` |
| **atlassian** | `jira_search`, `jira_get`, `jira_transitions`, `jira_create`, `jira_comment`, `jira_transition` | `--atlassian`, `--atlassian-site`, `--atlassian-email`, `--atlassian-project`, `--atlassian-client-id`, `--atlassian-oauth-callback` | `--atlassian-allow-write` |
| **simplefin** | `money_balances`, `money_transactions`, `money_spend`, `money_sync` | configured by setup token | read-only |
| **crm** | `crm_lookup`, `crm_search`, `crm_show`, `crm_history`, `crm_ask`, `crm_align`, `crm_commitments_list` | `--crm-tool-path FILE` (an external `crm-tool` binary) | `--crm-allow-mutate` |
| **cron** | `cron_list`, `cron_add`, `cron_set_enabled`, `cron_run_now`, `cron_remove` | always on in `tui` and `serve` | `cron.allow_exec` for shell jobs |
| **mcp** | `mcp_list`, `mcp_add`, `mcp_trust`, `mcp_remove` | always on in `tui` and `serve` | the `mcp` category |
| **memory** | the recall and `skill_save` tools | always on | `skill_save` output waits for trust |

A permission mode saved on the dashboard or in `settings.<agent>.json` wins over an `--allow-*` flag. The keys and sign-ins each integration needs are on [Integrations](/tenant/docs/mcp/integrations).

## One-shot commands

Each plugin has a shell command that runs **one agent turn scoped to that plugin**, read-only unless you pass its allow flag:

```bash
tenant os "what is using the most disk in my home dir?"          # --allow-exec, --allow-write to act
tenant web "summarize the top story on Hacker News"               # --show, --allow-interact
tenant sql "which customers churned last month?" --db ./shop.db   # --allow-write
tenant wiki "what did we decide about caching?" --dir ~/notes
tenant gsuite "what is on my calendar tomorrow?"                   # --auth gcloud|sa, --sa-json, --subject; --allow-send
tenant x "what are people saying about Go 1.26?"                   # --bearer; --allow-post; x --login runs the OAuth consent once
tenant imessage "did Pat reply?"                                   # --bb-url, --bb-password, --private-api; --allow-send
tenant simplefin [--days N]                                        # balances and recent transactions, no agent turn
tenant atlassian login --site <url> --client-id <id>              # the OAuth sign-in ($ATLASSIAN_CLIENT_SECRET)
tenant oauth-setup gsuite                                          # set up the Google Workspace OAuth client
```

## Notes on specific plugins

- **os.** The file tools write only under the write roots (default: Tenant's config and data dirs, your Desktop, Documents and Downloads, and the temp dir; `--os-write-roots` adds) and never touch the deny roots (`--os-deny-roots`; Windows, Program Files and ProgramData by default). Tenant's own control and secret files are off limits either way. `os_exec` runs where [the sandbox](/tenant/docs/first-launch/sandbox) says. `os_read_image` shows a model that can see the picture it read.
- **web.** Drives a headless Chrome with its process sandbox on. Searches use Tavily or Brave when a key is set; page reading falls back to Jina Reader only if you turn that on (it sends failed-page URLs to a third party). Screenshots go to `<data>/screenshots/`, and `web_screenshot` shows a model that can see the top of the page.
- **github.** Watched repositories are `/github`; `/github write owner/name` lets the agent modify one (each write still gated per action), `/github readonly owner/name` makes it watch-and-report only, with writes refused in code. A gated merge path checks readiness and CI first.
- **wiki.** Plain Markdown in a folder you own; research reports are deposited there. The tools name the folder so the model does not search the disk for it.
- **imessage.** On a Mac, reads Messages' `chat.db` directly (Full Disk Access) and names senders from Contacts; set a BlueBubbles URL to use it from any OS. The responder (reply to texts on its own) is a separate switch: [Access](/tenant/docs/dashboard/access).
