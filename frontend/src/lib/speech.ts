/**
 * Speech — reading aloud and listening.
 *
 * Both are optional. Every caller gets a clear boolean back so the UI can say
 * what still works instead of failing silently.
 */

import type { LanguageCode } from './types'

const BCP47: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  te: 'te-IN',
}

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let currentUtterance: SpeechSynthesisUtterance | null = null
let voices: SpeechSynthesisVoice[] = []

/**
 * Chrome returns an empty voice list on the first call and fills it
 * asynchronously, which used to make the very first "Read aloud" fall back to
 * the default voice. Priming here means the right voice is ready by the time
 * anyone presses it.
 */
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const refresh = () => {
    voices = window.speechSynthesis.getVoices()
  }
  refresh()
  window.speechSynthesis.addEventListener?.('voiceschanged', refresh)
}

function pickVoice(tag: string): SpeechSynthesisVoice | null {
  if (!voices.length) voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  return (
    voices.find((v) => v.lang.replace('_', '-') === tag) ??
    voices.find((v) => v.lang.replace('_', '-').startsWith(tag.split('-')[0] ?? '')) ??
    null
  )
}

export interface SpeakOptions {
  lang?: LanguageCode
  rate?: number
  onEnd?: () => void
  onStart?: () => void
}

/** Speaks text. Returns false when the browser cannot speak. */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!speechAvailable() || !text.trim()) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const tag = BCP47[opts.lang ?? 'en']
    u.lang = tag
    const voice = pickVoice(tag)
    if (voice) u.voice = voice
    u.rate = opts.rate ?? 1
    u.pitch = 1
    if (opts.onEnd) u.onend = () => opts.onEnd?.()
    if (opts.onStart) u.onstart = () => opts.onStart?.()
    currentUtterance = u
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking(): void {
  if (!speechAvailable()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* nothing playing */
  }
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return speechAvailable() && window.speechSynthesis.speaking && currentUtterance !== null
}

/* ── Listening ─────────────────────────────────────────────────────────── */

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
}

function recognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>
  return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition']) as
    | (new () => SpeechRecognitionLike)
    | null
}

export function listeningAvailable(): boolean {
  return typeof window !== 'undefined' && recognitionCtor() !== null
}

export interface Listener {
  stop: () => void
}

export interface ListenHandlers {
  onPartial: (text: string) => void
  onFinal: (text: string) => void
  onError: (reason: 'denied' | 'unavailable' | 'nothing') => void
}

/** Starts dictation. Returns null when the browser has no speech recognition. */
export function listen(lang: LanguageCode, h: ListenHandlers): Listener | null {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    h.onError('unavailable')
    return null
  }
  let stopped = false
  let heardAnything = false
  const rec = new Ctor()
  rec.lang = BCP47[lang]
  rec.continuous = false
  rec.interimResults = true

  rec.onresult = (e: any) => {
    let interim = ''
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i]
      const text = res[0]?.transcript ?? ''
      if (res.isFinal) final += text
      else interim += text
    }
    if (interim) {
      heardAnything = true
      h.onPartial(interim.trim())
    }
    if (final) {
      heardAnything = true
      h.onFinal(final.trim())
    }
  }
  rec.onerror = (e: any) => {
    const err = String(e?.error ?? '')
    if (err === 'not-allowed' || err === 'service-not-allowed') h.onError('denied')
    else if (err === 'no-speech') h.onError('nothing')
    else h.onError('unavailable')
  }
  rec.onend = () => {
    if (!stopped && !heardAnything) h.onError('nothing')
  }

  try {
    rec.start()
  } catch {
    h.onError('unavailable')
    return null
  }

  return {
    stop: () => {
      stopped = true
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    },
  }
}

/* ── Microphone level, for the waveform ────────────────────────────────── */

export interface LevelMeter {
  stop: () => void
}

/**
 * Streams a 0–1 loudness value. If the microphone is unavailable the caller
 * still gets a gentle synthetic movement so the waveform never looks broken.
 */
export async function meterMicrophone(onLevel: (v: number) => void): Promise<LevelMeter> {
  let raf = 0
  let ctx: AudioContext | null = null
  let stream: MediaStream | null = null
  let alive = true

  const fallback = () => {
    let t = 0
    const tick = () => {
      if (!alive) return
      t += 0.09
      onLevel(0.32 + Math.sin(t) * 0.12 + Math.sin(t * 2.7) * 0.07)
      raf = requestAnimationFrame(tick)
    }
    tick()
  }

  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('no mic')
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
    ctx = new Ctx()
    const src = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      if (!alive) return
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (const v of data) sum += ((v - 128) / 128) ** 2
      onLevel(Math.min(1, Math.sqrt(sum / data.length) * 3.4))
      raf = requestAnimationFrame(tick)
    }
    tick()
  } catch {
    fallback()
  }

  return {
    stop: () => {
      alive = false
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      ctx?.close().catch(() => undefined)
    },
  }
}
