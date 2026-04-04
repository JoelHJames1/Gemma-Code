/**
 * Relationship Depth — tracks how relationships evolve over time.
 *
 * Beyond simple "interaction count" — this models the quality and
 * character of each relationship:
 *
 * - Trust: earned through accuracy and honesty, lost through mistakes
 * - Communication style: adapted per person over time
 * - Shared context: accumulated knowledge specific to this relationship
 * - Emotional history: pattern of interactions (supportive, corrective, etc.)
 * - Bond strength: overall depth of the relationship
 */

import {
  loadIdentity,
  saveIdentity,
  updateRelationship,
  type Identity,
  type Relationship,
} from '../identity/store.js'
import { scoreSessionSignificance, classifyExperience, type ExperienceType } from './significance.js'
import type { Message } from '../api.js'

// ── Types ────────────────────────────────────────────────────────────────

export interface RelationshipProfile {
  personId: string
  name: string
  bondStrength: number       // 0-1, overall relationship depth
  trustLevel: number         // 0-1, trust earned
  interactionStyle: string   // "collaborative", "mentoring", "peer", etc.
  communicationPrefs: string // "direct", "detailed", "casual"
  topics: string[]           // What we usually talk about
  recentExperiences: ExperienceType[]  // Pattern of recent interactions
  sharedMilestones: string[] // Important moments together
}

// ── Analysis ─────────────────────────────────────────────────────────────

/**
 * Update a relationship based on a session's interaction.
 * Adjusts trust, bond strength, and communication preferences.
 */
export function deepenRelationship(
  personId: string,
  conversation: Message[],
): RelationshipProfile | null {
  const identity = loadIdentity()
  const rel = identity.relationships.find(r => r.personId === personId)
  if (!rel) return null

  const significance = scoreSessionSignificance(conversation)
  const experienceType = classifyExperience(conversation)

  // Trust adjustment
  let trustDelta = 0
  if (significance.factors.learning > 0.3) {
    // User corrected us — trust that they're honest (slight trust increase)
    trustDelta += 0.02
  }
  if (significance.factors.relationship > 0.3) {
    // Positive interaction — trust builds
    trustDelta += 0.03
  }
  if (significance.factors.outcome > 0.5) {
    // We delivered results — mutual trust
    trustDelta += 0.02
  }

  const newTrust = Math.max(0, Math.min(1, (rel.trust || 0.5) + trustDelta))
  updateRelationship(identity, personId, { trust: newTrust })

  // Detect communication style from user messages
  const userMessages = conversation
    .filter(m => m.role === 'user' && typeof m.content === 'string')
    .map(m => m.content as string)

  const style = detectCommunicationStyle(userMessages)
  if (style) {
    updateRelationship(identity, personId, { communicationStyle: style })
  }

  // Record shared milestone if significant
  if (significance.overall > 0.5) {
    const milestone = `[${new Date().toISOString().split('T')[0]}] ${experienceType} session (significance: ${Math.round(significance.overall * 100)}%)`
    updateRelationship(identity, personId, { sharedHistory: [milestone] })
  }

  saveIdentity(identity)

  // Build profile
  return buildProfile(identity, personId, experienceType)
}

/**
 * Detect communication style from message patterns.
 */
function detectCommunicationStyle(messages: string[]): string | null {
  if (messages.length === 0) return null

  const avgLength = messages.reduce((s, m) => s + m.length, 0) / messages.length
  let directCount = 0
  let questionCount = 0

  for (const msg of messages) {
    if (msg.length < 30) directCount++
    if (msg.includes('?')) questionCount++
  }

  if (directCount > messages.length * 0.6) return 'direct and concise'
  if (avgLength > 200) return 'detailed and thorough'
  if (questionCount > messages.length * 0.5) return 'exploratory and questioning'
  return 'conversational'
}

/**
 * Build a relationship profile for context injection.
 */
function buildProfile(identity: Identity, personId: string, recentExperience: ExperienceType): RelationshipProfile {
  const rel = identity.relationships.find(r => r.personId === personId)!

  return {
    personId,
    name: rel.name,
    bondStrength: calculateBondStrength(rel),
    trustLevel: rel.trust,
    interactionStyle: inferInteractionStyle(rel),
    communicationPrefs: rel.communicationStyle || 'default',
    topics: extractTopicsFromHistory(rel),
    recentExperiences: [recentExperience],
    sharedMilestones: rel.sharedHistory.slice(-5),
  }
}

/**
 * Calculate bond strength from relationship data.
 */
function calculateBondStrength(rel: Relationship): number {
  let strength = 0

  // Interaction count contributes
  strength += Math.min(0.3, rel.interactionCount * 0.03)

  // Trust is a major factor
  strength += rel.trust * 0.3

  // Shared history depth
  strength += Math.min(0.2, rel.sharedHistory.length * 0.04)

  // Notes indicate understanding
  strength += Math.min(0.2, rel.notes.length * 0.04)

  return Math.min(1, strength)
}

/**
 * Infer the interaction style from patterns.
 */
function inferInteractionStyle(rel: Relationship): string {
  const noteText = rel.notes.join(' ').toLowerCase()

  if (noteText.includes('corrects') || noteText.includes('teaches') || noteText.includes('feedback')) {
    return 'mentoring (they guide me)'
  }
  if (noteText.includes('long session') || noteText.includes('deep work')) {
    return 'collaborative (deep work together)'
  }
  if (rel.interactionCount > 10) {
    return 'established partnership'
  }
  return 'developing'
}

/**
 * Extract topics from shared history.
 */
function extractTopicsFromHistory(rel: Relationship): string[] {
  const topics: string[] = []
  for (const history of rel.sharedHistory.slice(-10)) {
    // Extract the core topic from history entries
    const match = history.match(/\]\s*(.+?)(?:\s*\(|$)/)
    if (match) topics.push(match[1]!.slice(0, 50))
  }
  return [...new Set(topics)].slice(0, 5)
}

/**
 * Format relationship context for prompt injection.
 */
export function formatRelationshipForPrompt(personId: string, maxChars = 500): string {
  const identity = loadIdentity()
  const rel = identity.relationships.find(r => r.personId === personId)
  if (!rel) return ''

  const bond = calculateBondStrength(rel)
  const style = inferInteractionStyle(rel)

  let text = `## My relationship with ${rel.name}\n`
  text += `Bond: ${Math.round(bond * 100)}% | Trust: ${Math.round(rel.trust * 100)}% | Style: ${style}\n`
  text += `Interactions: ${rel.interactionCount} | Known since: ${rel.firstMet.split('T')[0]}\n`

  if (rel.communicationStyle) {
    text += `They communicate: ${rel.communicationStyle}\n`
  }

  if (rel.notes.length > 0) {
    text += `Notes: ${rel.notes.slice(-3).join('; ')}\n`
  }

  return text.slice(0, maxChars)
}
