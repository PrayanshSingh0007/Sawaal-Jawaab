/**
 * Remote model calls.
 *
 * Requests go to a same-origin endpoint that holds the API key server-side
 * (see vite.config.ts for the development implementation). The key is never
 * present in the browser bundle. Every call is time-boxed; the caller falls
 * back to the offline engine on any failure.
 */

const MODEL = import.meta.env['VITE_AI_MODEL'] || 'claude-sonnet-4-6'
const ENDPOINT = '/api/ai'
const TIMEOUT_MS = 6000

let unavailableUntil = 0

/** True when the last attempt failed recently — avoids hammering a dead endpoint. */
export function remoteLikelyDown(): boolean {
  return Date.now() < unavailableUntil
}

function markDown(forSession = false): void {
  // A 503 from our own endpoint means no key is configured. That is a normal
  // state for this product, not a transient failure, so stop asking.
  unavailableUntil = forSession ? Number.POSITIVE_INFINITY : Date.now() + 60_000
}

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>
}

/** Sends one message turn and returns parsed JSON, or null if anything at all goes wrong. */
export async function askModel<T>(
  system: string,
  user: string,
  maxTokens = 400,
): Promise<T | null> {
  if (!navigator.onLine || remoteLikelyDown()) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!res.ok) {
      markDown(res.status === 503)
      return null
    }
    const data = (await res.json()) as AnthropicResponse
    const text = data.content?.find((b) => b.type === 'text')?.text ?? ''
    return extractJson<T>(text)
  } catch {
    markDown()
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Models sometimes wrap JSON in prose or a fence. Take the first object. */
function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced?.[1] ?? text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    return null
  }
}
