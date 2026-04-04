/**
 * Agent management tools — lets the orchestrator model spawn workers,
 * send messages between agents, and collect results.
 */

import type { ToolDefinition } from './types.js'
import {
  createOrchestrator,
  spawnWorker,
  sendMessage,
  runWorker,
  runAllWorkers,
  formatOrchestratorStatus,
  clearOrchestrator,
  getOrchestratorState,
  type WorkerEvent,
} from '../orchestrator.js'
import { resolveConfig } from '../config.js'

// Store config and event handler — set from index.ts when starting
let serverConfig: { baseUrl: string; model: string; requestTimeoutMs?: number } | null = null
let eventHandler: ((event: WorkerEvent) => void) | null = null

export function setAgentToolConfig(
  config: { baseUrl: string; model: string; requestTimeoutMs?: number },
  onEvent?: (event: WorkerEvent) => void,
): void {
  serverConfig = config
  eventHandler = onEvent || null
}

export const SpawnAgentTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'SpawnAgent',
      description:
        'Spawn worker agents to handle subtasks in parallel. Use this for complex tasks that can be ' +
        'broken into independent pieces (e.g., one agent refactors frontend, another fixes backend, ' +
        'another writes tests). Each agent gets its own context and tools. ' +
        'Actions: "spawn" (create a worker), "run_all" (execute all idle workers), ' +
        '"status" (check progress), "message" (send message between agents), "clear" (cleanup).',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action to perform',
            enum: ['spawn', 'run_all', 'status', 'message', 'clear'],
          },
          goal: {
            type: 'string',
            description: 'For first "spawn": the overall goal for the multi-agent task',
          },
          worker_name: {
            type: 'string',
            description: 'For "spawn"/"message": name of the worker (e.g., "frontend", "backend", "tests")',
          },
          task: {
            type: 'string',
            description: 'For "spawn": detailed task description for the worker',
          },
          to: {
            type: 'string',
            description: 'For "message": name of the target worker',
          },
          content: {
            type: 'string',
            description: 'For "message": message content to send',
          },
        },
        required: ['action'],
      },
    },
  },

  async execute(args) {
    const action = args.action as string

    if (!serverConfig) {
      return 'Error: Agent system not initialized. Server config not set.'
    }

    switch (action) {
      case 'spawn': {
        const goal = args.goal as string | undefined
        const name = args.worker_name as string
        const task = args.task as string

        if (!name || !task) {
          return 'Error: "spawn" requires worker_name and task parameters.'
        }

        // Create orchestrator if this is the first spawn
        if (!getOrchestratorState() && goal) {
          createOrchestrator(goal)
        } else if (!getOrchestratorState()) {
          createOrchestrator(task)
        }

        spawnWorker(name, task)
        return `Worker "${name}" spawned.\n\n${formatOrchestratorStatus()}`
      }

      case 'run_all': {
        if (!getOrchestratorState()) {
          return 'Error: No workers spawned. Use action "spawn" first.'
        }

        const results = await runAllWorkers(serverConfig, eventHandler || undefined)

        let output = `All workers completed.\n\n`
        for (const [name, result] of results) {
          output += `## Agent "${name}" result:\n${result}\n\n`
        }
        output += formatOrchestratorStatus()
        return output
      }

      case 'status': {
        return formatOrchestratorStatus()
      }

      case 'message': {
        const to = args.to as string
        const content = args.content as string
        const from = (args.worker_name as string) || 'orchestrator'

        if (!to || !content) {
          return 'Error: "message" requires "to" and "content" parameters.'
        }

        sendMessage(from, to, content)
        return `Message sent from "${from}" to "${to}": ${content.slice(0, 200)}`
      }

      case 'clear': {
        clearOrchestrator()
        return 'Multi-agent task cleared. All workers dismissed.'
      }

      default:
        return `Unknown action: ${action}. Use "spawn", "run_all", "status", "message", or "clear".`
    }
  },
}
