/**
 * Multi-agent orchestrator — spawns worker agents, tracks their work,
 * and routes messages between them.
 *
 * Architecture:
 *   User → Orchestrator (main agent)
 *     ├── Worker "frontend" — works on UI tasks
 *     ├── Worker "backend"  — works on API tasks
 *     └── Worker "tests"    — writes/runs tests
 *
 * Each worker has its own conversation context and can:
 * - Use all tools (Read, Write, Edit, Bash, Glob, Grep)
 * - Send messages to other workers or the orchestrator
 * - Report results back when done
 *
 * The orchestrator:
 * - Decomposes the user's request into parallel subtasks
 * - Spawns workers for each subtask
 * - Collects results and synthesizes a final response
 * - Workers run sequentially (share one llama-server) but with isolated contexts
 */

import { chatCompletion, type Message, type ServerConfig } from './api.js'
import { getToolSpecs, getTool, validateToolArgs } from './tools/index.js'
import { buildSystemPrompt, getEnvContext } from './context.js'
import { classifyOllamaError, errorKindMessage } from './errors.js'
import { smartCompact } from './memory.js'
import { pruneIfNeeded } from './context-window.js'

// ── Types ────────────────────────────────────────────────────────────────

export type WorkerStatus = 'idle' | 'running' | 'done' | 'failed'

export interface WorkerAgent {
  id: string
  name: string
  task: string
  status: WorkerStatus
  conversation: Message[]
  result?: string
  error?: string
  messagesReceived: Array<{ from: string; content: string }>
}

export interface OrchestratorState {
  goal: string
  workers: Map<string, WorkerAgent>
  messageLog: Array<{ from: string; to: string; content: string; timestamp: number }>
}

// ── Orchestrator ─────────────────────────────────────────────────────────

let orchestratorState: OrchestratorState | null = null

export function getOrchestratorState(): OrchestratorState | null {
  return orchestratorState
}

/**
 * Create a new orchestrator for a multi-agent task.
 */
export function createOrchestrator(goal: string): OrchestratorState {
  orchestratorState = {
    goal,
    workers: new Map(),
    messageLog: [],
  }
  return orchestratorState
}

/**
 * Spawn a new worker agent with its own conversation context.
 */
export function spawnWorker(name: string, task: string): WorkerAgent {
  if (!orchestratorState) createOrchestrator('(auto)')

  const ctx = getEnvContext()
  const systemPrompt = `${buildSystemPrompt(ctx)}

# Your Role
You are worker agent "${name}". You are part of a multi-agent team working on a larger goal.

## Your specific task:
${task}

## Communication
- Focus on YOUR task only. Do not work on other agents' tasks.
- Be thorough but efficient — your context window is limited.
- When you finish, provide a clear summary of what you did and any important findings.
- If you need information from another agent, include it in your final response.

## Guidelines
- Read files before editing
- Make changes and verify they work
- Report any errors or blockers clearly`

  const worker: WorkerAgent = {
    id: `worker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    task,
    status: 'idle',
    conversation: [{ role: 'system', content: systemPrompt }],
    messagesReceived: [],
  }

  orchestratorState!.workers.set(name, worker)
  return worker
}

/**
 * Send a message between agents.
 */
export function sendMessage(from: string, to: string, content: string): void {
  if (!orchestratorState) return

  orchestratorState.messageLog.push({ from, to, content, timestamp: Date.now() })

  const target = orchestratorState.workers.get(to)
  if (target) {
    target.messagesReceived.push({ from, content })
    // Inject the message into the worker's conversation
    target.conversation.push({
      role: 'user',
      content: `[Message from agent "${from}"]: ${content}`,
    })
  }
}

/**
 * Run a worker agent to completion on its task.
 * Returns the worker's final response.
 */
export async function runWorker(
  worker: WorkerAgent,
  config: ServerConfig,
  onEvent?: (event: WorkerEvent) => void,
): Promise<string> {
  worker.status = 'running'
  onEvent?.({ type: 'worker_start', worker: worker.name, task: worker.task })

  // Add the task as the first user message
  worker.conversation.push({
    role: 'user',
    content: `Please complete the following task:\n\n${worker.task}`,
  })

  const tools = getToolSpecs()
  let rounds = 0
  const MAX_ROUNDS = 20

  try {
    while (rounds < MAX_ROUNDS) {
      rounds++

      smartCompact(worker.conversation, config.model)
      pruneIfNeeded(worker.conversation, config.model)

      let msg: Message
      try {
        msg = await chatCompletion(worker.conversation, tools, config)
      } catch (err) {
        const kind = classifyOllamaError(err)
        if (kind === 'context_overflow') {
          pruneIfNeeded(worker.conversation, config.model)
          try {
            msg = await chatCompletion(worker.conversation, tools, config)
          } catch (retryErr) {
            throw retryErr
          }
        } else {
          throw err
        }
      }

      // Tool calls
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        worker.conversation.push(msg)
        for (const tc of msg.tool_calls) {
          const toolName = tc.function.name
          let args: Record<string, unknown> = {}
          try {
            args = JSON.parse(tc.function.arguments || '{}')
          } catch {
            worker.conversation.push({
              role: 'tool',
              content: `Error: Invalid JSON arguments`,
              tool_call_id: tc.id,
            })
            continue
          }

          onEvent?.({ type: 'tool_call', worker: worker.name, tool: toolName, args })

          const tool = getTool(toolName)
          if (!tool) {
            worker.conversation.push({
              role: 'tool',
              content: `Error: Unknown tool "${toolName}"`,
              tool_call_id: tc.id,
            })
            continue
          }

          try {
            const result = await tool.execute(args)
            const maxLen = 50000
            const truncated = result.length > maxLen
              ? result.slice(0, maxLen) + '\n... (truncated)'
              : result
            worker.conversation.push({ role: 'tool', content: truncated, tool_call_id: tc.id })
            onEvent?.({ type: 'tool_result', worker: worker.name, tool: toolName, result: truncated.slice(0, 200) })
          } catch (e: any) {
            const errMsg = `Error: ${e.message}`
            worker.conversation.push({ role: 'tool', content: errMsg, tool_call_id: tc.id })
          }
        }
        continue
      }

      // Text response — worker is done
      const text = (typeof msg.content === 'string' ? msg.content : '') || ''
      worker.conversation.push({ role: 'assistant', content: text })
      worker.status = 'done'
      worker.result = text
      onEvent?.({ type: 'worker_done', worker: worker.name, result: text.slice(0, 500) })
      return text
    }

    worker.status = 'done'
    worker.result = '(Worker reached max rounds)'
    return worker.result
  } catch (err: any) {
    worker.status = 'failed'
    worker.error = err.message
    onEvent?.({ type: 'worker_error', worker: worker.name, error: err.message })
    return `Error: ${err.message}`
  }
}

export interface WorkerEvent {
  type: 'worker_start' | 'worker_done' | 'worker_error' | 'tool_call' | 'tool_result' | 'message'
  worker: string
  task?: string
  tool?: string
  args?: Record<string, unknown>
  result?: string
  error?: string
}

/**
 * Run multiple workers and collect results.
 * Workers run sequentially (sharing one llama-server instance).
 */
export async function runAllWorkers(
  config: ServerConfig,
  onEvent?: (event: WorkerEvent) => void,
): Promise<Map<string, string>> {
  if (!orchestratorState) throw new Error('No orchestrator state')

  const results = new Map<string, string>()

  for (const [name, worker] of orchestratorState.workers) {
    if (worker.status !== 'idle') continue
    const result = await runWorker(worker, config, onEvent)
    results.set(name, result)
  }

  return results
}

/**
 * Format the orchestrator state for display.
 */
export function formatOrchestratorStatus(): string {
  if (!orchestratorState) return 'No active multi-agent task.'

  const lines: string[] = [
    `# Multi-Agent Task: ${orchestratorState.goal}`,
    '',
  ]

  const statusIcon = (s: WorkerStatus) => {
    switch (s) {
      case 'done': return '[x]'
      case 'running': return '[>]'
      case 'failed': return '[!]'
      case 'idle': return '[ ]'
    }
  }

  for (const [name, worker] of orchestratorState.workers) {
    let line = `${statusIcon(worker.status)} Agent "${name}": ${worker.task}`
    if (worker.result) {
      line += `\n    Result: ${worker.result.slice(0, 200)}${worker.result.length > 200 ? '...' : ''}`
    }
    if (worker.error) {
      line += `\n    Error: ${worker.error}`
    }
    lines.push(line)
  }

  const done = Array.from(orchestratorState.workers.values()).filter(w => w.status === 'done').length
  const total = orchestratorState.workers.size
  lines.push('', `Progress: ${done}/${total} agents complete`)

  if (orchestratorState.messageLog.length > 0) {
    lines.push('', `Messages: ${orchestratorState.messageLog.length} exchanged`)
  }

  return lines.join('\n')
}

/**
 * Clear the orchestrator state.
 */
export function clearOrchestrator(): void {
  orchestratorState = null
}
