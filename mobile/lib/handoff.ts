/**
 * Handoff — passing a question to another person and getting a reply back.
 *
 * The person replying must never have to install anything, so the QR code
 * points at the web counter page rather than at this app. `frontend/` is
 * deployed to GitHub Pages by .github/workflows/deploy-web.yml; point
 * `EXPO_PUBLIC_COUNTER_URL` somewhere else to override it.
 *
 * Two transports, chosen automatically:
 *
 *   on-device   hand the phone over and tap "Reply here". No server, no
 *               account, no internet.
 *   shared      when Supabase credentials exist, a row is opened so a reply
 *               from a different phone can find its way back. Purely additive.
 *
 * The question is never sent to the shared transport. It travels in the link
 * and nowhere else, so the server cannot know what anyone asked. The row holds
 * an id and whatever comes back, and nothing else.
 *
 * Nothing here ever touches the emergency profile.
 */

import { AppState } from 'react-native'
import { newId } from './id'
import { readHandoff, writeHandoff } from './store'
import type { Handoff } from './types'

const TTL_MS = 60 * 60 * 1000 // 60 minutes

/** Where `frontend/` is published. A real, reachable page — a code that opens
 *  nothing is worse than no code at all. */
const DEFAULT_COUNTER_URL = 'https://prayanshsingh0007.github.io/Sawaal-Jawaab'

const COUNTER_URL = (process.env['EXPO_PUBLIC_COUNTER_URL'] || DEFAULT_COUNTER_URL).replace(
  /\/+$/,
  '',
)
const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? ''
const SUPABASE_KEY = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? ''

export const sharedTransportAvailable = Boolean(SUPABASE_URL && SUPABASE_KEY)
export const counterUrlConfigured = COUNTER_URL.length > 0

/* ── Link encoding ─────────────────────────────────────────────────────── */

function toBase64Url(input: string): string {
  // btoa is unavailable in Hermes; encode from UTF-8 bytes by hand.
  const bytes = new TextEncoder().encode(input)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0)
    out += chars[(n >> 18) & 63]! + chars[(n >> 12) & 63]!
    if (b !== undefined) out += chars[(n >> 6) & 63]!
    if (c !== undefined) out += chars[n & 63]!
  }
  return out
}

/**
 * The payload carried in the link: the id and the question, separated by a
 * pipe. Deliberately not JSON — the braces and quotes cost about nineteen
 * characters, which is a whole QR version denser for no benefit. A question
 * containing a pipe still survives, because only the first one is a separator.
 */
function pack(handoff: Handoff): string {
  return toBase64Url(`${handoff.id}|${handoff.question}`)
}

/** The URL printed into the QR code — a plain web page, no install needed. */
export function handoffLink(handoff: Handoff): string {
  return `${COUNTER_URL}/#/r/${pack(handoff)}`
}

export function companionLink(handoff: Handoff): string {
  return `${COUNTER_URL}/#/c/${pack(handoff)}`
}

/* ── Records ───────────────────────────────────────────────────────────── */

/**
 * Builds a handoff. Pure: no storage, no network — the Show screen needs an id
 * during its first render so the code is on screen immediately, and a render
 * is not a place to have effects.
 */
export function newHandoff(question: string): Handoff {
  const now = Date.now()
  const handoff: Handoff = {
    // With no sign-in anywhere, this id is the whole capability: holding it is
    // what proves you were shown the code. Long enough that guessing one
    // inside its hour is not a thing anybody can do.
    id: newId(12),
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  return handoff
}

/** Records it and, where there is a shared transport, opens a row for a reply. */
export function persistHandoff(handoff: Handoff): void {
  void writeHandoff(handoff.id, handoff)
  void mirror(handoff)
}

/** Both steps at once, for callers already inside an event handler. */
export function createHandoff(question: string): Handoff {
  const handoff = newHandoff(question)
  persistHandoff(handoff)
  return handoff
}

export function minutesLeft(handoff: Handoff): number {
  return Math.max(0, Math.round((handoff.expiresAt - Date.now()) / 60000))
}

export async function recordReply(id: string, reply: string): Promise<void> {
  const existing = await readHandoff<Handoff>(id)
  if (existing) await writeHandoff(id, { ...existing, reply })
  await push(id, { reply })
}

/* ── Watching for a reply from another device ──────────────────────────── */

export interface Watcher {
  stop: () => void
}

export function watchHandoff(
  id: string,
  onUpdate: (patch: { reply?: string; suggestion?: string }) => void,
  expiresAt?: number,
): Watcher {
  if (!sharedTransportAvailable) return { stop: () => undefined }

  /* Eager at first — someone is standing at a counter right now — then backing
     off. It stops for good once the reply is in, stops when the handoff's hour
     is up, and sleeps while the app is in the background: a screen left open
     should not sit there draining a battery on a question already answered. */
  let stopped = false
  let delay = 1200
  let timer: ReturnType<typeof setTimeout> | null = null

  const stop = () => {
    stopped = true
    if (timer) clearTimeout(timer)
    timer = null
    subscription.remove()
  }

  const tick = async () => {
    if (stopped) return
    if (expiresAt && Date.now() > expiresAt) return stop()

    const remote = await pull(id)
    if (remote) {
      onUpdate(remote)
      // The reply is the thing we were waiting for. Nothing left to ask about.
      if (remote.reply) return stop()
    }
    delay = Math.min(Math.round(delay * 1.3), 8000)
    if (!stopped) timer = setTimeout(tick, delay)
  }

  const subscription = AppState.addEventListener('change', (state) => {
    if (stopped) return
    if (state === 'active') {
      delay = 1200
      if (!timer) timer = setTimeout(tick, delay)
    } else if (timer) {
      clearTimeout(timer)
      timer = null
    }
  })

  timer = setTimeout(tick, delay)

  return { stop }
}

/* ── Optional shared transport ───────────────────────────────────────────
   Every call is a security-definer function that demands the exact id. The
   table itself is unreachable — there is no endpoint that lists rows, so
   there is nothing to enumerate. */

function headers(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  if (!sharedTransportAvailable) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(args),
    })
    if (!res.ok) return null
    // A void function answers 204 with an empty body; asking that for JSON
    // throws, and the row was created perfectly well.
    if (res.status === 204) return null
    const text = await res.text()
    return text ? (JSON.parse(text) as T) : null
  } catch {
    // The on-device path still carries the flow.
    return null
  }
}

async function mirror(handoff: Handoff): Promise<void> {
  // Note what is absent: the question.
  await rpc('open_handoff', { p_id: handoff.id })
}

async function push(id: string, patch: { reply?: string; suggestion?: string }): Promise<void> {
  if (patch.reply !== undefined) await rpc('post_reply', { p_id: id, p_reply: patch.reply })
  if (patch.suggestion !== undefined) {
    await rpc('post_suggestion', { p_id: id, p_suggestion: patch.suggestion })
  }
}

async function pull(id: string): Promise<{ reply?: string; suggestion?: string } | null> {
  const rows = await rpc<Array<{ reply: string | null; suggestion: string | null }>>(
    'read_handoff',
    { p_id: id },
  )
  const row = rows?.[0]
  if (!row) return null
  const out: { reply?: string; suggestion?: string } = {}
  if (row.reply) out.reply = row.reply
  if (row.suggestion) out.suggestion = row.suggestion
  return Object.keys(out).length ? out : null
}
