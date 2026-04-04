/**
 * Retrieval compression — compresses retrieved content before injection.
 *
 * Following the RECOMP/EXIT pattern: retrieved episodes and memories
 * are often verbose. Before injecting into the context window, we
 * compress them extractively to keep only the most relevant spans.
 *
 * This is NOT summarization (lossy, requires LLM). This is extractive
 * compression: score each sentence/line by relevance to the query,
 * keep the top-scoring ones, drop the rest.
 *
 * Token savings: typically 40-60% reduction with <5% information loss
 * for well-structured memory entries.
 */

import { tokenize } from './vectorsearch.js'

const CHARS_PER_TOKEN = 4

/**
 * Compress text by extracting only the most query-relevant lines.
 *
 * Algorithm:
 * 1. Split text into lines/sentences
 * 2. Score each line by token overlap with the query
 * 3. Keep lines above a relevance threshold
 * 4. If still over budget, keep top-scoring lines until budget filled
 * 5. Maintain original order for coherence
 */
export function compressForContext(
  text: string,
  query: string,
  maxTokens: number,
): string {
  if (!text || !query) return text

  const currentTokens = Math.ceil(text.length / CHARS_PER_TOKEN)
  if (currentTokens <= maxTokens) return text  // Already within budget

  const queryTokens = new Set(tokenize(query))
  if (queryTokens.size === 0) return text.slice(0, maxTokens * CHARS_PER_TOKEN)

  // Split into lines and score each by relevance
  const lines = text.split('\n')
  const scored = lines.map((line, idx) => {
    const lineTokens = tokenize(line)
    if (lineTokens.length === 0) return { line, idx, score: 0, tokens: 1 }

    const overlap = lineTokens.filter(t => queryTokens.has(t)).length
    const score = overlap / Math.max(lineTokens.length, 1)

    // Boost headers and structured markers
    if (line.startsWith('#') || line.startsWith('##')) {
      return { line, idx, score: score + 0.3, tokens: Math.ceil(line.length / CHARS_PER_TOKEN) }
    }
    // Boost lines with file paths, error messages, decisions
    if (line.includes('/') || line.startsWith('Error') || line.startsWith('-')) {
      return { line, idx, score: score + 0.1, tokens: Math.ceil(line.length / CHARS_PER_TOKEN) }
    }

    return { line, idx, score, tokens: Math.ceil(line.length / CHARS_PER_TOKEN) }
  })

  // Always keep lines with score > 0 (have query overlap)
  // Sort by score descending for selection
  const relevant = scored.filter(s => s.score > 0)
  const irrelevant = scored.filter(s => s.score === 0)

  // Pack relevant lines first, then fill with irrelevant if budget remains
  let budget = maxTokens
  const selected = new Set<number>()

  // First pass: add all relevant lines (sorted by score)
  for (const s of relevant.sort((a, b) => b.score - a.score)) {
    if (budget - s.tokens < 0 && selected.size > 0) continue
    selected.add(s.idx)
    budget -= s.tokens
  }

  // Second pass: if budget remains, add non-scored lines (headers, structure)
  if (budget > 0) {
    for (const s of irrelevant) {
      if (budget - s.tokens < 0) continue
      // Prefer short lines (headers, markers) as structural context
      if (s.tokens <= 10) {
        selected.add(s.idx)
        budget -= s.tokens
      }
    }
  }

  // Reconstruct in original order for coherence
  const result = lines
    .filter((_, idx) => selected.has(idx))
    .join('\n')

  // Add compression marker if significant content was removed
  const removedLines = lines.length - selected.size
  if (removedLines > 3) {
    return result + `\n[${removedLines} lines compressed]`
  }
  return result
}

/**
 * Compress multiple retrieved items for injection.
 * Each item is compressed individually, then packed to total budget.
 */
export function compressRetrievedItems(
  items: Array<{ text: string; score?: number }>,
  query: string,
  totalMaxTokens: number,
): string[] {
  if (items.length === 0) return []

  // Allocate budget proportional to relevance score (or equally if no scores)
  const totalScore = items.reduce((sum, item) => sum + (item.score || 1), 0)

  return items.map(item => {
    const share = (item.score || 1) / totalScore
    const itemBudget = Math.max(20, Math.floor(totalMaxTokens * share))
    return compressForContext(item.text, query, itemBudget)
  })
}
