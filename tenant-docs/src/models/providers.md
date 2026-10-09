---
title: Providers
description: The catalog of model providers Tenant speaks to, local and cloud, with each one's default endpoint, model, tool format and key.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

A **provider** is one model endpoint and how to reach it. `config.json` holds a named set of them under `providers`; `provider` names the active one; `embed` is the separate embeddings provider. Switching is a one-line change, never a re-setup.

## The catalog

Every OpenAI-compatible kind runs through the same backend (it speaks `/v1/chat/completions`); only the endpoint, key and paths differ.

| Kind | Label | Default endpoint | Default model | Tool format | Key |
|---|---|---|---|---|---|
| `vllm` | vLLM (self-hosted) | (yours) | auto-detect | `gemma` | none |
| `ollama` | Ollama (local) | `http://localhost:11434` | auto-detect | `openai` | none |
| `llamacpp` | llama.cpp server (local) | `http://localhost:8080` | auto-detect | `openai` | none |
| `openai-compat` | any `/v1/chat/completions` server (LM Studio, LocalAI, SGLang, a LiteLLM proxy) | (yours) | auto-detect | `openai` | optional |
| `openai` | OpenAI | `https://api.openai.com` | `gpt-4o` | `openai` | `OPENAI_API_KEY` |
| `grok` | Grok (xAI) | `https://api.x.ai` | `grok-2-latest` | `openai` | `XAI_API_KEY` |
| `zai` | Z.ai GLM, coding plan, global (the default Z.ai kind) | `https://api.z.ai/api/coding/paas/v4` | `glm-4.6` | `openai` | `ZAI_API_KEY` |
| `zai-coding` | alias of `zai`, kept for older configs | same | `glm-4.6` | `openai` | `ZAI_API_KEY` |
| `zai-coding-cn` | Z.ai GLM, coding plan, China (bigmodel.cn) | `https://open.bigmodel.cn/api/coding/paas/v4` | `glm-4.6` | `openai` | `ZAI_API_KEY` |
| `zai-metered` | Z.ai GLM, metered per-token API | `https://api.z.ai/api/paas/v4` | `glm-4.6` | `openai` | `ZAI_API_KEY` |
| `sakana` | Sakana AI (Fugu) | `https://api.sakana.ai` | `fugu-ultra` | `openai` | `SAKANA_API_KEY` |
| `anthropic` | Anthropic (Claude) | `https://api.anthropic.com` | `claude-sonnet-4-20250514` | native | `ANTHROPIC_API_KEY` |
| `claudecode` | Claude Code CLI (`claude -p`, billed to that subscription) | `claudecode://auto` (a discovery sentinel) | `opus` | `qwen` | none: the logged-in CLI |
| `echo` | offline, deterministic stand-in for development | | | | none |

Notes:

- **Z.ai** bills differently by path: `/api/coding/paas/v4` against the coding-plan subscription, `/api/paas/v4` per token. A metered account that runs out answers `429 Insufficient balance`, which Tenant reports as out of credits and routes to a [fallback](/tenant/docs/models/fallbacks). Z.ai's load balancer recycles HTTP/2 connections mid-stream, so Tenant uses HTTP/1.1 for it.
- **Claude Code** accepts the CLI's aliases (`opus`, `sonnet`, `haiku`, `fable`) or full model ids. It is deliberately not treated as local capacity by the router: a scarce cloud resource. `TENANT_CLAUDE_BIN` points at a specific `claude` binary.
- **Tokenizing.** Only vLLM exposes `/tokenize`; every other kind budgets context with a chars/4 estimate. `tenant doctor` says which one is in use.
- **Reasoning effort.** `sakana` and `claudecode` accept a per-provider effort hint; see [Reasoning, ceiling &amp; turns](/tenant/docs/models/tuning).

## A provider in config.json

```json
"provider": "zai",
"providers": {
  "zai":   { "kind": "zai", "endpoint": "https://api.z.ai/api/coding/paas/v4", "model": "glm-4.6",
             "tool_format": "openai", "auth": { "mode": "apikey", "stored": true } },
  "local": { "kind": "ollama", "endpoint": "http://localhost:11434", "model": "qwen2.5:14b", "tool_format": "openai" },
  "claude": { "kind": "anthropic", "endpoint": "https://api.anthropic.com", "model": "claude-sonnet-4-20250514",
              "auth": { "mode": "apikey", "key_env": "ANTHROPIC_API_KEY" } }
},
"embed": { "kind": "ollama", "endpoint": "http://localhost:11434", "model": "nomic-embed-text", "embed_dim": 768 }
```

| Field | Meaning |
|---|---|
| `kind` | a catalog kind above |
| `endpoint` | the base URL, without `/v1` |
| `model` | the model id; empty means auto-detect at launch from `/v1/models` |
| `tool_format` | `qwen`, `gemma`, `llama`, `mistral`, `openai`, or `auto` to follow whatever model the server serves |
| `embed_dim` | embeddings only: the vector size (`nomic-embed-text` 768, `bge-m3` 1024) |
| `auth.mode` | `none`, `apikey` or `oauth` |
| `auth.key_env` | read the key from this environment variable at launch (wins over a stored key) |
| `auth.stored` | the key is in `credentials.json` under the provider's name |
| `reasoning` | `""`, `high`, `xhigh` (Fugu), or `low` to `max` (Claude Code): the effort hint |
| `vision` | `on`, `off`, or `auto` (the default, also when empty): whether the model is sent images; `auto` lets Tenant test it ([Images](/tenant/docs/models/local#images)) |

The name of a provider is yours (`zai`, `local`, `gpu-box`); the kind is from the catalog.

## Keys

Keys never live in `config.json`. Three ways to supply one:

| Way | How |
|---|---|
| stored | `tenant setup` → Paste &amp; store; `/model add-cloud <kind> <key>`; `/configure`; the dashboard's **Provider keys** page. Saved to `<config>/credentials.json` under the provider name, owner-only. |
| environment | `tenant setup` → Reference an env var, or `"auth": {"key_env": "OPENAI_API_KEY"}`; read at launch. An env var wins over a stored key. |
| one launch | `--api-key KEY` on any command |

After rotating a key, `/model reload` (or **Reload API keys** on the dashboard's **Model** page) re-resolves the active provider's key live. `tenant doctor` checks that every keyed provider has a resolvable secret.

## Add a provider

- Interactive: `tenant setup` (Modify → Model provider) or `/setup` in the terminal UI.
- One line, cloud: `/model add-cloud zai sk-…` registers the kind, stores the key and names the provider after the kind (`zai`, `openai`, `grok`, `anthropic`).
- One line, Claude Code: `/model add claudecode`.
- Self-hosted: `/model add <name> <endpoint> [fmt]` or `tenant model add <name> --endpoint URL [--kind K] [--model M] [--tool-format F]`.
- Dashboard: **Model** → "Add a model from a server on your network" (probes the server, finds its kind, and sends one tool-call test) or "Add a cloud model".

Then switch to it: [Switching models](/tenant/docs/models/switching). Local servers in detail: [Local models](/tenant/docs/models/local).
