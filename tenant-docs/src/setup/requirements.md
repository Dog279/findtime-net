---
title: Requirements
description: What Tenant needs on the machine that runs it, and what it needs to reach.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

Tenant is a single, statically linked, CGO-free binary. It has no runtime dependencies of its own: no Python, no database server, no service mesh. What it needs is a machine to run on and a model to talk to.

## Operating systems and CPUs

| OS | CPU | Notes |
|---|---|---|
| macOS | Apple silicon (`aarch64`) and Intel (`x86_64`) | The `restricted` execution sandbox (Seatbelt) exists only here. |
| Linux | `x86_64` and `aarch64` | Commands run on the host until the container sandbox backend ships. |
| Windows | `x86_64` and `aarch64` | Commands run in PowerShell on the host. `tenant service install --system` installs a real Windows service. |

Releases ship one archive per OS and CPU, with SHA-256 checksums and an SBOM. See [Install](/tenant/docs/setup/install).

## A model

Tenant brings no model. Point it at one of:

- **A local server** on this machine or your network: [Ollama](https://ollama.com), llama.cpp's server, vLLM, or anything that speaks `/v1/chat/completions` (LM Studio, LocalAI, SGLang, a LiteLLM proxy). Budget roughly 6 to 10 GB of disk for a small chat model.
- **A cloud API key**: OpenAI, Anthropic, xAI (Grok), Z.ai (GLM), or Sakana (Fugu).
- **The Claude Code CLI**: a logged-in `claude` install, billed against that subscription, no API key.

The full catalog, with default endpoints and tool formats, is on [Providers](/tenant/docs/models/providers).

> **Tool calling matters.** The agent is a planner that calls tools. A local model must be able to emit function calls (`qwen2.5`, `llama3.1` and the Qwen3 and Gemma families do). The setup wizard and the dashboard's **Model** page send one test message to check.

## Embeddings (for memory)

Memory recall needs an embedding model. The default is a local Ollama serving `nomic-embed-text` (768 dimensions) at `http://localhost:11434`:

```bash
ollama pull nomic-embed-text
```

Without a reachable embedder Tenant falls back to a hash stand-in: it starts, but it cannot recall past episodes or stored facts. `tenant doctor` flags it; `tenant tui --allow-no-memory` and `tenant serve --allow-no-memory` let you run amnesiac on purpose.

## Optional

| For | You need |
|---|---|
| The web plugin (browse, read, screenshot, click) | Google Chrome or Chromium on the machine. Chrome's own process sandbox stays on; `TENANT_CHROME` points at a specific binary. |
| iMessage on a Mac | Full Disk Access for the terminal (or the `tenant` binary): System Settings → Privacy &amp; Security → Full Disk Access. BlueBubbles works from any OS instead. |
| Reaching the dashboard from your phone | [Tailscale](https://tailscale.com) on the machine; `/tailscale serve` publishes the dashboard on your tailnet over HTTPS. |
| Signature verification on `tenant update` | `cosign` on `PATH`. Without it the SHA-256 is still checked. |
| Building from source | Go 1.26 or newer. |
