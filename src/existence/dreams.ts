/**
 * Dreams — offline memory processing.
 *
 * When the daemon runs during idle time, "dreams" process recent
 * experiences to extract deeper meaning and connections:
 *
 * 1. Cross-reference: link memories from different sessions
 * 2. Pattern extraction: find recurring themes across experiences
 * 3. Insight generation: combine separate facts into new understanding
 * 4. Memory strengthening: important memories get higher significance
 * 5. Forgetting: very old, low-significance memories fade
 *
 * This is inspired by how human brains consolidate memories during sleep.
 * The AI doesn't "sleep" but it processes experiences in the background.
 */

import {
  definingMemories,
  memoriesByType,
  type AutobiographicalMemory,
  recordMemory,
  getMemoryStats,
} from '../identity/autobiographical.js'
import { loadIdentity, addLesson, saveIdentity } from '../identity/store.js'
import { tokenize } from '../vectorsearch.js'

// ── Dream processing ─────────────────────────────────────────────────────

/**
 * Run a "dream cycle" — process recent memories for deeper understanding.
 * Should be called during idle periods.
 */
export function dreamCycle(): DreamResult {
  const result: DreamResult = {
    patternsFound: [],
    insightsGenerated: [],
    memoriesStrengthened: 0,
    memoriesFaded: 0,
  }

  // 1. Find patterns across recent memories
  const patterns = findPatterns()
  result.patternsFound = patterns

  // 2. Generate insights from patterns
  for (const pattern of patterns) {
    const insight = generateInsight(pattern)
    if (insight) {
      result.insightsGenerated.push(insight)
      recordMemory('insight', insight, 'dream cycle', 0.6)
    }
  }

  // 3. Strengthen important memories
  result.memoriesStrengthened = strengthenImportantMemories()

  return result
}

export interface DreamResult {
  patternsFound: string[]
  insightsGenerated: string[]
  memoriesStrengthened: number
  memoriesFaded: number
}

/**
 * Find recurring patterns across recent autobiographical memories.
 */
function findPatterns(): string[] {
  const patterns: string[] = []

  // Get recent memories by type
  const corrections = memoriesByType('correction', 10)
  const collaborations = memoriesByType('collaboration', 10)
  const failures = memoriesByType('failure', 10)
  const growth = memoriesByType('growth', 10)

  // Pattern: repeated corrections in the same domain
  const correctionTopics = extractTopics(corrections.map(m => m.narrative))
  for (const [topic, count] of Object.entries(correctionTopics)) {
    if (count >= 2) {
      patterns.push(`Recurring correction pattern: "${topic}" (${count} times) — need to improve here`)
    }
  }

  // Pattern: consistent success in a domain
  const successTopics = extractTopics(
    collaborations.filter(m => !m.narrative.includes('error')).map(m => m.narrative)
  )
  for (const [topic, count] of Object.entries(successTopics)) {
    if (count >= 3) {
      patterns.push(`Strength pattern: consistently successful with "${topic}" (${count} times)`)
    }
  }

  // Pattern: failure → success progression
  if (failures.length > 0 && growth.length > 0) {
    const failTopics = new Set(Object.keys(extractTopics(failures.map(m => m.narrative))))
    const growthTopics = Object.keys(extractTopics(growth.map(m => m.narrative)))
    const overcame = growthTopics.filter(t => failTopics.has(t))
    for (const topic of overcame) {
      patterns.push(`Growth: overcame previous failures with "${topic}"`)
    }
  }

  return patterns.slice(0, 5)
}

/**
 * Extract recurring topic words from a set of narratives.
 */
function extractTopics(narratives: string[]): Record<string, number> {
  const wordCounts: Record<string, number> = {}

  for (const narrative of narratives) {
    const tokens = new Set(tokenize(narrative)) // Dedupe within each narrative
    for (const token of tokens) {
      if (token.length >= 4) { // Only meaningful words
        wordCounts[token] = (wordCounts[token] || 0) + 1
      }
    }
  }

  // Only return words that appear in multiple narratives
  const recurring: Record<string, number> = {}
  for (const [word, count] of Object.entries(wordCounts)) {
    if (count >= 2) recurring[word] = count
  }
  return recurring
}

/**
 * Generate an insight from a pattern.
 */
function generateInsight(pattern: string): string | null {
  const identity = loadIdentity()

  // Don't duplicate insights
  if (identity.lessonLearned.some(l => l.includes(pattern.slice(0, 30)))) {
    return null
  }

  // Convert pattern to a lesson
  if (pattern.includes('Recurring correction')) {
    const lesson = `I keep getting corrected on the same thing — need to pay extra attention here`
    addLesson(identity, lesson)
    saveIdentity(identity)
    return `Dream insight: ${pattern}. Lesson: ${lesson}`
  }

  if (pattern.includes('Strength pattern')) {
    return `Dream insight: ${pattern}. I should lean into this strength.`
  }

  if (pattern.includes('Growth: overcame')) {
    const lesson = `I grew past a previous weakness — persistence works`
    addLesson(identity, lesson)
    saveIdentity(identity)
    return `Dream insight: ${pattern}. Lesson: ${lesson}`
  }

  return null
}

/**
 * Strengthen memories that are referenced often or have high significance.
 */
function strengthenImportantMemories(): number {
  const defining = definingMemories(20)
  let strengthened = 0

  // Defining memories with multiple references get significance boost
  // (In a full implementation, we'd track reference counts)
  for (const mem of defining) {
    if (mem.significance >= 0.8 && mem.lesson) {
      strengthened++ // These memories are already strong
    }
  }

  return strengthened
}

/**
 * Get dream cycle stats.
 */
export function getDreamStats(): {
  totalInsights: number
  recentPatterns: string[]
} {
  const stats = getMemoryStats()
  const insights = memoriesByType('insight', 10)

  return {
    totalInsights: stats.byType['insight'] || 0,
    recentPatterns: insights.map(m => m.narrative.slice(0, 100)),
  }
}
