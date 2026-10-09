---
title: Local models
description: Running Tenant against Ollama, llama.cpp, vLLM or any OpenAI-compatible server. Tool formats, embeddings, model profiles and context budgets.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

Local is the default and the lowest-friction path: no key, no bill, nothing leaves the machine. The chat model and the embedding model are two separate providers and can run on two servers.

## Ollama (the simplest start)

```bash
ollama pull qwen2.5:7b            # a tool-capable chat model (14b is better for agentic work)
ollama pull nomic-embed-text      # the embedding model (required for memory)
ollama serve                      # listens on :11434; auto-starts on macOS
tenant setup --non-interactive --provider ollama --vllm-model qwen2.5:7b
```

The wizard probes `http://localhost:11434/v1/models` and lists the models it finds; `/model pick` does the same later.

## llama.cpp and vLLM

| Server | Kind | Default endpoint | Tool calling |
|---|---|---|---|
| llama.cpp (`llama-server`) | `llamacpp` | `http://localhost:8080` | start it with `--jinja` |
| vLLM | `vllm` | (yours, e.g. `http://gpu-box:8000`) | start it with `--enable-auto-tool-choice --tool-call-parser <parser>` |
| anything else that speaks `/v1/chat/completions` | `openai-compat` | (yours) | depends on the server |

vLLM is the one server Tenant can ask to tokenize (`/tokenize`), so its context budgets are exact; the others use a chars/4 estimate. The dashboard's **Model** page sends a one-tool test message when you add a server and tells you whether the model used the tool.

## Tool formats

Local models write tool calls in their family's dialect. Tenant parses (and repairs) them per format:

| `tool_format` | Families |
|---|---|
| `qwen` | Qwen, QwQ, Hermes fine-tunes |
| `gemma` | Gemma |
| `llama` | Llama |
| `mistral` | Mistral, Mixtral, Devstral, Magistral, Codestral, Ministral, Pixtral |
| `openai` | native `tool_calls` in the response (most Ollama models, every cloud API) |
| `auto` | follow the served model: Tenant reads the family from the model id each time the server reports one, so a server that swaps model families keeps a matching parser |

Set it per provider (`tool_format` in `config.json`, the wizard's **Tool format** step, `/model add <name> <endpoint> <fmt>`, `--vllm-tool-format`). A name is only a guess; a live test call is the proof. Symptoms of a wrong format: the model "answers" with JSON in prose, or tool calls arrive with missing arguments.

## Embeddings

```json
"embed": { "kind": "ollama", "endpoint": "http://localhost:11434", "model": "nomic-embed-text", "embed_dim": 768 }
```

The embedder can be a different server from the chat model. Changing the model after memory has been stored changes the vector space: `tenant doctor` reports an **embedding dimension consistency** failure and `tenant memory reembed` recomputes every stored vector with the current embedder. Without any embedder the agent runs amnesiac (`--allow-no-memory` to start anyway).

## Model profiles and context budgets

Tenant ships embedded profiles for common local models (`qwen3.6-35b-a3b`, `qwen3.6-72b`, `gemma4-70b`, `qwen3-summarizer`, `qwen3-embedding-8b`) and builds one on the fly for any other model. A profile is the policy the runtime applies when calling a model. You can override any of it with a YAML file in `<config>/profiles/`:

```yaml
id: gemma4-70b
role: planner
backend: vllm
endpoint: http://localhost:8002
model: google/gemma-4-70b-it
context_length: 128000             # what the model supports
operational_context_budget: 102400 # what Tenant actually uses, under KV-cache pressure
reserve_soul: 2048                 # identity, persona, persistent user facts
reserve_system_prompt: 3072        # rules, format specs, the tool protocol
reserve_tool_defs: 4096
reserve_response: 80000
tool_format: gemma
supports_grammar: true
max_tools_per_call: 5
max_parallel_tools: 3
plan_loop_ceiling: 10
```

`operational_context_budget` is deliberately separate from `context_length`: treating the two as one number is how a 128K model ends up overflowing under real load.

## Keeping the prompt small

- `"lazy_tools": true` in `config.json` sends the model only the ranked working set of tools plus a `load_tool` meta-tool, with a cheap name-and-description catalog of the rest in the system prompt. Off by default; worth trying on a small-context model with many tools enabled.
- `/disable <plugin>` removes a plugin's tools from the prompt entirely (no context, no compute). See [Built-in tools](/tenant/docs/mcp/built-in-tools).
- `/ceiling <n>` caps tool calls per turn; see [Reasoning, ceiling &amp; turns](/tenant/docs/models/tuning).

## The prompt router

With one small local model and one big model, the [prompt router](/tenant/docs/models/routing) classifies each prompt on a tiny local classifier and sends only the hard ones to the big model.
