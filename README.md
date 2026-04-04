<div align="center">

```

                  ██████████████████████
              ██████████████████████████████
            ██████████████████████████████████
          ██████████████████████████████████████
          ██████████████████████████████████████
          ████████▓▓▓▓████████████▓▓▓▓████████
          ████████▓▓▓▓████████████▓▓▓▓████████
          ████████░░▓▓████████████░░▓▓████████
          ████████░░▓▓████████████░░▓▓████████
          ██████████████████████████████████████
          ██████████████████████████████████████
          ██████████████████████████████████████
          ██████████████████████████████████████
          ██████████████████████████████████████
          ████▀▀██████▀▀████▀▀██████▀▀████████

```

# 👻 Gemma Code

### Multi-Agent Coding CLI with Infinite Memory

**An AI coding agent with a research-grade memory architecture. Runs 100% locally on llama.cpp. No API keys. No cloud. No data leaves your machine.**

[![TypeScript](https://img.shields.io/badge/TypeScript-6.2K_lines-3178C6?logo=typescript&logoColor=white)](#architecture)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun&logoColor=white)](#quick-start)
[![llama.cpp](https://img.shields.io/badge/Backend-llama.cpp-000000)](#quick-start)
[![Gemma 4](https://img.shields.io/badge/Model-Gemma_4-4285F4)](#model-support)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## What is Gemma Code?

Gemma Code is a **multi-agent coding system** that runs in your terminal. Give it a task — it plans, spawns specialized workers, reads your codebase, makes changes, runs tests, and iterates until the job is done. It **never forgets** what it's doing, even across long sessions, thanks to a layered memory architecture inspired by [MemGPT](https://memgpt.ai) and [EM-LLM](https://arxiv.org/abs/2407.09450).

Unlike cloud-based coding assistants, Gemma Code:
- **Never sends your code to any server** — 100% local inference via llama.cpp
- **Requires zero API keys** — just a GGUF model file
- **Has infinite memory** — episodic memory, scratchpad, task tracking, and persistent storage mean it never loses context
- **Spawns worker agents** — orchestrator decomposes complex tasks into parallel subtasks
- **Has vision** — analyze screenshots, mockups, and images
- **Is security-hardened** — OWASP-aligned capability gating blocks dangerous operations

---

## Architecture Overview

```
User types "gemma"
  │
  ▼
┌──────────────────────────────────────────────────────┐
│  llama-server (auto-launched, auto-downloaded)       │
│  gemma4 GGUF + vision | /v1/chat/completions API     │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Context Compiler                         │
│  Assembles optimal prompt from token budget:          │
│  ┌─────────────────────────────────────────────┐     │
│  │  15% System prompt (lean, hardware-aware)   │     │
│  │  20% Pinned state (goal + tasks + scratch)  │     │
│  │  10% Retrieved memory (compressed episodes) │     │
│  │  50% Conversation window (recent messages)  │     │
│  │   5% Recovery instructions                  │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Agent Loop                               │
│  ┌────────────────────────────────────────────┐      │
│  │ 10 Tools:                                  │      │
│  │  Read, Write, Edit, Bash, Glob, Grep       │      │
│  │  TaskTracker, Scratchpad, SpawnAgent        │      │
│  │  + Tool call repair (fixes malformed JSON)  │      │
│  │  + Capability gating (OWASP security)       │      │
│  └────────────────────────────────────────────┘      │
│                                                       │
│  Can spawn worker agents:                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Worker   │ │ Worker   │ │ Worker   │             │
│  │"backend" │ │"tests"   │ │"docs"    │             │
│  │ Own ctx  │ │ Own ctx  │ │ Own ctx  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Memory Hierarchy                         │
│                                                       │
│  Layer 1: Scratchpad (always in context)              │
│    Agent writes findings → survives all compaction    │
│                                                       │
│  Layer 2: Task Plan (pinned every call)               │
│    [x] done [>] doing [ ] pending [!] failed          │
│                                                       │
│  Layer 3: Episodic Memory                             │
│    Conversations segmented into episodes at:          │
│    - Topic shifts (heuristic + surprisal logprobs)    │
│    - File context switches                            │
│    - Error spikes, task transitions                   │
│    Retrieved with temporal contiguity (±1 neighbors)  │
│    Compressed before injection (RECOMP, 77% savings)  │
│                                                       │
│  Layer 4: Semantic Memory                             │
│    TF-IDF vector search with metadata filtering       │
│    Fact supersession (old facts invalidated)           │
│    Cached retrieval (LRU, 30s TTL)                    │
│                                                       │
│  Layer 5: Event Log (ground truth)                    │
│    Append-only JSONL of every action                  │
│    Queryable by type, actor, scope, time              │
│                                                       │
│  Layer 6: Checkpoints                                 │
│    Auto-saved every 5 tool rounds                     │
│    /resume to recover from crashes                    │
└──────────────────────────────────────────────────────┘
```

---

## Features

### Infinite Memory System

The agent **never forgets**. Six layers of persistent state ensure continuity across long sessions and even across restarts:

| Layer | Survives | How It Works |
|-------|----------|-------------|
| **Scratchpad** | Everything | Agent writes notes to `.gemma-code/scratchpad.md` — always loaded into context |
| **Task Plan** | Compaction | TaskTracker creates plans, progress pinned before every model call |
| **Goal Anchor** | Compaction | The user's original request is re-injected every turn |
| **Episodic Memory** | Sessions | Conversations segmented into episodes, stored with metadata, searchable |
| **Semantic Facts** | Sessions | TF-IDF vector search with supersession (stale facts auto-invalidated) |
| **Checkpoints** | Crashes | Full conversation snapshots, auto-saved + `/resume` to restore |

### Episodic Segmentation (EM-LLM Approach)

Instead of compacting raw message chunks, Gemma Code segments conversations into **coherent episodes** using:

- **Surprisal boundaries**: logprobs from llama-server detect unexpected content (topic shifts)
- **Heuristic signals**: new user messages, file context switches, error spikes, task transitions
- **Temporal contiguity retrieval**: when searching, retrieves matching episodes *plus* their neighbors to preserve causal context

### Retrieval Compression (RECOMP Pattern)

Retrieved episodes are **compressed before injection** using extractive compression:
- Score each line by token overlap with the current query
- Keep only query-relevant lines, drop noise
- 77% token reduction in testing (241 → 55 tokens)
- Preserves headers, file paths, error messages, and structural markers

### Multi-Agent Orchestrator

For complex tasks, the agent can spawn **specialized workers**:

```
❯ Refactor the entire auth module with tests and docs

Agent spawns:
  🤖 "backend"  → Refactors auth code
  🤖 "tests"    → Writes unit tests
  🤖 "docs"     → Updates documentation

Each worker gets its own context, tools, and task.
Results collected and synthesized by the orchestrator.
```

### Vision

Analyze images directly in the terminal:

```
❯ /Users/joel/screenshot.png What's wrong with this UI?
❯ /paste Implement this mockup          (clipboard image)
❯ /vision design.png Convert to React components
```

- Auto-detects image paths in prompts (handles spaces and escaped paths)
- Clipboard paste support on macOS (`/paste`)
- Works with gemma4's native multimodal capabilities

### Tool Call Repair

Even strong models occasionally produce malformed tool calls. The repair layer fixes:

- Trailing commas, single quotes, unquoted keys in JSON
- Markdown code fences around JSON
- Tool name case mismatches (`read` → `Read`, `shell` → `Bash`)
- Common aliases (`search` → `Grep`, `notepad` → `Scratchpad`)
- Missing closing braces/brackets

### Security (OWASP Capability Gating)

Every tool call passes through a security policy before execution:

| Level | Examples | Behavior |
|-------|----------|----------|
| **Allow** | Read/Write within project, `npm test`, `git status` | Proceed |
| **Confirm** | `rm -rf`, `git push --force`, `git reset --hard`, files outside project | Human confirmation required |
| **Deny** | `curl \| sh`, `eval`, `dd`, `mkfs` | Hard blocked, no override |

### Hardware-Aware

The system prompt adapts to your hardware:
- Detects RAM (free/total), CPU cores, CPU model at runtime
- Low RAM: model avoids spawning many agents, keeps results small
- Context window size detected per model (gemma4 E4B = 256K tokens)

### Request Interruption

Type a new message while the model is responding — it aborts the current request and starts your new one immediately. Ctrl+C also interrupts without exiting.

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) >= 1.1.0
- [llama.cpp](https://github.com/ggml-org/llama.cpp) (`brew install llama.cpp`)

### Install

```bash
# 1. Install llama.cpp
brew install llama.cpp

# 2. Clone and install
git clone https://github.com/JoelHJames1/Qwen-Code.git
cd Qwen-Code
bun install

# 3. Link the command globally
bun link

# 4. Run it! (auto-downloads gemma4 on first run)
gemma
```

### Configuration

Create `~/.config/gemma-code/config.json`:

```json
{
  "model": "gemma4:e4b",
  "hfRepo": "bartowski/google_gemma-4-E4B-it-GGUF",
  "gpuLayers": 99,
  "llamaContextSize": 8192,
  "flashAttn": true
}
```

For the larger 31B model:
```json
{
  "model": "gemma4:31b",
  "hfRepo": "bartowski/google_gemma-4-31B-it-GGUF",
  "gpuLayers": 99,
  "llamaContextSize": 8192,
  "flashAttn": true
}
```

---

## REPL Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/exit` | Exit the session |
| `/clear` | Clear conversation history |
| `/vision <image> <prompt>` | Send image with prompt |
| `/paste [prompt]` | Send clipboard image |
| `/tasks` | Show current task plan |
| `/agents` | Show multi-agent status |
| `/scratchpad` | View agent's persistent notes |
| `/episodes [query]` | Show/search episodic memory |
| `/checkpoint` | Save conversation state |
| `/resume` | Resume from last checkpoint |
| `/budget` | Show context budget allocation |
| `/eventlog [recent]` | Show event log stats |
| `/security` | Show security policy |
| `/tokens` | Show context window usage |
| `/config` | Show resolved configuration |

---

## File Structure

```
src/
├── index.ts              CLI entry point, REPL, request interruption
├── agent.ts              Core agent loop with abort support
├── api.ts                OpenAI-compatible client for llama-server
├── llama-server.ts       Server process lifecycle management
├── config.ts             Layered config (CLI > env > file > defaults)
│
├── context-compiler.ts   Token-budgeted prompt assembly (5 slices)
├── context.ts            Environment detection, system prompt
├── context-window.ts     Token estimation, model context windows
│
├── memory.ts             Smart compaction, fact supersession, vector search
├── episodes.ts           Episodic segmentation, contiguity retrieval
├── surprisal.ts          Logprob-based boundary detection (EM-LLM)
├── compression.ts        Extractive retrieval compression (RECOMP)
├── vectorsearch.ts       TF-IDF search, metadata filtering, LRU cache
├── scratchpad.ts         Persistent agent notepad
├── tasks.ts              Task tracking with persistence
├── checkpoint.ts         Conversation state snapshots
├── eventlog.ts           Append-only JSONL event log
│
├── orchestrator.ts       Multi-agent spawning and coordination
├── capabilities.ts       OWASP capability gating (allow/confirm/deny)
├── errors.ts             Error classification and retry logic
├── tool-repair.ts        Fix malformed tool calls (JSON + name repair)
│
├── tools/
│   ├── index.ts          Tool registry (10 tools)
│   ├── types.ts          ToolDefinition interface
│   ├── read.ts           File reading with pagination
│   ├── write.ts          File creation with auto-mkdir
│   ├── edit.ts           String replacement with fuzzy hints
│   ├── bash.ts           Shell execution with timeout
│   ├── glob.ts           File pattern matching
│   ├── grep.ts           Content search (rg/grep fallback)
│   ├── tasks.ts          TaskTracker tool
│   ├── scratchpad.ts     Scratchpad tool
│   └── agents.ts         SpawnAgent tool
│
└── ui/
    └── display.ts        Terminal output, banner, spinner, colors
```

---

## Research References

The memory architecture is informed by:

- **MemGPT** (Packer et al., 2023) — OS-inspired virtual context management
- **EM-LLM** (Fountas et al., 2024) — Episodic memory with surprisal boundaries and contiguity retrieval
- **RECOMP** (ICLR 2024) — Retrieval-augmented compression
- **StreamingLLM** (Xiao et al., 2023) — Attention sink stabilization
- **RULER** (Hsieh et al., 2024) — Effective context length evaluation
- **LongMemEval** (Wu et al., 2024) — Long-term memory benchmarks (updates, abstention)
- **OWASP LLM Top 10** — Security controls for tool-using agents

---

## License

MIT

---

<div align="center">

**👻 Gemma Code — Your code. Your machine. Infinite memory.**

*33 source files. 6,200 lines. Zero cloud dependencies.*

</div>
