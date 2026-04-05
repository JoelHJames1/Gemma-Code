/**
 * Web tools — search and fetch without API keys.
 *
 * WebSearch: uses DuckDuckGo (zero API key, zero signup)
 * WebFetch: fetches any URL and extracts readable text
 *
 * This gives Ghost the ability to:
 * - Research topics she's curious about
 * - Look up documentation
 * - Find code examples
 * - Stay current on technologies
 * - Learn autonomously during idle time
 */

import type { ToolDefinition } from './types.js'

// ── HTML text extraction ─────────────────────────────────────────────────

/**
 * Strip HTML tags and extract readable text.
 * Lightweight — no dependency needed.
 */
function htmlToText(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    // Convert common elements to text equivalents
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    // Remove remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// ── DuckDuckGo search ────────────────────────────────────────────────────

interface SearchResult {
  title: string
  url: string
  snippet: string
}

/**
 * Search DuckDuckGo using the HTML lite endpoint.
 * No API key. No signup. No rate limits (be respectful).
 */
export async function duckDuckGoSearch(query: string, maxResults = 8): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    // Use DuckDuckGo HTML endpoint with POST + browser headers (avoids CAPTCHA)
    const formData = new URLSearchParams()
    formData.append('q', query)
    formData.append('b', '')
    formData.append('kl', '')

    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return []
    const html = await res.text()

    // Parse results: <a class="result__a" href="...">title</a> ... <a class="result__snippet">desc</a>
    const resultPattern = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    let match: RegExpExecArray | null
    while ((match = resultPattern.exec(html)) !== null && results.length < maxResults) {
      let [, resultUrl, title, snippet] = match
      if (!resultUrl || !title) continue

      title = htmlToText(title).trim()
      snippet = htmlToText(snippet || '').slice(0, 200)

      // DuckDuckGo wraps URLs in a redirect — extract the actual URL
      const uddgMatch = resultUrl.match(/uddg=([^&]+)/)
      if (uddgMatch) {
        try { resultUrl = decodeURIComponent(uddgMatch[1]!) } catch {}
      }

      if (resultUrl && title && !resultUrl.includes('duckduckgo.com')) {
        results.push({ title, url: resultUrl, snippet })
      }
    }

    // Fallback: simpler pattern if regex above didn't match (layout changes)
    if (results.length === 0) {
      const resultBlocks = html.split(/class="result__body"/)
      for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
        const block = resultBlocks[i]!
        const linkMatch = block.match(/class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/)
        let resultUrl = linkMatch?.[1] || ''
        const title = linkMatch?.[2] ? htmlToText(linkMatch[2]).trim() : ''

        if (resultUrl.startsWith('//')) resultUrl = 'https:' + resultUrl
        const uddgMatch = resultUrl.match(/uddg=([^&]+)/)
        if (uddgMatch) {
          try { resultUrl = decodeURIComponent(uddgMatch[1]!) } catch {}
        }

        const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\//)
        const snippet = snippetMatch?.[1] ? htmlToText(snippetMatch[1]).slice(0, 200) : ''

        if (resultUrl && title && !resultUrl.includes('duckduckgo.com')) {
          results.push({ title, url: resultUrl, snippet })
        }
      }
    }
  } catch {}

  // Fallback: DuckDuckGo instant answer API (JSON, no key)
  if (results.length === 0) {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        const data = await res.json() as {
          AbstractText?: string
          AbstractURL?: string
          AbstractSource?: string
          RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>
        }

        if (data.AbstractText && data.AbstractURL) {
          results.push({
            title: data.AbstractSource || 'DuckDuckGo',
            url: data.AbstractURL,
            snippet: data.AbstractText.slice(0, 300),
          })
        }

        for (const topic of (data.RelatedTopics || []).slice(0, maxResults - results.length)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.slice(0, 80),
              url: topic.FirstURL,
              snippet: topic.Text.slice(0, 200),
            })
          }
        }
      }
    } catch {}
  }

  return results
}

// ── Tools ────────────────────────────────────────────────────────────────

export const WebSearchTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'WebSearch',
      description:
        'Search the web using DuckDuckGo (no API key needed). ' +
        'Returns titles, URLs, and snippets. Use this to research topics, ' +
        'look up documentation, find code examples, or learn new things.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., "Rust ownership explained", "React useEffect best practices")',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results. Default: 5.',
          },
        },
        required: ['query'],
      },
    },
  },

  async execute(args) {
    const query = args.query as string
    const maxResults = (args.max_results as number) || 5

    const results = await duckDuckGoSearch(query, maxResults)

    if (results.length === 0) {
      return `No results found for "${query}". Try a different search query.`
    }

    let output = `Search results for "${query}":\n\n`
    for (let i = 0; i < results.length; i++) {
      const r = results[i]!
      output += `${i + 1}. ${r.title}\n`
      output += `   ${r.url}\n`
      if (r.snippet) output += `   ${r.snippet}\n`
      output += '\n'
    }

    return output
  },
}

// ── Readability extraction (ported from OpenClaw) ───────────────────────

/**
 * Convert HTML to clean markdown — preserves headings, links, and lists.
 */
function htmlToMarkdown(html: string): { text: string; title?: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? htmlToText(titleMatch[1]!).trim() : undefined

  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')

  // Convert links to markdown
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, body) => {
    const label = htmlToText(body).trim()
    return label ? `[${label}](${href})` : href
  })
  // Convert headings
  text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, body) => {
    const prefix = '#'.repeat(Math.max(1, Math.min(6, parseInt(level, 10))))
    return `\n${prefix} ${htmlToText(body).trim()}\n`
  })
  // Convert list items
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, body) => {
    const label = htmlToText(body).trim()
    return label ? `\n- ${label}` : ''
  })
  // Line breaks and block elements
  text = text
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|header|footer|table|tr|ul|ol)>/gi, '\n')
  // Strip remaining tags and clean whitespace
  text = htmlToText(text)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()

  return { text, title }
}

/**
 * Extract readable content using Mozilla Readability (same as OpenClaw).
 * Falls back to htmlToMarkdown if Readability fails.
 */
async function extractReadableContent(html: string, url: string): Promise<{ text: string; title?: string }> {
  try {
    const [{ Readability }, { parseHTML }] = await Promise.all([
      import('@mozilla/readability'),
      import('linkedom'),
    ])
    const { document } = parseHTML(html)
    try { (document as any).baseURI = url } catch {}

    const reader = new Readability(document, { charThreshold: 0 })
    const parsed = reader.parse()
    if (parsed?.content) {
      const rendered = htmlToMarkdown(parsed.content)
      return { text: rendered.text, title: parsed.title || rendered.title }
    }
  } catch {}
  // Fallback to simple markdown conversion
  return htmlToMarkdown(html)
}

// ── WebFetch Tool ───────────────────────────────────────────────────────

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

export const WebFetchTool: ToolDefinition = {
  spec: {
    type: 'function',
    function: {
      name: 'WebFetch',
      description:
        'Fetch a web page and extract its readable text content. ' +
        'Uses Readability (same as Firefox Reader View) for clean extraction. ' +
        'Use after WebSearch to read documentation, articles, or code examples.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch',
          },
          max_chars: {
            type: 'number',
            description: 'Maximum characters to return. Default: 5000.',
          },
        },
        required: ['url'],
      },
    },
  },

  async execute(args) {
    const url = args.url as string
    const maxChars = (args.max_chars as number) || 5000

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(15_000),
        redirect: 'follow',
      })

      if (!res.ok) {
        return `Error fetching ${url}: HTTP ${res.status}`
      }

      const contentType = res.headers.get('content-type') || ''
      const body = await res.text()

      // Plain text or JSON — return as-is
      if (contentType.includes('text/plain') || contentType.includes('application/json')) {
        return body.slice(0, maxChars)
      }

      // HTML — extract with Readability (clean article extraction)
      const { text, title } = await extractReadableContent(body, url)
      if (text.length < 50) {
        return `Page at ${url} had no readable text content (might require JavaScript).`
      }

      const header = title ? `# ${title}\n\n` : ''
      return (header + text).slice(0, maxChars)
    } catch (e: any) {
      return `Error fetching ${url}: ${e.message}`
    }
  },
}
