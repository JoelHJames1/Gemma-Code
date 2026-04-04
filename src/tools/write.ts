import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import type { ToolDefinition } from './types.js'

export const WriteTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'Write',
      description:
        'Write content to a file. Creates the file if it does not exist. ' +
        'Creates parent directories as needed. Overwrites existing content.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Absolute path to the file to write',
          },
          content: {
            type: 'string',
            description: 'The content to write to the file',
          },
        },
        required: ['file_path', 'content'],
      },
    },
  },

  async execute(args) {
    const filePath = args.file_path as string
    const content = args.content as string

    try {
      mkdirSync(dirname(filePath), { recursive: true })
      writeFileSync(filePath, content, 'utf-8')
      const lines = content.split('\n').length
      return `Successfully wrote ${lines} lines to ${filePath}`
    } catch (e: any) {
      return `Error writing file: ${e.message}`
    }
  },
}
