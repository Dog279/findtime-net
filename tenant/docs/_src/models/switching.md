---
title: Switching models
description: Change the model that answers, live, from the terminal UI, the shell or the dashboard. Pick a variant, list what a provider serves, remove one, reload a rotated key.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

The active provider is `provider` in `config.json`. Every way of switching below writes it and takes effect for the next turn, without a restart.

## In the terminal UI

```text
/model                          configured backends and the active one
/model pick                     arrow-key picker: provider → its live model list → swap
/model use <name> [<model>]     switch the primary; optionally pin a model variant (e.g. /model use zai glm-5.1)
/model models [<name>]          the model variants a provider's endpoint serves (live)
/model add <name> <endpoint> [fmt]
/model add-cloud <kind> <key>   register a keyed cloud provider (zai, openai, grok, anthropic)
/model add claudecode           register the Claude Code subscription backend (no key)
/model remove <name>            delete a backend (not the active one)
/model reload                   re-resolve the active provider's key live (after a rotation)
/model fallback <name...>       auto-route to these providers when the active one fails (off to clear)
/whoami                         which agent, backend and model you are talking to, from the configuration
```

`/model pick` fetches the provider's live model list (`/v1/models`, or the provider's catalog for Claude Code), so a new cloud model is one keypress away.

## From a shell

```bash
tenant model list                                   # configured backends and the active one
tenant model show <name>
tenant model use <name> [model]                     # switch; optionally pin a variant
tenant model models [name]                          # what the provider serves, live
tenant model add <name> --endpoint URL [--kind K] [--model M] [--tool-format F]
tenant model remove <name>
```

`--kind` defaults to `vllm`; see the [catalog](/tenant/docs/models/providers) for the others. A shell switch is read by the next launch and by a running hub's next turn.

## On the dashboard

The **Model** page lists every provider with **Use this model** and **Remove** (both confirm first), **Reload API keys**, and the two add forms. For a server on your network, give the address you would give any OpenAI-compatible app (`http://host:port`, with or without `/v1`): the page checks the server, finds its kind (vLLM, llama.cpp, Ollama, or `openai-compat`) and sends one test message that offers the model a tool. If the model answers without using the tool, it is still added with a warning; if the server refuses the test outright (an embedding model, or a model the server will not give tools), it is not added and the server's reason is shown. Nothing changes until you press **Use this model** or give it to a helper.

## What switching does not change

- **Helpers** keep their own pinned provider and model ([Helpers](/tenant/docs/models/helpers)). Built-in helpers inherit the primary, so they follow a switch.
- **Embeddings** are a separate provider (`embed`). Switching the chat model never touches the embedding space; switching the embedder needs `tenant memory reembed`.
- **The route's big model** (`route.big_role`) is pinned by name; see [Prompt routing](/tenant/docs/models/routing).

## Degraded mode

When the active endpoint stops answering (and no [fallback](/tenant/docs/models/fallbacks) is configured), Tenant degrades to the offline echo backend, says so in the feed and on the dashboard's **Overview**, and suspends autonomous work (cron, self-improvement, relay turns). The reconnect monitor restores the model without a restart once the endpoint answers again; `/model reload` forces a re-resolve after a key rotation.
