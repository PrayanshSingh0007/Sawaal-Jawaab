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
 *   shared      when Supabase credentials exist, the same record is mirrored
 *               to a table so a different phone can reply. Purely additive.
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
  return `${location.origin}${location.pathname}#/reply/${pack(h)}`
}

export function companionLink(h: Handoff): string {
  return `${location.origin}${location.pathname}#/companion/${pack(h)}`
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

export function createHandoff(question: string): Handoff {
  pruneExpired()
  const now = Date.now()
  const h: Handoff = {
    id: newId(8),
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  writeRecord(h)
  void mirror(h)
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

  let timer = 0
  if (sharedTransportAvailable) {
    timer = window.setInterval(async () => {
      const remote = await pull(id)
      if (remote) onUpdate(remote)
    }, 3000)
  }

  return {
    stop: () => {
      channel?.removeEventListener('message', onMessage)
      window.removeEventListener('storage', onStorage)
      if (timer) clearInterval(timer)
    },
  }
}

/* ── Optional shared transport ─────────────────────────────────────────── */

function headers(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY ?? '',
    Authorization: `Bearer ${SUPABASE_KEY ?? ''}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  }
}

async function mirror(h: Handoff): Promise<void> {
  if (!sharedTransportAvailable) return
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/handoffs`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ id: h.id, question: h.question, expires_at: new Date(h.expiresAt).toISOString() }),
    })
  } catch {
    /* on-device transport still carries the flow */
  }
}

async function push(id: string, patch: Record<string, string>): Promise<void> {
  if (!sharedTransportAvailable) return
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/handoffs?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(patch),
    })
  } catch {
    /* already delivered locally */
  }
}

async function pull(id: string): Promise<{ reply?: string; suggestion?: string } | null> {
  if (!sharedTransportAvailable) return null
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/handoffs?id=eq.${encodeURIComponent(id)}&select=reply,suggestion`,
      { headers: headers() },
    )
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ reply: string | null; suggestion: string | null }>
    const row = rows[0]
    if (!row) return null
    const out: { reply?: string; suggestion?: string } = {}
    if (row.reply) out.reply = row.reply
    if (row.suggestion) out.suggestion = row.suggestion
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}
