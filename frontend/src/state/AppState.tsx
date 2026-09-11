import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Settings } from '../lib/types'
import { readLocal, writeLocal } from '../lib/storage'
import { speak as speakText, speechAvailable, stopSpeaking } from '../lib/speech'

const DEFAULTS: Settings = {
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

interface AppApi {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  resetSettings: () => void

  online: boolean
  canSpeak: boolean

  /** Speaks text, honouring the person's language and speed. */
  say: (text: string, rate?: number) => boolean
  hush: () => void

  /** Sends a short message to assistive technology without showing anything. */
  announce: (message: string) => void

  toast: string | null
  showToast: (message: string) => void
}

const Ctx = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => readLocal('settings', DEFAULTS))
  const [online, setOnline] = useState(() => navigator.onLine)
  const [toast, setToast] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const toastTimer = useRef(0)

  /* Settings are reflected onto <html> so CSS alone can respond to them. */
  useEffect(() => {
    const root = document.documentElement
    root.dataset['textScale'] = String(settings.textScale)
    root.dataset['contrast'] = settings.highContrast ? 'high' : 'normal'
    root.dataset['font'] = settings.hyperlegible ? 'hyperlegible' : 'default'
    if (settings.reduceMotion === true) root.dataset['motion'] = 'reduced'
    else if (settings.reduceMotion === false) root.dataset['motion'] = 'full'
    else delete root.dataset['motion']
    root.lang = settings.language
    writeLocal('settings', settings)
  }, [settings])

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const resetSettings = useCallback(() => setSettings({ ...DEFAULTS, onboarded: true }), [])

  const say = useCallback(
    (text: string, rate?: number) =>
      speakText(text, { lang: settings.language, rate: rate ?? settings.speechRate }),
    [settings.language, settings.speechRate],
  )

  const announce = useCallback((message: string) => {
    setAnnouncement('')
    window.setTimeout(() => setAnnouncement(message), 60)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const value = useMemo<AppApi>(
    () => ({
      settings,
      update,
      resetSettings,
      online,
      canSpeak: speechAvailable(),
      say,
      hush: stopSpeaking,
      announce,
      toast,
      showToast,
    }),
    [settings, update, resetSettings, online, say, announce, toast, showToast],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </Ctx.Provider>
  )
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
