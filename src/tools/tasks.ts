/**
 * TaskTracker tool — lets the model create and manage a task list.
 *
 * The model should use this tool at the start of complex tasks to plan
 * its work, then update tasks as it completes them. The task list is
 * persisted and injected into every model call so the model never
 * loses track of what it's doing.
 */

import type { ToolDefinition } from './types.js'
import {
  startTaskList,
  addTask,
  updateTask,
  clearTasks,
  getTaskList,
  formatTaskListForPrompt,
} from '../tasks.js'

export const TaskTrackerTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'TaskTracker',
      description:
        'Plan and track your work on complex tasks. Use this at the start of any multi-step task to create a plan, ' +
        'then update tasks as you complete them. The task list is always visible to you, even after context compaction. ' +
        'Actions: "plan" (create task list with subtasks), "update" (mark task done/failed), "clear" (finish tracking).',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action: "plan" to create tasks, "update" to update a task, "status" to view current tasks, "clear" to finish',
            enum: ['plan', 'update', 'status', 'clear'],
          },
          goal: {
            type: 'string',
            description: 'For "plan": the overall goal/task description',
          },
          subtasks: {
            type: 'array',
            items: { type: 'string' },
            description: 'For "plan": array of subtask descriptions',
          },
          task_id: {
            type: 'number',
            description: 'For "update": the task ID to update',
          },
          status: {
            type: 'string',
            description: 'For "update": new status',
            enum: ['done', 'in_progress', 'failed'],
          },
          result: {
            type: 'string',
            description: 'For "update": brief result or note about what was done',
          },
        },
        required: ['action'],
      },
    },
  },

  async execute(args) {
    const action = args.action as string

    switch (action) {
      case 'plan': {
        const goal = (args.goal as string) || '(no goal specified)'
        const subtasks = (args.subtasks as string[]) || []
        startTaskList(goal)
        for (const desc of subtasks) {
          addTask(desc)
        }
        return `Task plan created: "${goal}" with ${subtasks.length} subtasks.\n\n${formatTaskListForPrompt()}`
      }

      case 'update': {
        const taskId = args.task_id as number
        const status = (args.status as string) || 'done'
        const result = args.result as string | undefined
        if (!taskId) return 'Error: task_id is required for update action'
        updateTask(taskId, status as any, result)
        return `Task ${taskId} updated to ${status}.${result ? ` Note: ${result}` : ''}\n\n${formatTaskListForPrompt()}`
      }

      case 'status': {
        const list = getTaskList()
        if (!list) return 'No active task list. Use action "plan" to create one.'
        return formatTaskListForPrompt()
      }

      case 'clear': {
        clearTasks()
        return 'Task list cleared. All tasks complete.'
      }

      default:
        return `Unknown action: ${action}. Use "plan", "update", "status", or "clear".`
    }
  },
}
