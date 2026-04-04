/**
 * Scratchpad tool — the agent's persistent notepad.
 *
 * The agent should write important findings, decisions, and state here
 * BEFORE they would be lost to context compaction. The scratchpad is
 * always loaded into context, so anything written here persists forever.
 *
 * Think of it as the agent writing Post-it notes to itself.
 */

import type { ToolDefinition } from './types.js'
import {
  readScratchpad,
  writeScratchpad,
  appendToScratchpad,
  clearScratchpad,
} from '../scratchpad.js'

export const ScratchpadTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'Scratchpad',
      description:
        'Your persistent notepad. Write important findings, decisions, file locations, and state here. ' +
        'The scratchpad is ALWAYS visible to you, even after old messages are compacted. ' +
        'Use this to remember things you will need later. ' +
        'Actions: "read" (view notes), "write" (replace all notes), "append" (add a note), "clear" (erase all).',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action: "read", "write", "append", or "clear"',
            enum: ['read', 'write', 'append', 'clear'],
          },
          content: {
            type: 'string',
            description: 'For "write": full new content. For "append": note to add.',
          },
        },
        required: ['action'],
      },
    },
  },

  async execute(args) {
    const action = args.action as string
    const content = args.content as string | undefined
    const cwd = process.cwd()

    switch (action) {
      case 'read': {
        const notes = readScratchpad(cwd)
        return notes || '(Scratchpad is empty. Use "append" to add notes.)'
      }

      case 'write': {
        if (!content) return 'Error: "write" requires content parameter.'
        writeScratchpad(content, cwd)
        return `Scratchpad updated (${content.length} chars).`
      }

      case 'append': {
        if (!content) return 'Error: "append" requires content parameter.'
        appendToScratchpad(content, cwd)
        return `Note added to scratchpad: ${content.slice(0, 100)}`
      }

      case 'clear': {
        clearScratchpad(cwd)
        return 'Scratchpad cleared.'
      }

      default:
        return `Unknown action: ${action}. Use "read", "write", "append", or "clear".`
    }
  },
}
