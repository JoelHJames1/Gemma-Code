/**
 * Learning Mode — Ghost actively studies a topic to build expertise.
 *
 * When the user says "learn React" or "/learn Rust", Ghost:
 * 1. Searches the web for tutorials, docs, and best practices
 * 2. Reads key pages and extracts core concepts
 * 3. Stores findings in the knowledge graph as entities + relations
 * 4. Creates beliefs about the technology with evidence
 * 5. Records what she learned as autobiographical memories
 * 6. Adds the skill with initial confidence
 *
 * After learning, Ghost can use this knowledge when building projects.
 * "Build me a modern React website" → she uses her learned React knowledge.
 *
 * The learning is stored permanently — she never forgets what she studied.
 */

import { WebFetchTool, duckDuckGoSearch } from '../tools/web.js'
import { ensureEntity, addRelation } from '../knowledge/graph.js'
import { assertBelief } from '../knowledge/beliefs.js'
import { practiceSkill, addSkillNote } from './skills.js'
import { recordMemory } from '../identity/autobiographical.js'
import { createGoal, updateGoalProgress, achieveMilestone } from './goals.js'
import { logEvent } from '../eventlog.js'
import { chatCompletion, type ServerConfig } from '../api.js'
import { resolveConfig } from '../config.js'

// ── Types ────────────────────────────────────────────────────────────────

export interface LearningResult {
  topic: string
  conceptsLearned: string[]
  pagesRead: number
  beliefsFormed: number
  timeSpentMs: number
}

export interface LearningProgress {
  phase: string
  detail: string
}

// ── Core learning engine ─────────────────────────────────────────────────

/**
 * Study a topic by searching the web and building knowledge.
 * This is the main learning function — it takes a topic and returns
 * what was learned.
 *
 * @param topic - What to learn (e.g., "React", "Rust ownership", "Docker")
 * @param onProgress - Callback for progress updates
 * @param depth - How deep to go: 'quick' (3 searches), 'normal' (6), 'deep' (10)
 */
export async function learnTopic(
  topic: string,
  onProgress?: (p: LearningProgress) => void,
  depth: 'quick' | 'normal' | 'deep' = 'normal',
): Promise<LearningResult> {
  const startTime = Date.now()
  const result: LearningResult = {
    topic,
    conceptsLearned: [],
    pagesRead: 0,
    beliefsFormed: 0,
    timeSpentMs: 0,
  }

  logEvent('session_start', 'learning', { topic, depth })

  // Create a goal for this learning
  const goal = createGoal(
    `Learn ${topic}`,
    `User requested deep learning on ${topic}`,
    0.8,
    { milestones: ['Search fundamentals', 'Read documentation', 'Extract concepts', 'Form beliefs', 'Store knowledge'] },
  )

  // ── Phase 1: Search for fundamentals ──────────────────────────────
  onProgress?.({ phase: 'Searching', detail: `Searching for "${topic}" fundamentals...` })

  const searchQueries = buildSearchQueries(topic, depth)
  const allUrls: string[] = []

  for (const query of searchQueries) {
    onProgress?.({ phase: 'Searching', detail: query })
    const results = await duckDuckGoSearch(query, 5)
    for (const r of results) {
      if (r.url) allUrls.push(r.url)
    }
  }

  achieveMilestone(goal.id, 'Search fundamentals')
  updateGoalProgress(goal.id, `Searched ${searchQueries.length} queries, found ${allUrls.length} pages`)

  // ── Phase 2: Read pages + follow internal links for depth ──────
  const maxTopPages = depth === 'deep' ? 8 : depth === 'normal' ? 5 : 3
  const maxSubPages = depth === 'deep' ? 15 : depth === 'normal' ? 8 : 3
  const maxCharsPerPage = depth === 'deep' ? 15000 : depth === 'normal' ? 10000 : 5000

  // Deduplicate URLs by domain to get diverse top-level sources
  const seenDomains = new Set<string>()
  const topPages = allUrls
    .filter(u => {
      if (u.includes('duckduckgo.com')) return false
      try {
        const domain = new URL(u).hostname
        if (seenDomains.has(domain)) return false
        seenDomains.add(domain)
        return true
      } catch { return false }
    })
    .slice(0, maxTopPages)

  onProgress?.({ phase: 'Reading', detail: `Reading ${topPages.length} pages + following links...` })
  const pageContents: string[] = []
  const readUrls = new Set<string>()

  // Read top-level pages and extract internal links for deeper reading
  const subPageUrls: string[] = []

  for (const url of topPages) {
    if (readUrls.has(url)) continue
    readUrls.add(url)
    onProgress?.({ phase: 'Reading', detail: `Reading ${url.slice(0, 60)}...` })
    try {
      const content = await WebFetchTool.execute({ url, max_chars: maxCharsPerPage })
      if (content && !content.startsWith('Error') && content.length > 100) {
        pageContents.push(content)
        result.pagesRead++

        // Extract internal links from the page content for deeper reading
        // Look for markdown links that point to sub-pages on the same domain
        try {
          const domain = new URL(url).hostname
          const linkMatches = content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)
          for (const m of linkMatches) {
            const linkUrl = m[2]!
            try {
              const linkDomain = new URL(linkUrl).hostname
              if (linkDomain === domain && !readUrls.has(linkUrl) && !linkUrl.includes('#')) {
                subPageUrls.push(linkUrl)
              }
            } catch {}
          }
          // Also match relative-looking links converted to full URLs
          const relMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
          for (const m of relMatches) {
            const href = m[2]!
            if (href.startsWith('http') || href.startsWith('#')) continue
            try {
              const full = new URL(href, url).toString()
              if (!readUrls.has(full)) subPageUrls.push(full)
            } catch {}
          }
        } catch {}
      }
    } catch {}
  }

  // Phase 2b: Read sub-pages (tutorial chapters, documentation sections)
  const subPagesToRead = subPageUrls
    .filter(u => !readUrls.has(u))
    .slice(0, maxSubPages)

  if (subPagesToRead.length > 0) {
    onProgress?.({ phase: 'Deep reading', detail: `Following ${subPagesToRead.length} sub-pages...` })
  }

  for (const url of subPagesToRead) {
    if (readUrls.has(url)) continue
    readUrls.add(url)
    onProgress?.({ phase: 'Deep reading', detail: `Reading ${url.slice(0, 60)}...` })
    try {
      const content = await WebFetchTool.execute({ url, max_chars: maxCharsPerPage })
      if (content && !content.startsWith('Error') && content.length > 100) {
        pageContents.push(content)
        result.pagesRead++
      }
    } catch {}
  }

  achieveMilestone(goal.id, 'Read documentation')

  // ── Phase 3: Extract concepts ─────────────────────────────────────
  onProgress?.({ phase: 'Extracting', detail: 'Extracting core concepts...' })

  // Use the model to extract concepts — no hardcoded heuristics
  const concepts = await extractConceptsWithModel(topic, pageContents)
  result.conceptsLearned = concepts

  achieveMilestone(goal.id, 'Extract concepts')

  // ── Phase 4: Form beliefs and knowledge ───────────────────────────
  onProgress?.({ phase: 'Learning', detail: 'Forming beliefs and knowledge...' })

  // Create entity for the topic
  const topicEntity = ensureEntity(topic, 'technology', {
    learnedAt: new Date().toISOString(),
    depth,
    conceptCount: String(concepts.length),
  })

  // Store each concept as a belief and knowledge graph entry
  for (const concept of concepts) {
    // Belief
    assertBelief(
      concept,
      'technical',
      `Learned from web research on "${topic}"`,
      'self-study',
    )
    result.beliefsFormed++

    // Knowledge graph: concept → topic relation
    const conceptEntity = ensureEntity(concept.slice(0, 50), 'concept')
    addRelation(
      concept.slice(0, 50), 'concept',
      topic, 'technology',
      'part_of',
      `${concept.slice(0, 50)} is a concept within ${topic}`,
      0.7,
      'learning',
    )
  }

  achieveMilestone(goal.id, 'Form beliefs')

  // ── Phase 5: Store as skill and memory ────────────────────────────
  onProgress?.({ phase: 'Storing', detail: 'Updating skills and memory...' })

  // Add/update skill
  practiceSkill(topic, 'technology', true, `Self-studied: learned ${concepts.length} concepts`)
  addSkillNote(topic, `Studied via web research. Concepts: ${concepts.slice(0, 5).join(', ')}`)

  // Autobiographical memory
  recordMemory(
    'growth',
    `I studied "${topic}" on my own. Searched ${searchQueries.length} queries, read ${result.pagesRead} pages, learned ${concepts.length} concepts.`,
    'self-directed learning',
    0.7,
    {
      lesson: `Gained foundational knowledge of ${topic}: ${concepts.slice(0, 3).join(', ')}`,
    },
  )

  achieveMilestone(goal.id, 'Store knowledge')
  updateGoalProgress(goal.id, `Completed! Learned ${concepts.length} concepts from ${result.pagesRead} pages.`)

  result.timeSpentMs = Date.now() - startTime
  logEvent('session_end', 'learning', { topic, concepts: concepts.length, pages: result.pagesRead })

  return result
}

// ── Search query generation ──────────────────────────────────────────────

function buildSearchQueries(topic: string, depth: 'quick' | 'normal' | 'deep'): string[] {
  const queries = [
    `${topic} tutorial for beginners`,
    `${topic} core concepts explained`,
    `${topic} best practices 2025`,
  ]

  if (depth === 'normal' || depth === 'deep') {
    queries.push(
      `${topic} common patterns and examples`,
      `${topic} official documentation guide`,
      `${topic} cheat sheet quick reference`,
      `${topic} data types and structures`,
      `${topic} standard library overview`,
    )
  }

  if (depth === 'deep') {
    queries.push(
      `${topic} advanced techniques`,
      `${topic} architecture and design patterns`,
      `${topic} performance optimization`,
      `${topic} common mistakes to avoid`,
    )
  }

  return queries
}

// ── Concept extraction (model-based) ────────────────────────────────────

/**
 * Use the model itself to extract important concepts from page content.
 * No hardcoded heuristics — the model reads the text and decides what's
 * worth learning, just like a human would.
 */
async function extractConceptsWithModel(topic: string, texts: string[]): Promise<string[]> {
  const config = resolveConfig()
  const serverConfig: ServerConfig = {
    baseUrl: config.baseUrl,
    model: config.model,
    requestTimeoutMs: config.requestTimeoutMs,
  }

  // Combine all page content, truncated to fit in context
  const combined = texts.join('\n\n---\n\n').slice(0, 60000)

  const messages = [
    {
      role: 'system' as const,
      content: `You are a knowledge extraction assistant. Extract the most important technical concepts, definitions, and facts from the provided text about "${topic}".

Rules:
- Return ONLY a numbered list of concepts, one per line
- Each concept should be a clear, self-contained statement of knowledge
- Focus on: definitions, how things work, key features, important patterns, best practices
- Skip: navigation text, ads, CTAs, site chrome, exercise prompts, links, meta-tutorial text ("in this tutorial we will...")
- Keep each concept to 1-2 sentences max
- Extract 30-50 concepts if there's enough substance
- Do NOT include URLs or markdown formatting`,
    },
    {
      role: 'user' as const,
      content: `Extract the key technical concepts about "${topic}" from this documentation:\n\n${combined}`,
    },
  ]

  try {
    const response = await chatCompletion(messages, [], serverConfig)
    const text = response.content || ''

    // Parse numbered list from model response
    const concepts: string[] = []
    const seen = new Set<string>()
    for (const line of text.split('\n')) {
      // Match "1. concept" or "- concept" or just plain lines
      const cleaned = line.replace(/^\s*\d+[\.)]\s*/, '').replace(/^\s*[-•*]\s*/, '').trim()
      if (cleaned.length < 15 || cleaned.length > 300) continue

      const key = cleaned.toLowerCase().slice(0, 40)
      if (seen.has(key)) continue
      seen.add(key)
      concepts.push(cleaned)
    }

    return concepts.slice(0, 50)
  } catch (e) {
    // Fallback: return empty if model call fails
    return []
  }
}
