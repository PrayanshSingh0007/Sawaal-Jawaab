/** Tiny synchronous store for settings — needed before the first paint. */

const PREFIX = 'sj.'

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return { ...(fallback as object), ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* private mode — the app still works, it just forgets */
  }
}

export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* nothing to do */
  }
}
