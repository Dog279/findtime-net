---
title: Environment variables
description: Every environment variable Tenant, its installer and its integrations read.
area: Reference
area-url: /tenant/docs/reference/config
---

An environment variable is read at launch (or by the script that reads it). A key given this way wins over one stored in `credentials.json`.

## Tenant

| Variable | Read by | Meaning |
|---|---|---|
| `TENANT_LOG` | every command | lowers the log book's level floor for this launch (`debug`); serve also tees stderr at this level |
| `TENANT_CHROME` | the web plugin | the Chrome or Chromium binary to drive |
| `TENANT_CLAUDE_BIN` | the `claudecode` provider | the `claude` CLI binary, when it is not on `PATH` |
| `TENANT_UPDATE_REPO` | `tenant update` | `owner/name` of the repository to check for releases (a fork or mirror) |
| `TENANT_TRACE_ID`, `TENANT_ACTIVITY_ID` | programs Tenant starts | the turn and operation ids, so a line the program files joins the right timeline |
| `XDG_CONFIG_HOME`, `XDG_DATA_HOME` | Linux | the parents of the config and data dirs |
| `LOCALAPPDATA`, `APPDATA` | Windows | the parents of the data and config dirs |

## The install scripts

| Variable | Meaning |
|---|---|
| `TENANT_VERSION` | the version to install, without the leading `v` (default: the latest release) |
| `TENANT_INSTALL_DIR` | where the binary goes (default `~/.local/bin`, or `%LOCALAPPDATA%\Programs\tenant`) |
| `TENANT_REPO` | the GitHub `owner/name` asked for the latest release |
| `TENANT_BASE_URL` | a directory URL that holds the archive and `checksums.txt` |

## Model providers

Referenced by `auth.key_env`, or read when the wizard's **Reference an env var** was chosen.

| Variable | Provider |
|---|---|
| `OPENAI_API_KEY` | `openai` |
| `ANTHROPIC_API_KEY` | `anthropic` |
| `XAI_API_KEY` | `grok` |
| `ZAI_API_KEY` | `zai`, `zai-coding`, `zai-coding-cn`, `zai-metered` |
| `SAKANA_API_KEY` | `sakana` |

The eval judge's key is read from `improve.judge_key_env` (default: the kind's variable above).

## Integrations

| Variable | Integration |
|---|---|
| `DISCORD_BOT_TOKEN` | Discord (`--discord-bot-token`) |
| `X_BEARER_TOKEN` | X (`--x-bearer`) |
| `BLUEBUBBLES_URL`, `BLUEBUBBLES_PASSWORD` | iMessage over BlueBubbles (`--bb-url`, `--bb-password`) |
| `ATLASSIAN_TOKEN` | Atlassian, API-token path (`--atlassian-email`) |
| `ATLASSIAN_CLIENT_SECRET` | Atlassian, OAuth path (`tenant atlassian login`) |
| `CRM_TOOL_PATH` | the external `crm-tool` binary (`--crm-tool-path`) |
| `TAVILY_API_KEY` or `TAVILY_KEY` | web search (Tavily) |
| `BRAVE_SEARCH_API_KEY` or `BRAVE_API_KEY` | web search (Brave) |
| `JINA_API_KEY` or `JINA_KEY` | Jina Reader (page extraction fallback; off until enabled) |

Google Workspace reads the files you point at (`--gsuite-sa-json`, the OAuth client JSON) and, in `gcloud` mode, the `gcloud` CLI's Application Default Credentials.
