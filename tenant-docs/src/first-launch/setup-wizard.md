---
title: The setup wizard
description: tenant setup writes config.json and your keys once, so you never pass a wall of flags again. Every step, every flag, and the non-interactive form.
area: First launch
area-url: /tenant/docs/first-launch/setup-wizard
---

```bash
tenant setup
```

The wizard runs in the terminal with arrow keys and <kbd>Enter</kbd>. It prints where it will write (`<config>/config.json` and `<config>/credentials.json`), then walks four steps. The first interactive `tenant tui` or `tenant chat` with no config offers to run it for you.

## Existing config: Modify, Keep or Reset

When a config already exists you choose first:

| Choice | Effect |
|---|---|
| **Modify** | open a list of sections (Model provider, Embeddings, Gateway, Skills) and change one at a time; untouched sections keep their values |
| **Keep** | print the current configuration and exit |
| **Reset** | start fresh, discarding the config and stored credentials |

## Step 1: provider and model

1. **Model provider.** One of the catalog kinds: `vllm`, `ollama`, `llamacpp`, `openai-compat`, `openai`, `grok`, `zai`, `zai-coding`, `zai-coding-cn`, `zai-metered`, `sakana`, `anthropic`, `claudecode`, `echo`. [Providers](/tenant/docs/models/providers) describes each.
2. **Endpoint (base URL).** Defaults to the kind's endpoint (`http://localhost:11434` for Ollama, `https://api.openai.com` for OpenAI). Give the base, without `/v1`.
3. **Auth**, for keyed kinds: **Paste &amp; store the key** (saved to the owner-only `credentials.json`) or **Reference an env var** (read `$OPENAI_API_KEY`, `$ANTHROPIC_API_KEY`, `$XAI_API_KEY`, `$ZAI_API_KEY` or `$SAKANA_API_KEY` at launch).
4. **Model.** For a local kind the wizard probes `<endpoint>/v1/models` and lists what it finds; leave it blank to auto-detect at launch. For a cloud kind the default is the kind's (`gpt-4o`, `claude-sonnet-4-20250514`, `glm-4.6`, `grok-2-latest`, `fugu-ultra`, `opus`).
5. **Tool format**, for OpenAI-compatible kinds: `qwen`, `gemma`, `llama`, `mistral` or `openai`. Keep the kind's default (`openai` for Ollama and cloud APIs, `gemma` for vLLM) unless you know the model's family needs another. Anthropic and Claude Code skip this step.

## Step 2: embeddings

Skipped for `echo`. The default is a local Ollama at `http://localhost:11434` serving `nomic-embed-text` (768 dimensions). The wizard probes the endpoint and prints a hint if it is down. Memory recall depends on this: see [Memory &amp; soul](/tenant/docs/first-launch/memory).

## Step 3: gateway

How `tenant mcp-memory` exposes Tenant's memory to other MCP clients: **local** (stdio only, the default) or **sse** (HTTP + SSE on an address such as `127.0.0.1:8765`). See [Tenant as an MCP server](/tenant/docs/mcp/memory-server).

## Step 4: skills (integrations)

Interactive runs end by offering each integration: Google Workspace, Discord, iMessage, X, GitHub, Atlassian, SimpleFIN, the web search keys, the SQL database path and the wiki folder. Each asks for its fields and probes the credentials. The same forms are `/configure <id>` in the terminal UI and **Integrations** on the dashboard; see [Integrations](/tenant/docs/mcp/integrations).

## The end

The wizard saves, prints a summary (`tenant setup --show` prints it again any time), and asks **Run Tenant in the background when you log in?** Yes installs the [background service](/tenant/docs/setup/service).

## Flags

| Flag | Effect |
|---|---|
| `--provider KIND` | preselect a provider |
| `--vllm-endpoint URL` | the provider's base URL |
| `--vllm-model NAME` | the model id |
| `--vllm-tool-format FMT` | `qwen`, `gemma`, `llama`, `mistral` or `openai` |
| `--api-key KEY` | store this key for the provider |
| `--embed-endpoint URL`, `--embed-model NAME`, `--embed-dim N` | the embeddings provider (`nomic-embed-text` is 768, `bge-m3` is 1024) |
| `--gateway ADDR` | serve `mcp-memory` over HTTP + SSE on this address |
| `--local` | `mcp-memory` uses stdio (clears a saved gateway address) |
| `--show` | print the current configuration and exit |
| `--reset` | ignore any existing config and start fresh |
| `--non-interactive` | do not prompt; persist the flags, the existing config and the defaults as they are |
| `--config DIR`, `--data DIR` | the directories to write |

Non-interactive examples:

```bash
# a local Ollama model
tenant setup --non-interactive --provider ollama --vllm-model qwen2.5:7b \
  --embed-endpoint http://localhost:11434 --embed-model nomic-embed-text

# a cloud key, stored
tenant setup --non-interactive --provider anthropic --api-key sk-ant-...

# the Claude Code subscription backend (no key; needs a logged-in `claude` CLI)
tenant setup --non-interactive --provider claudecode
```

In a Modify run, flags you pass apply to their section first, then the section list opens.

## Inside the terminal UI

`/setup` opens an arrow-key version of the same menu (provider, model, endpoint, key, embeddings, gateway) without leaving the chat, and `/configure` is the key picker for any service. Changes apply live and persist.
