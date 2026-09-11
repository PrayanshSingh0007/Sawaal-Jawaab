/**
 * Handoff — passing a question to another person and getting a reply back.
 *
 * The person replying must never have to install anything, so the QR code
 * points at the web counter page rather than at this app. Set
 * `EXPO_PUBLIC_COUNTER_URL` to wherever `frontend/` is deployed.
 *
 * Two transports, chosen automatically:
 *
 *   on-device   hand the phone over and tap "Reply here". No server, no
 *               account, no internet.
 *   shared      when Supabase credentials exist, the same record is mirrored
 *               so a different phone can reply. Purely additive.
 *
 * Nothing here ever touches the emergency profile.
 */

import { newId } from './id'
import { readHandoff, writeHandoff } from './store'
import type { Handoff } from './types'

const TTL_MS = 60 * 60 * 1000 // 60 minutes

const COUNTER_URL = (process.env['EXPO_PUBLIC_COUNTER_URL'] ?? '').replace(/\/+$/, '')
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

/** The URL printed into the QR code — a plain web page, no install needed. */
export function handoffLink(handoff: Handoff): string {
  const payload = toBase64Url(JSON.stringify({ i: handoff.id, q: handoff.question }))
  const base = COUNTER_URL || 'https://sawaal-jawaab.app'
  return `${base}/#/reply/${payload}`
}

export function companionLink(handoff: Handoff): string {
  const payload = toBase64Url(JSON.stringify({ i: handoff.id, q: handoff.question }))
  const base = COUNTER_URL || 'https://sawaal-jawaab.app'
  return `${base}/#/companion/${payload}`
}

/* ── Records ───────────────────────────────────────────────────────────── */

export function createHandoff(question: string): Handoff {
  const now = Date.now()
  const handoff: Handoff = {
    id: newId(8),
    question,
    createdAt: now,
    expiresAt: now + TTL_MS,
    reply: null,
    suggestion: null,
  }
  void writeHandoff(handoff.id, handoff)
  void mirror(handoff)
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
): Watcher {
  if (!sharedTransportAvailable) return { stop: () => undefined }
  const timer = setInterval(async () => {
    const remote = await pull(id)
    if (remote) onUpdate(remote)
  }, 3000)
  return { stop: () => clearInterval(timer) }
}

/* ── Optional shared transport ─────────────────────────────────────────── */

function headers(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  }
}

async function mirror(handoff: Handoff): Promise<void> {
  if (!sharedTransportAvailable) return
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/handoffs`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        id: handoff.id,
        question: handoff.question,
        expires_at: new Date(handoff.expiresAt).toISOString(),
      }),
    })
  } catch {
    /* the on-device path still carries the flow */
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
