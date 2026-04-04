/**
 * Agent loop — the core agentic execution cycle.
 *
 * 1. Send conversation to model with tool definitions
 * 2. If model returns tool_calls → execute each tool → append results → goto 1
 * 3. If model returns text → display to user → done
 *
 * Supports both streaming (interactive) and non-streaming (print) modes.
 */

import chalk from 'chalk'
import {
  chatCompletion,
  chatCompletionStream,
  type Message,
  type ToolCall,
  type OllamaConfig,
  DEFAULT_CONFIG,
} from './ollama.js'
import { getToolSpecs, getTool } from './tools/index.js'
import { buildSystemPrompt, getEnvContext } from './context.js'

const MAX_TOOL_ROUNDS = 30 // Safety limit on consecutive tool-call rounds

export interface AgentOptions {
  stream?: boolean
  config?: OllamaConfig
  onText?: (text: string) => void
  onToolStart?: (name: string, args: Record<string, unknown>) => void
  onToolEnd?: (name: string, result: string) => void
}

/**
 * Create a new conversation with system prompt.
 */
export function createConversation(): Message[] {
  const ctx = getEnvContext()
  return [{ role: 'system', content: buildSystemPrompt(ctx) }]
}

/**
 * Run the agent loop for a single user message.
 * Appends the user message and all subsequent assistant/tool messages to the conversation.
 * Returns the final assistant text response.
 */
export async function runAgent(
  conversation: Message[],
  userMessage: string,
  options: AgentOptions = {},
): Promise<string> {
  const {
    stream = true,
    config = DEFAULT_CONFIG,
    onText,
    onToolStart,
    onToolEnd,
  } = options

  // Add user message
  conversation.push({ role: 'user', content: userMessage })

  const tools = getToolSpecs()
  let rounds = 0

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++

    if (stream) {
      // Streaming mode — show text as it arrives
      const result = await streamRound(conversation, tools, config, onText)

      if (result.toolCalls && result.toolCalls.length > 0) {
        // Model wants to call tools
        conversation.push({
          role: 'assistant',
          content: result.text || null,
          tool_calls: result.toolCalls,
        })

        // Execute each tool call
        for (const tc of result.toolCalls) {
          await executeToolCall(conversation, tc, onToolStart, onToolEnd)
        }
        // Loop back to get next model response
        continue
      }

      // No tool calls — final response
      conversation.push({ role: 'assistant', content: result.text || '' })
      return result.text || ''
    } else {
      // Non-streaming mode
      const msg = await chatCompletion(conversation, tools, config)

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        conversation.push(msg)
        for (const tc of msg.tool_calls) {
          await executeToolCall(conversation, tc, onToolStart, onToolEnd)
        }
        continue
      }

      conversation.push(msg)
      return msg.content || ''
    }
  }

  return '(Agent reached maximum tool call rounds. Stopping.)'
}

/**
 * Execute a single streaming round. Returns collected text and tool calls.
 */
async function streamRound(
  conversation: Message[],
  tools: ReturnType<typeof getToolSpecs>,
  config: OllamaConfig,
  onText?: (text: string) => void,
): Promise<{ text: string; toolCalls?: ToolCall[] }> {
  let text = ''
  let toolCalls: ToolCall[] | undefined

  for await (const delta of chatCompletionStream(conversation, tools, config)) {
    switch (delta.type) {
      case 'text':
        text += delta.text || ''
        onText?.(delta.text || '')
        break
      case 'tool_calls':
        toolCalls = delta.toolCalls
        break
      case 'error':
        throw new Error(delta.error)
    }
  }

  return { text, toolCalls }
}

/**
 * Execute a tool call and append the result to the conversation.
 */
async function executeToolCall(
  conversation: Message[],
  tc: ToolCall,
  onToolStart?: (name: string, args: Record<string, unknown>) => void,
  onToolEnd?: (name: string, result: string) => void,
): Promise<void> {
  const toolName = tc.function.name
  let args: Record<string, unknown> = {}

  try {
    args = JSON.parse(tc.function.arguments || '{}')
  } catch {
    const result = `Error: Invalid JSON arguments for tool "${toolName}"`
    conversation.push({ role: 'tool', content: result, tool_call_id: tc.id })
    onToolEnd?.(toolName, result)
    return
  }

  const tool = getTool(toolName)
  if (!tool) {
    const result = `Error: Unknown tool "${toolName}"`
    conversation.push({ role: 'tool', content: result, tool_call_id: tc.id })
    onToolEnd?.(toolName, result)
    return
  }

  onToolStart?.(toolName, args)

  try {
    const result = await tool.execute(args)
    // Truncate very large results to avoid context overflow
    const maxLen = 50000
    const truncated =
      result.length > maxLen
        ? result.slice(0, maxLen) + `\n\n... (truncated, ${result.length - maxLen} chars omitted)`
        : result
    conversation.push({ role: 'tool', content: truncated, tool_call_id: tc.id })
    onToolEnd?.(toolName, truncated)
  } catch (e: any) {
    const result = `Error executing ${toolName}: ${e.message}`
    conversation.push({ role: 'tool', content: result, tool_call_id: tc.id })
    onToolEnd?.(toolName, result)
  }
}
