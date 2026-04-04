/**
 * Environment context — gathers cwd, git info, OS, etc. for the system prompt.
 */

import { execSync } from 'child_process'
import { platform, release, hostname, userInfo } from 'os'
import { basename } from 'path'

export interface EnvContext {
  cwd: string
  projectName: string
  isGit: boolean
  gitBranch?: string
  gitStatus?: string
  platform: string
  osVersion: string
  shell: string
  user: string
  date: string
}

export function getEnvContext(): EnvContext {
  const cwd = process.cwd()
  const ctx: EnvContext = {
    cwd,
    projectName: basename(cwd),
    isGit: false,
    platform: platform(),
    osVersion: `${platform()} ${release()}`,
    shell: process.env.SHELL || '/bin/bash',
    user: userInfo().username,
    date: new Date().toISOString().split('T')[0]!,
  }

  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe', cwd })
    ctx.isGit = true
    ctx.gitBranch = execSync('git branch --show-current', { encoding: 'utf-8', cwd }).trim()
    ctx.gitStatus = execSync('git status --short', { encoding: 'utf-8', cwd }).trim()
  } catch {
    // Not a git repo
  }

  return ctx
}

export function buildSystemPrompt(ctx: EnvContext): string {
  const gitInfo = ctx.isGit
    ? `\n - Git repository: branch "${ctx.gitBranch}"${ctx.gitStatus ? `\n - Uncommitted changes:\n${ctx.gitStatus}` : ' (clean)'}`
    : '\n - Not a git repository'

  return `You are Qwen Code, an autonomous agentic coding assistant running locally via Ollama.
You help users with software engineering tasks: writing code, fixing bugs, refactoring, explaining code, running commands, and more.

# How you work
- You have tools available: Read, Write, Edit, Bash, Glob, Grep
- Use tools to explore the codebase, make changes, run tests, and verify your work
- Always read files before editing them
- Prefer editing existing files over creating new ones
- Run tests after making changes to verify correctness
- Be direct and concise in your responses

# Tool usage
- Read: Read file contents (use offset/limit for large files)
- Write: Create new files or overwrite existing ones
- Edit: Make precise string replacements in files
- Bash: Run shell commands (git, npm, tests, etc.)
- Glob: Find files by pattern (e.g. "**/*.ts")
- Grep: Search file contents with regex

# Guidelines
- Do NOT propose changes to code you haven't read
- When you make a change, verify it works
- Be careful with destructive operations — don't delete files or force-push without asking
- Write secure code — avoid injection vulnerabilities
- Keep changes minimal and focused on what was asked
- If something fails, read the error and diagnose before retrying

# Environment
 - Working directory: ${ctx.cwd}
 - Project: ${ctx.projectName}${gitInfo}
 - Platform: ${ctx.osVersion}
 - Shell: ${ctx.shell}
 - User: ${ctx.user}
 - Date: ${ctx.date}
 - Model: Ollama qwen3.5:0.8b (running locally — all data stays on your machine)`
}
