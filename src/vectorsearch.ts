/**
 * Local vector search — TF-IDF + cosine similarity.
 *
 * No external dependencies. No embedding API calls. No vector DB.
 * Runs entirely in-process using term frequency–inverse document
 * frequency (TF-IDF) vectors with cosine similarity ranking.
 *
 * This gives us semantic-ish search over memory entries:
 * a query about "auth token validation" will find memories
 * mentioning "validateToken", "auth.ts", "JWT", etc. — even
 * if the exact words don't match, shared terms boost relevance.
 *
 * Performance: O(n*v) where n = documents, v = vocabulary size.
 * Fine for hundreds of memories. For thousands, would need an index.
 */

// ── Tokenization ─────────────────────────────────────────────────────────

/** Stop words to filter out (common English words that don't carry meaning). */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'i', 'me',
  'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'his',
  'her', 'what', 'which', 'who', 'whom', 'these', 'those', 'am',
])

/**
 * Tokenize text into normalized terms.
 * Splits on non-alphanumeric, lowercases, removes stop words,
 * and splits camelCase/snake_case identifiers.
 */
export function tokenize(text: string): string[] {
  // Split camelCase: "validateToken" → "validate token"
  const expanded = text.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Split on non-alphanumeric
  const raw = expanded.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  // Remove stop words and very short tokens
  return raw.filter(t => t.length >= 2 && !STOP_WORDS.has(t))
}

// ── TF-IDF ───────────────────────────────────────────────────────────────

/** Term frequency: count of each term in a document. */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }
  // Normalize by document length
  const len = tokens.length || 1
  for (const [term, count] of tf) {
    tf.set(term, count / len)
  }
  return tf
}

/** Inverse document frequency for each term across all documents. */
function inverseDocumentFrequency(
  documents: Map<string, number>[],
): Map<string, number> {
  const n = documents.length
  const df = new Map<string, number>()

  for (const doc of documents) {
    for (const term of doc.keys()) {
      df.set(term, (df.get(term) || 0) + 1)
    }
  }

  const idf = new Map<string, number>()
  for (const [term, count] of df) {
    // Standard IDF with smoothing
    idf.set(term, Math.log((n + 1) / (count + 1)) + 1)
  }
  return idf
}

/** Compute TF-IDF vector for a document. */
function tfidfVector(
  tf: Map<string, number>,
  idf: Map<string, number>,
): Map<string, number> {
  const vec = new Map<string, number>()
  for (const [term, freq] of tf) {
    const idfVal = idf.get(term) || 1
    vec.set(term, freq * idfVal)
  }
  return vec
}

/** Cosine similarity between two sparse vectors. */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (const [term, valA] of a) {
    normA += valA * valA
    const valB = b.get(term)
    if (valB !== undefined) {
      dotProduct += valA * valB
    }
  }
  for (const valB of b.values()) {
    normB += valB * valB
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dotProduct / denom
}

// ── Search Interface ─────────────────────────────────────────────────────

export interface SearchDocument {
  id: string | number
  text: string
  metadata?: Record<string, unknown>
}

export interface SearchResult {
  id: string | number
  score: number
  text: string
  metadata?: Record<string, unknown>
}

/**
 * Build a search index and query it.
 *
 * Usage:
 *   const results = search(documents, "auth token validation", 5)
 *
 * Returns the top-k most relevant documents sorted by cosine similarity.
 */
export function search(
  documents: SearchDocument[],
  query: string,
  topK = 5,
  minScore = 0.05,
): SearchResult[] {
  if (documents.length === 0) return []

  // Tokenize all documents + query
  const docTokens = documents.map(d => tokenize(d.text))
  const queryTokens = tokenize(query)

  if (queryTokens.length === 0) return []

  // Compute TF for each document and the query
  const docTFs = docTokens.map(tokens => termFrequency(tokens))
  const queryTF = termFrequency(queryTokens)

  // Compute IDF across all documents + query
  const allDocs = [...docTFs, queryTF]
  const idf = inverseDocumentFrequency(allDocs)

  // Compute TF-IDF vectors
  const docVectors = docTFs.map(tf => tfidfVector(tf, idf))
  const queryVector = tfidfVector(queryTF, idf)

  // Rank by cosine similarity
  const scored: SearchResult[] = documents.map((doc, i) => ({
    id: doc.id,
    score: cosineSimilarity(queryVector, docVectors[i]!),
    text: doc.text,
    metadata: doc.metadata,
  }))

  return scored
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

/**
 * Quick relevance check — does a query have any keyword overlap with text?
 * Faster than full TF-IDF for pre-filtering.
 */
export function hasOverlap(query: string, text: string): boolean {
  const qTokens = new Set(tokenize(query))
  const tTokens = tokenize(text)
  return tTokens.some(t => qTokens.has(t))
}
