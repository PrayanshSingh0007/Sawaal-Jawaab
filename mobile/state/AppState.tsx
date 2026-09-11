import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AccessibilityInfo } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { Settings } from '../lib/types'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../lib/store'
import { speak, stopSpeaking } from '../lib/speech'
import { hcShadow, shadow, type as typeScale } from '../theme/tokens'

interface AppApi {
  ready: boolean
  settings: Settings
  update: (patch: Partial<Settings>) => void
  resetSettings: () => void

  /** Text-size setting applied to a base point size. */
  scale: (size: number) => number
  /** The type scale, already scaled. */
  t: Record<keyof typeof typeScale, number>
  /** Elevation set for the current contrast mode. */
  elevation: typeof shadow | typeof hcShadow
  reduceMotion: boolean

  say: (text: string, rate?: number) => boolean
  hush: () => void
  /** Sends a message to the screen reader without showing anything. */
  announce: (message: string) => void
  /** A short physical confirmation. Silent when the person has reduced motion. */
  tap: (kind?: 'light' | 'select' | 'success') => void

  toast: string | null
  showToast: (message: string) => void
}

const Ctx = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [systemReduceMotion, setSystemReduceMotion] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    void loadSettings().then((saved) => {
      setSettings(saved)
      setReady(true)
    })
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion)
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (ready) void saveSettings(settings)
  }, [settings, ready])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS, onboarded: true }), [])

  const reduceMotion =
    settings.reduceMotion === true
      ? true
      : settings.reduceMotion === false
        ? false
        : systemReduceMotion

  const scale = useCallback((size: number) => Math.round(size * settings.textScale), [settings.textScale])

  const t = useMemo(() => {
    const out = {} as Record<keyof typeof typeScale, number>
    for (const key of Object.keys(typeScale) as Array<keyof typeof typeScale>) {
      out[key] = Math.round(typeScale[key] * settings.textScale)
    }
    return out
  }, [settings.textScale])

  const say = useCallback(
    (text: string, rate?: number) =>
      speak(text, { lang: settings.language, rate: rate ?? settings.speechRate }),
    [settings.language, settings.speechRate],
  )

  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message)
  }, [])

  const tap = useCallback(
    (kind: 'light' | 'select' | 'success' = 'light') => {
      if (reduceMotion) return
      if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      else if (kind === 'select') void Haptics.selectionAsync()
      else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    },
    [reduceMotion],
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const value = useMemo<AppApi>(
    () => ({
      ready,
      settings,
      update,
      resetSettings,
      scale,
      t,
      elevation: settings.highContrast ? hcShadow : shadow,
      reduceMotion,
      say,
      hush: stopSpeaking,
      announce,
      tap,
      toast,
      showToast,
    }),
    [ready, settings, update, resetSettings, scale, t, reduceMotion, say, announce, tap, toast, showToast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
