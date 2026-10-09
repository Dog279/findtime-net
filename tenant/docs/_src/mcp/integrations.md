---
title: Integrations
description: "The services with keys or sign-ins: Google Workspace, Discord, iMessage, X, GitHub, Atlassian, SimpleFIN, web search. Each one's fields, where the secret lives, and the three ways to configure it."
area: MCPs &amp; tools
area-url: /tenant/docs/mcp/overview
---

An integration's non-secret settings live in `config.json` under `skills.<id>` (`enabled`, `settings`); its secrets live in `credentials.json` under `skill:<id>:<field>`. Configuring one probes the credentials and auto-enables it.

## Three ways to configure

```text
/configure                        arrow-key key picker: set an API key for any service
/configure <id>                   interactive walkthrough, one field at a time (e.g. /configure gsuite)
/configure <id> <key=value …>     one shot (e.g. /configure gsuite auth=gcloud)
/skill list                       the integrations and their state
/skill show <id>                  fields with masked values
/skill probe <id>                 re-test the credentials without changing anything
/skill clear <id> <field>         remove a stored credential (auto-disables if a required field goes)
/cancel                           abort a walkthrough
```

`tenant setup` offers the same forms at its end (and under Modify → Skills), and the dashboard's **Integrations** page has **Test connection**, **Save** and **Disconnect**; **Provider keys** holds every API key (write-only: a key you paste is never shown again, only replaced or removed).

## The integrations

| Id | Fields (`*` required) | Secret stored as | Environment alternative |
|---|---|---|---|
| `gsuite` | `auth`* (`gcloud`, `sa` or `oauth`), `sa_json` (service-account key path), `subject` (the user to impersonate), `oauth_creds_json` (OAuth client JSON) | the key files you point at | |
| `discord` | `token`*, `operator_id`* (your Discord user id: 17 to 20 digits) | `skill:discord:token` | `DISCORD_BOT_TOKEN` |
| `imessage` | `url` (BlueBubbles server; blank on a Mac reads Messages directly), `password` | `skill:imessage:password` | `BLUEBUBBLES_URL`, `BLUEBUBBLES_PASSWORD` |
| `x` | `bearer`* (your X app token) | `skill:x:bearer` | `X_BEARER_TOKEN` |
| `github` | `repo`* (comma-separated `owner/name`, `:write` suffix for writable), `token`* (fine-grained PAT), `allow_write`, `api_base` (GitHub Enterprise) | `skill:github:token` | |
| `atlassian` | `auth`* (`mcp` default, `oauth`, or `token`), `site`*, `project`, `client_id`* and `client_secret`* (oauth), `email`* and `api_token`* (token) | `skill:atlassian:client_secret`, `skill:atlassian:api_token` | `ATLASSIAN_TOKEN`, `ATLASSIAN_CLIENT_SECRET` |
| `simplefin` | `access_url`* (the setup token from bridge.simplefin.org, or a claimed access URL) | `skill:simplefin:access_url` | |
| `web` | `jina_reader` (off unless enabled: sends failed-page URLs to r.jina.ai), `brave_key` | `brave_search`, `tavily`, `jina` | `BRAVE_SEARCH_API_KEY` / `BRAVE_API_KEY`, `TAVILY_API_KEY` / `TAVILY_KEY`, `JINA_API_KEY` / `JINA_KEY` |
| `sql` | `db` (a SQLite file path; a folder is rejected) | | |
| `wiki` | `dir` (the Markdown folder) | | |
| `crm` | the external `crm-tool` binary | | `CRM_TOOL_PATH` |

An environment variable wins over a stored secret.

## Setup notes

**Google Workspace.** Three auth modes, in order of fit: `gcloud` (Application Default Credentials from the `gcloud` CLI, for your own account), `sa` (a service account with domain-wide delegation, impersonating `subject`; the one for a business deployment), and `oauth` (a Desktop-app OAuth client JSON; `tenant oauth-setup gsuite` walks through creating it). Domain-wide delegation matches scope strings exactly and is per client id. Sending (`gmail_send`, `calendar_create`) follows the `send` category.

**Discord.** Create the bot at discord.com/developers/applications, invite it to a server (OAuth2 → bot), paste the token. The same token powers two things: the Discord plugin (read channels, send, react as the bot) and the **relay**, which lets your DMs drive the agent and approve actions with buttons; the relay is its own switch, see [Access](/tenant/docs/dashboard/access). Your user id (Developer Mode → right-click your name → Copy User ID) is the operator the relay obeys.

**iMessage.** On a Mac Tenant reads Messages directly and needs Full Disk Access; nothing to configure. BlueBubbles serves Messages from a Mac to any OS: give its URL and password. The autonomous responder and its allowlist are on [Access](/tenant/docs/dashboard/access).

**X.** Reads use the app token; posting needs the one-time OAuth consent (`tenant x --login`, with `--client-id` and `--redirect-uri` matching the app), cached in `<data>/x-token.json`.

**GitHub.** A fine-grained personal access token scoped to the repositories you list. A repository is read-only unless listed with `:write` (or `/github write owner/name`); `allow_write` skips the per-action prompt on writable repositories.

**Atlassian.** The default path is the Atlassian MCP server (`/mcp add https://mcp.atlassian.com/v1/mcp`, a browser sign-in); the plugin's own `oauth` and `token` paths exist for Jira without MCP. `tenant atlassian login --site <url> --client-id <id>` runs the OAuth sign-in with the secret in `ATLASSIAN_CLIENT_SECRET`.

**SimpleFIN.** Link your banks at bridge.simplefin.org; your bank credentials never touch Tenant. Paste the setup token once; it is claimed into an access URL. Read-only: balances, transactions, spend summaries.

**Web search.** Without a key, `web_search` drives Chrome. A Tavily or Brave key gives an API search; Jina Reader is a page-extraction fallback that is off until you enable it, because it sends URLs to a third party.

Every `tenant doctor` run includes one check per enabled integration (for example **discord (if enabled)**: the token resolves and reaches Discord). Removing an integration's credentials: `/skill clear <id> <field>`, the **Integrations** page's **Disconnect**, or `tenant privacy forget --connector <id>`.
