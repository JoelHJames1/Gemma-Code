/**
 * Error Database — learns from mistakes so they never happen twice.
 *
 * Every time a tool call fails, the error and its resolution (what the model
 * did next that succeeded) are recorded. Before executing a tool call, the
 * agent checks: "Have I seen this error pattern before? What fixed it?"
 *
 * If a match is found, the fix is injected as a hint alongside the tool result,
 * so the model doesn't waste rounds rediscovering the same solution.
 *
 * Storage: ~/.local/share/ghost-code/errors.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

// ── Types ────────────────────────────────────────────────────────────────

interface ErrorEntry {
  id: string
  /** The error message or pattern */
  error: string
  /** Normalized error key for matching */
  errorKey: string
  /** The tool that produced the error */
  tool: string
  /** The command/args that caused it */
  context: string
  /** What fixed it — the successful command/approach that followed */
  solution: string
  /** How many times this error has been seen */
  occurrences: number
  /** Confidence that the solution works (0-1) */
  confidence: number
  /** When first seen */
  firstSeen: string
  /** When last seen */
  lastSeen: string
}

interface ErrorStore {
  errors: ErrorEntry[]
}

// ── Storage ──────────────────────────────────────────────────────────────

function getStorePath(): string {
  const dir = join(homedir(), '.local', 'share', 'ghost-code')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'errors.json')
}

function loadStore(): ErrorStore {
  const path = getStorePath()
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {}
  return { errors: [] }
}

function saveStore(store: ErrorStore): void {
  // Keep max 500 entries, sorted by confidence * occurrences (most useful first)
  if (store.errors.length > 500) {
    store.errors.sort((a, b) => (b.confidence * b.occurrences) - (a.confidence * a.occurrences))
    store.errors = store.errors.slice(0, 500)
  }
  writeFileSync(getStorePath(), JSON.stringify(store, null, 2), 'utf-8')
}

// ── Error Key Normalization ──────────────────────────────────────────────

/**
 * Normalize an error message into a matchable key.
 * Strips paths, numbers, timestamps — keeps the structural pattern.
 */
function normalizeError(error: string): string {
  return error
    // Remove file paths
    .replace(/\/[\w./-]+/g, '<PATH>')
    // Remove version numbers
    .replace(/v?\d+\.\d+(\.\d+)?/g, '<VER>')
    // Remove hex/hash strings
    .replace(/[0-9a-f]{8,}/gi, '<HASH>')
    // Remove port numbers
    .replace(/:\d{4,5}/g, ':<PORT>')
    // Remove timestamps
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/g, '<TIME>')
    // Remove specific package names after @
    .replace(/@[\w/-]+/g, '@<PKG>')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 200)
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Check if we've seen this error before. Returns the solution if found.
 */
export function lookupError(error: string, tool: string): { solution: string; confidence: number } | null {
  const store = loadStore()
  const key = normalizeError(error)

  // Find matching error by normalized key
  const match = store.errors.find(e =>
    e.errorKey === key ||
    // Fuzzy match: check if 60% of words overlap
    wordOverlap(e.errorKey, key) > 0.6
  )

  if (match && match.confidence >= 0.3) {
    // Update last seen
    match.lastSeen = new Date().toISOString()
    match.occurrences++
    saveStore(store)
    return { solution: match.solution, confidence: match.confidence }
  }

  return null
}

/**
 * Record an error that occurred during a tool call.
 * Called when a tool returns an error result.
 */
export function recordError(error: string, tool: string, context: string): string {
  const store = loadStore()
  const key = normalizeError(error)
  const id = `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  // Check if we already have this error
  const existing = store.errors.find(e => e.errorKey === key)
  if (existing) {
    existing.occurrences++
    existing.lastSeen = new Date().toISOString()
    existing.context = context // Update with latest context
    saveStore(store)
    return existing.id
  }

  // New error
  store.errors.push({
    id,
    error: error.slice(0, 500),
    errorKey: key,
    tool,
    context: context.slice(0, 300),
    solution: '', // Filled in when the model finds a fix
    occurrences: 1,
    confidence: 0,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  })

  saveStore(store)
  return id
}

/**
 * Record the solution for a previously seen error.
 * Called when the model successfully completes a tool call after a failure.
 */
export function recordSolution(errorId: string, solution: string): void {
  const store = loadStore()
  const entry = store.errors.find(e => e.id === errorId)
  if (entry) {
    if (entry.solution && entry.solution !== solution) {
      // We had a different solution before — update confidence based on which is newer
      entry.solution = solution
      entry.confidence = Math.min(0.99, entry.confidence + 0.1)
    } else if (!entry.solution) {
      entry.solution = solution
      entry.confidence = 0.6 // Initial confidence for first solution
    } else {
      // Same solution seen again — boost confidence
      entry.confidence = Math.min(0.99, entry.confidence + 0.15)
    }
    saveStore(store)
  }
}

/**
 * Record that a solution didn't work — decrease confidence.
 */
export function recordSolutionFailed(errorId: string): void {
  const store = loadStore()
  const entry = store.errors.find(e => e.id === errorId)
  if (entry) {
    entry.confidence = Math.max(0, entry.confidence - 0.2)
    saveStore(store)
  }
}

/**
 * Get stats about the error database.
 */
export function getErrorStats(): { total: number; withSolutions: number; topErrors: Array<{ error: string; occurrences: number; hasFix: boolean }> } {
  const store = loadStore()
  return {
    total: store.errors.length,
    withSolutions: store.errors.filter(e => e.solution && e.confidence > 0.3).length,
    topErrors: store.errors
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10)
      .map(e => ({ error: e.error.slice(0, 80), occurrences: e.occurrences, hasFix: !!e.solution && e.confidence > 0.3 })),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/))
  const wordsB = new Set(b.split(/\s+/))
  let overlap = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++
  }
  const total = Math.max(wordsA.size, wordsB.size)
  return total === 0 ? 0 : overlap / total
}
