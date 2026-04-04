import type { Tool } from '../ollama.js'

export interface ToolDefinition {
  /** The tool spec sent to the model */
  spec: Tool
  /** Execute the tool with parsed arguments, return result string */
  execute: (args: Record<string, unknown>) => Promise<string>
}
