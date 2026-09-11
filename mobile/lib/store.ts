/**
 * On-device storage.
 *
 * Everything the person has said stays on their phone. Reads always resolve to
 * a safe default so a failure degrades into "nothing saved yet" rather than a
 * crash, exactly as the web build's IndexedDB layer does.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { EmergencyProfile, Exchange, SavedPhrase, Settings } from './types'

const K = {
  exchanges: 'sj.exchanges',
  phrases: 'sj.phrases',
  profile: 'sj.profile',
  settings: 'sj.settings',
  handoff: 'sj.handoff.',
} as const

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — the current screen still works */
  }
}

/* ── Settings ──────────────────────────────────────────────────────────── */

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  textScale: 1,
  highContrast: false,
  reduceMotion: null,
  hyperlegible: false,
  readAloudAll: false,
  symbolSet: 'line',
  preferredMethod: 'type',
  onboarded: false,
  speechRate: 1,
}

export async function loadSettings(): Promise<Settings> {
  const saved = await readJson<Partial<Settings>>(K.settings, {})
  return { ...DEFAULT_SETTINGS, ...saved }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeJson(K.settings, settings)
}

/* ── Exchanges ─────────────────────────────────────────────────────────── */

export async function listExchanges(): Promise<Exchange[]> {
  const all = await readJson<Exchange[]>(K.exchanges, [])
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function saveExchange(entry: Exchange): Promise<void> {
  const all = await readJson<Exchange[]>(K.exchanges, [])
  const i = all.findIndex((e) => e.id === entry.id)
  if (i >= 0) all[i] = entry
  else all.unshift(entry)
  await writeJson(K.exchanges, all.slice(0, 300))
}

export async function deleteExchange(id: string): Promise<void> {
  const all = await readJson<Exchange[]>(K.exchanges, [])
  await writeJson(
    K.exchanges,
    all.filter((e) => e.id !== id),
  )
}

/* ── Phrases ───────────────────────────────────────────────────────────── */

export async function listPhrases(): Promise<SavedPhrase[]> {
  const all = await readJson<SavedPhrase[]>(K.phrases, [])
  return all.sort((a, b) => b.uses - a.uses || b.lastUsedAt - a.lastUsedAt)
}

export async function savePhrase(phrase: SavedPhrase): Promise<void> {
  const all = await readJson<SavedPhrase[]>(K.phrases, [])
  const i = all.findIndex((p) => p.id === phrase.id)
  if (i >= 0) all[i] = phrase
  else all.push(phrase)
  await writeJson(K.phrases, all)
}

/* ── Emergency profile — device only, never synced ─────────────────────── */

export async function readProfile(): Promise<EmergencyProfile | null> {
  return readJson<EmergencyProfile | null>(K.profile, null)
}

export async function writeProfile(profile: EmergencyProfile): Promise<void> {
  await writeJson(K.profile, profile)
}

/* ── Handoff records ───────────────────────────────────────────────────── */

export async function readHandoff<T>(id: string): Promise<T | null> {
  return readJson<T | null>(K.handoff + id, null)
}

export async function writeHandoff(id: string, value: unknown): Promise<void> {
  await writeJson(K.handoff + id, value)
}

/* ── Erase ─────────────────────────────────────────────────────────────── */

/** Removes every local trace. Settings are reset, not merely forgotten. */
export async function eraseEverything(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith('sj.')))
  } catch {
    /* nothing we can do, and nothing more to try */
  }
}
