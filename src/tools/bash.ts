import { execSync } from 'child_process'
import type { ToolDefinition } from './types.js'

export const BashTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'Bash',
      description:
        'Execute a bash command and return its output. ' +
        'Use for running tests, git commands, installing packages, etc. ' +
        'Commands run in the current working directory. ' +
        'Timeout defaults to 30 seconds.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The bash command to execute',
          },
          timeout: {
            type: 'number',
            description: 'Timeout in milliseconds. Default: 30000 (30s). Max: 300000 (5m).',
          },
        },
        required: ['command'],
      },
    },
  },

  async execute(args) {
    const command = args.command as string
    const timeout = Math.min((args.timeout as number) || 30000, 300000)

    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: { ...process.env, TERM: 'dumb' },
      })
      return output || '(command completed with no output)'
    } catch (e: any) {
      const stderr = e.stderr?.toString() || ''
      const stdout = e.stdout?.toString() || ''
      const output = [stdout, stderr].filter(Boolean).join('\n')
      if (e.killed) {
        return `Command timed out after ${timeout}ms\n${output}`
      }
      return `Exit code ${e.status ?? 1}\n${output}`
    }
  },
}
