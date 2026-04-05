import { readFileSync } from 'fs'
import type { ToolDefinition } from './types.js'

export const ReadTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'Read',
      description:
        'Read a file from the filesystem. Returns file contents with line numbers. ' +
        'Use offset and limit to read specific portions of large files.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Absolute path to the file to read',
          },
          offset: {
            type: 'number',
            description: 'Line number to start reading from (0-based). Optional.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of lines to read. Optional, defaults to 2000.',
          },
        },
        required: ['file_path'],
      },
    },
  },

  async execute(args) {
    // Unescape shell-style backslash-spaces: "Programming\ Task" → "Programming Task"
    const filePath = (args.file_path as string).replace(/\\ /g, ' ')
    const offset = (args.offset as number) || 0
    const limit = (args.limit as number) || 2000

    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      const slice = lines.slice(offset, offset + limit)
      const numbered = slice.map((line, i) => `${offset + i + 1}\t${line}`)
      const result = numbered.join('\n')

      if (lines.length > offset + limit) {
        return result + `\n\n... (${lines.length - offset - limit} more lines)`
      }
      return result
    } catch (e: any) {
      return `Error reading file: ${e.message}`
    }
  },
}
