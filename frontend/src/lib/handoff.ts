/**
 * Handoff — passing a question to another person and getting a reply back.
 *
 * Two transports, chosen automatically:
 *
 *   on-device   the question travels inside the QR link itself, and replies
 *               come back over BroadcastChannel + localStorage. This covers
 *               the everyday case — handing the phone over — and needs no
 *               server, no account and no internet.
 *
 *   shared      when Supabase credentials exist, a row is opened so a reply
 *               from a different phone can find its way back. Purely additive.
 *
 * The question is never sent to the shared transport. It travels in the link
 * and nowhere else, so the server cannot know what anyone asked. The row holds
 * an id and whatever comes back, and nothing else.
 *
 * Nothing here ever touches the emergency profile.
 */

import { newId } from './id'
import type { Handoff } from './types'

const KEY = 'sj.handoff.'
const TTL_MS = 60 * 60 * 1000 // 60 minutes

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] as string | undefined
const SUPABASE_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined

export const sharedTransportAvailable = Boolean(SUPABASE_URL && SUPABASE_KEY)

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sawaal-handoff') : null

/* ── Link encoding ─────────────────────────────────────────────────────── */

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(token: string): string {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/**
 * The payload carried in the link: the id and the question, separated by a
 * pipe. Deliberately not JSON — the braces and quotes cost about nineteen
 * characters, which is a whole QR version denser for no benefit. A question
 * containing a pipe still survives, because only the first one is a separator.
 */
function pack(h: Handoff): string {
  return encode(`${h.id}|${h.question}`)
}

/** The URL printed into the QR code. Carries the question, so it opens offline-first. */
export function handoffLink(h: Handoff): string {
  return `${location.origin}${location.pathname}#/r/${pack(h)}`
}

export function companionLink(h: Handoff): string {
  return `${location.origin}${location.pathname}#/c/${pack(h)}`
}

export function readLink(payload: string): { id: string; question: string } | null {
  let raw: string
  try {
    raw = decode(payload)
  } catch {
    return null
  }

  const split = raw.indexOf('|')
  if (split > 0) {
    const id = raw.slice(0, split)
    const question = raw.slice(split + 1)
    return question ? { id, question } : null
  }

  // Links made before the compact format still open.
  try {
    const parsed = JSON.parse(raw) as { i?: string; q?: string }
    if (!parsed.i || typeof parsed.q !== 'string') return null
    return { id: parsed.i, question: parsed.q }
  } catch {
    return null
  }
}

/* ── Local record ──────────────────────────────────────────────────────── */

function readRecord(id: string): Handoff | null {
  try {
    const raw = localStorage.getItem(KEY + id)
    return raw ? (JSON.parse(raw) as Handoff) : null
  } catch {
    return null
  }
}

function writeRecord(h: Handoff): void {
  try {
    localStorage.setItem(KEY + h.id, JSON.stringify(h))
  } catch {
    /* storage full or blocked — the on-screen flow still works */
  }
}

/** Drops handoffs whose hour has passed, so storage never grows unbounded. */
function pruneExpired(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(KEY)) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const record = JSON.parse(raw) as Handoff
      if (Date.now() > record.expiresAt) localStorage.removeItem(key)
    }
  } catch {
    /* storage unavailable — nothing to prune */
  }
}

/**
 * Builds a handoff. Pure: no storage, no network — the Show screen needs an id
 * during its first render so the code is on screen immediately, and a render
 * is not a place to have effects.
 */
export function newHandoff(question: string): Handoff {
  const now = Date.now()
  const h: Handoff = {
    id: newId(8),
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  return h
}

/** Records it and, where there is a shared transport, opens a row for a reply. */
export function persistHandoff(h: Handoff): void {
  pruneExpired()
  writeRecord(h)
  void mirror(h)
}

/** Both steps at once, for callers already inside an event handler. */
export function createHandoff(question: string): Handoff {
  const h = newHandoff(question)
  persistHandoff(h)
  return h
}

export function isExpired(h: Handoff): boolean {
  return Date.now() > h.expiresAt
}

export function minutesLeft(h: Handoff): number {
  return Math.max(0, Math.round((h.expiresAt - Date.now()) / 60000))
}

/* ── Sending ───────────────────────────────────────────────────────────── */

export async function sendReply(id: string, question: string, reply: string): Promise<void> {
  const existing = readRecord(id)
  const now = Date.now()
  const h: Handoff = existing ?? {
    id,
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  h.reply = reply
  writeRecord(h)
  channel?.postMessage({ kind: 'reply', id, reply })
  await push(id, { reply })
}

export async function sendSuggestion(id: string, question: string, suggestion: string): Promise<void> {
  const existing = readRecord(id)
  const now = Date.now()
  const h: Handoff = existing ?? {
    id,
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  h.suggestion = suggestion
  writeRecord(h)
  channel?.postMessage({ kind: 'suggestion', id, suggestion })
  await push(id, { suggestion })
}

/* ── Watching ──────────────────────────────────────────────────────────── */

export interface Watcher {
  stop: () => void
}

/** Calls back the moment a reply or suggestion arrives, from any transport. */
export function watchHandoff(
  id: string,
  onUpdate: (patch: { reply?: string; suggestion?: string }) => void,
  expiresAt?: number,
): Watcher {
  const onMessage = (e: MessageEvent) => {
    const d = e.data as { kind?: string; id?: string; reply?: string; suggestion?: string }
    if (d?.id !== id) return
    if (d.kind === 'reply' && d.reply) onUpdate({ reply: d.reply })
    if (d.kind === 'suggestion' && d.suggestion) onUpdate({ suggestion: d.suggestion })
  }
  channel?.addEventListener('message', onMessage)

  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY + id || !e.newValue) return
    try {
      const h = JSON.parse(e.newValue) as Handoff
      onUpdate({ ...(h.reply ? { reply: h.reply } : {}), ...(h.suggestion ? { suggestion: h.suggestion } : {}) })
    } catch {
      /* ignore malformed */
    }
  }
  window.addEventListener('storage', onStorage)

  /* Polling starts eager — someone is standing at a counter right now — then
     backs off, and stops entirely while the tab is hidden. */
  let timer = 0
  let stopped = false
  let delay = 1200

  const tick = async () => {
    if (stopped) return
    if (expiresAt && Date.now() > expiresAt) return stop()

    if (document.visibilityState === 'visible') {
      const remote = await pull(id)
      if (remote) {
        onUpdate(remote)
        // The reply is the thing we were waiting for.
        if (remote.reply) return stop()
      }
    }
    delay = Math.min(Math.round(delay * 1.3), 8000)
    if (!stopped) timer = window.setTimeout(tick, delay)
  }

  const onVisible = () => {
    if (document.visibilityState === 'visible') delay = 1200
  }

  function stop() {
    stopped = true
    channel?.removeEventListener('message', onMessage)
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisible)
    if (timer) clearTimeout(timer)
  }

  if (sharedTransportAvailable) {
    timer = window.setTimeout(tick, delay)
    document.addEventListener('visibilitychange', onVisible)
  }

  return { stop }
}

/* ── Optional shared transport ───────────────────────────────────────────
   Every call is a security-definer function that demands the exact id. The
   table itself is unreachable — there is no endpoint that lists rows, so
   there is nothing to enumerate. */

function headers(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY ?? '',
    Authorization: `Bearer ${SUPABASE_KEY ?? ''}`,
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
    return (await res.json()) as T
  } catch {
    // The on-device transport still carries the flow.
    return null
  }
}

async function mirror(h: Handoff): Promise<void> {
  // Note what is absent: the question.
  await rpc('open_handoff', { p_id: h.id })
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
