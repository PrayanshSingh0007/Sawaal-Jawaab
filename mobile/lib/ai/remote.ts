/**
 * Remote model calls.
 *
 * The app never holds an API key. Requests go to a server endpoint that holds
 * it — set `EXPO_PUBLIC_AI_ENDPOINT` to that URL. With no endpoint configured,
 * nothing is attempted and the on-device engine answers everything, which is
 * the app's normal, fully-supported state.
 */

const ENDPOINT = process.env['EXPO_PUBLIC_AI_ENDPOINT'] ?? ''
const MODEL = process.env['EXPO_PUBLIC_AI_MODEL'] || 'claude-sonnet-4-6'
const TIMEOUT_MS = 6000

let unavailableUntil = 0

export function remoteConfigured(): boolean {
  return ENDPOINT.length > 0
}

/** True when a recent attempt failed — avoids hammering a dead endpoint. */
export function remoteLikelyDown(): boolean {
  return Date.now() < unavailableUntil
}

function markDown(forSession = false): void {
  unavailableUntil = forSession ? Number.POSITIVE_INFINITY : Date.now() + 60_000
}

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>
}

/** Sends one turn and returns parsed JSON, or null if anything at all goes wrong. */
export async function askModel<T>(system: string, user: string, maxTokens = 400): Promise<T | null> {
  if (!remoteConfigured() || remoteLikelyDown()) return null

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
    return extractJson<T>(data.content?.find((b) => b.type === 'text')?.text ?? '')
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
