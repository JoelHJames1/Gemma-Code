import { readFileSync, writeFileSync } from 'fs'
import type { ToolDefinition } from './types.js'

export const EditTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'Edit',
      description:
        'Perform an exact string replacement in a file. The old_string must match exactly ' +
        '(including whitespace and indentation). Use replace_all to replace all occurrences.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Absolute path to the file to edit',
          },
          old_string: {
            type: 'string',
            description: 'The exact string to find and replace',
          },
          new_string: {
            type: 'string',
            description: 'The replacement string',
          },
          replace_all: {
            type: 'boolean',
            description: 'If true, replace all occurrences. Default: false.',
          },
        },
        required: ['file_path', 'old_string', 'new_string'],
      },
    },
  },

  async execute(args) {
    const filePath = args.file_path as string
    const oldStr = args.old_string as string
    const newStr = args.new_string as string
    const replaceAll = (args.replace_all as boolean) || false

    try {
      const content = readFileSync(filePath, 'utf-8')

      if (!content.includes(oldStr)) {
        return `Error: old_string not found in ${filePath}. Make sure it matches exactly including whitespace.`
      }

      let updated: string
      if (replaceAll) {
        updated = content.split(oldStr).join(newStr)
        const count = (content.split(oldStr).length - 1)
        writeFileSync(filePath, updated, 'utf-8')
        return `Replaced ${count} occurrence(s) in ${filePath}`
      } else {
        const idx = content.indexOf(oldStr)
        const occurrences = content.split(oldStr).length - 1
        if (occurrences > 1) {
          return `Error: old_string has ${occurrences} occurrences in the file. Provide more context to make it unique, or use replace_all: true.`
        }
        updated = content.slice(0, idx) + newStr + content.slice(idx + oldStr.length)
        writeFileSync(filePath, updated, 'utf-8')
        return `Successfully edited ${filePath}`
      }
    } catch (e: any) {
      return `Error editing file: ${e.message}`
    }
  },
}
