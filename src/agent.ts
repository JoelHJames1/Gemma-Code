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
  type Message,
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
  let emptyRetries = 0

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++

    // Use non-streaming for tool-call rounds (more reliable with Ollama),
    // only stream the final text response to the user.
    const msg = await chatCompletion(conversation, tools, config)

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      conversation.push(msg)
      for (const tc of msg.tool_calls) {
        await executeToolCall(conversation, tc, onToolStart, onToolEnd)
      }
      continue
    }

    // Empty response after tool use — nudge the model to summarize
    if (!msg.content?.trim() && rounds > 1) {
      conversation.push({
        role: 'user',
        content: 'Based on the tool results above, please provide your answer now.',
      })
      emptyRetries++
      if (emptyRetries > 2) {
        return '(The model did not produce a response. Try rephrasing your question.)'
      }
      continue
    }

    // Got a text response — stream it to the user if streaming is enabled
    const text = msg.content || ''
    if (stream && text) {
      // Simulate streaming by writing chunks for a nicer UX
      const words = text.split(' ')
      for (let w = 0; w < words.length; w++) {
        onText?.((w > 0 ? ' ' : '') + words[w]!)
      }
    }

    conversation.push({ role: 'assistant', content: text })
    return text
  }

  return '(Agent reached maximum tool call rounds. Stopping.)'
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
