/**
 * IndexedDB — everything the person has said, saved on their own device.
 *
 * No dependency, no schema migrations beyond a version bump, and every read
 * returns a safe default so a blocked or private-mode database degrades into
 * "nothing saved yet" rather than a crash.
 */

import type { EmergencyProfile, Exchange, SavedPhrase } from './types'

const DB_NAME = 'sawaal-jawaab'
const DB_VERSION = 1

const STORE_EXCHANGES = 'exchanges'
const STORE_PHRASES = 'phrases'
const STORE_PROFILE = 'profile'

let dbPromise: Promise<IDBDatabase | null> | null = null

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    let req: IDBOpenDBRequest
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION)
    } catch {
      return resolve(null)
    }
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_EXCHANGES)) {
        const s = db.createObjectStore(STORE_EXCHANGES, { keyPath: 'id' })
        s.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(STORE_PHRASES)) {
        db.createObjectStore(STORE_PHRASES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
    req.onblocked = () => resolve(null)
  })
  return dbPromise
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return open().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null)
        try {
          const t = db.transaction(store, mode)
          const req = run(t.objectStore(store))
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }),
  )
}

/* ── Exchanges ─────────────────────────────────────────────────────────── */

export async function listExchanges(): Promise<Exchange[]> {
  const all = await tx<Exchange[]>(STORE_EXCHANGES, 'readonly', (s) => s.getAll())
  return (all ?? []).sort((a, b) => b.createdAt - a.createdAt)
}

export async function saveExchange(e: Exchange): Promise<void> {
  await tx(STORE_EXCHANGES, 'readwrite', (s) => s.put(e))
}

export async function deleteExchange(id: string): Promise<void> {
  await tx(STORE_EXCHANGES, 'readwrite', (s) => s.delete(id))
}

/* ── Phrases ───────────────────────────────────────────────────────────── */

export async function listPhrases(): Promise<SavedPhrase[]> {
  const all = await tx<SavedPhrase[]>(STORE_PHRASES, 'readonly', (s) => s.getAll())
  return (all ?? []).sort((a, b) => b.uses - a.uses || b.lastUsedAt - a.lastUsedAt)
}

export async function savePhrase(p: SavedPhrase): Promise<void> {
  await tx(STORE_PHRASES, 'readwrite', (s) => s.put(p))
}

export async function deletePhrase(id: string): Promise<void> {
  await tx(STORE_PHRASES, 'readwrite', (s) => s.delete(id))
}

/* ── Emergency profile — device only, never synced ─────────────────────── */

export async function readProfile(): Promise<EmergencyProfile | null> {
  return (await tx<EmergencyProfile>(STORE_PROFILE, 'readonly', (s) => s.get('emergency'))) ?? null
}

export async function writeProfile(p: EmergencyProfile): Promise<void> {
  await tx(STORE_PROFILE, 'readwrite', (s) => s.put(p, 'emergency'))
}

/* ── Erase ─────────────────────────────────────────────────────────────── */

/** Removes every local trace: database, settings, and any handoff drafts. */
export async function eraseEverything(): Promise<void> {
  const db = await open()
  if (db) {
    for (const store of [STORE_EXCHANGES, STORE_PHRASES, STORE_PROFILE]) {
      await tx(store, 'readwrite', (s) => s.clear())
    }
    db.close()
  }
  dbPromise = null
  try {
    indexedDB.deleteDatabase(DB_NAME)
  } catch {
    /* already gone */
  }
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sj.')) localStorage.removeItem(key)
    }
  } catch {
    /* storage unavailable */
  }
}
