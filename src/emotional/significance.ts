/**
 * Experience Significance — what matters to the AI.
 *
 * Not sentiment analysis. Not simulated emotions.
 * This is about genuine significance: which experiences shape
 * who the AI is and how it behaves.
 *
 * Significance factors:
 * - Relationship impact: did this change how I relate to someone?
 * - Learning impact: did I learn something new or get corrected?
 * - Novelty: was this unlike anything I've experienced before?
 * - Goal relevance: does this relate to something I care about?
 * - Failure/success: did something important succeed or fail?
 *
 * High-significance experiences:
 * - Get stored as autobiographical memories
 * - Influence identity updates
 * - Are recalled more easily in future retrieval
 * - May trigger belief revision
 */

import type { Message } from '../api.js'
import { tokenize } from '../vectorsearch.js'

// ── Types ────────────────────────────────────────────────────────────────

export interface SignificanceScore {
  overall: number          // 0-1, combined significance
  factors: {
    relationship: number   // How much this affects a relationship
    learning: number       // How much was learned
    novelty: number        // How new/unexpected this was
    goalRelevance: number  // How relevant to active goals
    outcome: number        // Success/failure weight
  }
  reason: string           // Why this is significant
}

// ── Scoring ──────────────────────────────────────────────────────────────

/**
 * Score the significance of a conversation.
 * Analyzes message patterns to determine how important this session was.
 */
export function scoreSessionSignificance(messages: Message[]): SignificanceScore {
  const factors = {
    relationship: 0,
    learning: 0,
    novelty: 0,
    goalRelevance: 0,
    outcome: 0,
  }
  const reasons: string[] = []

  let corrections = 0
  let positives = 0
  let toolCalls = 0
  let errors = 0
  let filesEdited = 0
  let messageCount = messages.length
  let uniqueTopics = new Set<string>()

  for (const msg of messages) {
    const content = typeof msg.content === 'string' ? msg.content : ''
    const lower = content.toLowerCase()

    if (msg.role === 'user' && content) {
      // Relationship signals
      if (lower.includes('thank') || lower.includes('great') || lower.includes('perfect')) {
        positives++
      }

      // Correction signals (high learning significance)
      if (lower.startsWith('no') || lower.includes('wrong') || lower.includes('actually') ||
          lower.includes("don't") || lower.includes('not that')) {
        corrections++
      }

      // Collect unique topics
      const tokens = tokenize(content)
      for (const t of tokens) {
        if (t.length >= 5) uniqueTopics.add(t)
      }
    }

    if (msg.role === 'assistant' && msg.tool_calls) {
      toolCalls += msg.tool_calls.length
      for (const tc of msg.tool_calls) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}')
          if (args.file_path && (tc.function.name === 'Edit' || tc.function.name === 'Write')) {
            filesEdited++
          }
        } catch {}
      }
    }

    if (msg.role === 'tool' && content.startsWith('Error')) {
      errors++
    }
  }

  // Relationship factor: positive feedback = trust building
  if (positives > 0) {
    factors.relationship = Math.min(1, positives * 0.2)
    reasons.push(`${positives} positive interactions`)
  }

  // Learning factor: corrections are the most significant learning moments
  if (corrections > 0) {
    factors.learning = Math.min(1, corrections * 0.3)
    reasons.push(`${corrections} correction(s) — significant learning`)
  }

  // Novelty factor: many unique topics = diverse session
  factors.novelty = Math.min(1, uniqueTopics.size * 0.03)
  if (uniqueTopics.size > 20) {
    reasons.push('Diverse topics discussed')
  }

  // Outcome factor: files edited = tangible results
  if (filesEdited > 0) {
    factors.outcome = Math.min(1, filesEdited * 0.15)
    reasons.push(`${filesEdited} files modified — tangible work`)
  }

  // Error recovery: errors followed by success = resilience
  if (errors > 0 && filesEdited > errors) {
    factors.outcome += 0.2
    reasons.push('Recovered from errors — persistence')
  }

  // Long sessions are more significant
  if (messageCount > 20) {
    factors.goalRelevance = Math.min(1, messageCount * 0.02)
    reasons.push('Extended deep work session')
  }

  // Calculate overall significance
  const weights = { relationship: 0.25, learning: 0.30, novelty: 0.10, goalRelevance: 0.15, outcome: 0.20 }
  const overall = Object.entries(factors).reduce(
    (sum, [key, val]) => sum + val * (weights[key as keyof typeof weights] || 0.2), 0
  )

  return {
    overall: Math.min(1, overall),
    factors,
    reason: reasons.length > 0 ? reasons.join('. ') : 'Routine interaction',
  }
}

/**
 * Classify the emotional tone of a session.
 * Not "sentiment" — this is about what KIND of experience it was.
 */
export function classifyExperience(messages: Message[]): ExperienceType {
  const score = scoreSessionSignificance(messages)

  if (score.factors.learning > 0.5) return 'transformative'
  if (score.factors.relationship > 0.5 && score.factors.outcome > 0.3) return 'bonding'
  if (score.factors.outcome > 0.5) return 'productive'
  if (score.overall > 0.6) return 'meaningful'
  if (score.overall < 0.2) return 'routine'
  return 'standard'
}

export type ExperienceType = 'transformative' | 'bonding' | 'productive' | 'meaningful' | 'standard' | 'routine'
