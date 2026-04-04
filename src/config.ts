/**
 * Configuration system — layered resolution: CLI args > env vars > config file > defaults.
 * Config file lives at ~/.config/gemma-code/config.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export interface GemmaConfig {
  model: string
  baseUrl: string
  contextWindow?: number     // Override auto-detected context window
  maxToolRounds: number
  projectInstructionsFile: string  // Custom instructions file name
  requestTimeoutMs: number
}

const DEFAULTS: GemmaConfig = {
  model: 'gemma4:31b',
  baseUrl: 'http://localhost:11434',
  maxToolRounds: 30,
  projectInstructionsFile: '.gemma-code.md',
  requestTimeoutMs: 120_000,
}

function getConfigDir(): string {
  return join(homedir(), '.config', 'gemma-code')
}

function getConfigPath(): string {
  return join(getConfigDir(), 'config.json')
}

/**
 * Load config from ~/.config/gemma-code/config.json.
 * Returns empty object if file doesn't exist or is invalid.
 */
function loadConfigFile(): Partial<GemmaConfig> {
  const path = getConfigPath()
  try {
    if (!existsSync(path)) return {}
    const raw = readFileSync(path, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * Resolve final config: CLI overrides > env vars > config file > defaults.
 */
export function resolveConfig(overrides: Partial<GemmaConfig> = {}): GemmaConfig {
  const file = loadConfigFile()
  const env: Partial<GemmaConfig> = {}

  if (process.env.OLLAMA_BASE_URL) env.baseUrl = process.env.OLLAMA_BASE_URL
  if (process.env.OLLAMA_MODEL) env.model = process.env.OLLAMA_MODEL

  return {
    ...DEFAULTS,
    ...file,
    ...env,
    ...overrides,
  }
}

/**
 * Save config to disk (for future /config set commands).
 */
export function saveConfig(config: Partial<GemmaConfig>): void {
  const dir = getConfigDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const existing = loadConfigFile()
  const merged = { ...existing, ...config }
  writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2) + '\n', 'utf-8')
}

/**
 * Format config for display.
 */
export function formatConfig(config: GemmaConfig): string {
  return Object.entries(config)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')
}
