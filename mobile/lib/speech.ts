/**
 * Reading aloud.
 *
 * Native speech is better than the browser's: the voice is the one the person
 * already has set up on their phone, and it works with no internet at all.
 */

import * as Speech from 'expo-speech'
import type { LanguageCode } from './types'

const BCP47: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  te: 'te-IN',
}

let speaking = false

export interface SpeakOptions {
  lang?: LanguageCode
  rate?: number
  onDone?: () => void
}

/** Speaks text. Returns false only if there is nothing to say. */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!text.trim()) return false
  Speech.stop()
  speaking = true
  Speech.speak(text, {
    language: BCP47[opts.lang ?? 'en'],
    // expo-speech treats 1 as normal; the platform clamps the extremes.
    rate: opts.rate ?? 1,
    pitch: 1,
    onDone: () => {
      speaking = false
      opts.onDone?.()
    },
    onStopped: () => {
      speaking = false
    },
    onError: () => {
      speaking = false
    },
  })
  return true
}

export function stopSpeaking(): void {
  speaking = false
  Speech.stop()
}

export function isSpeaking(): boolean {
  return speaking
}

/**
 * Dictation.
 *
 * Speech-to-text needs a native module that Expo Go does not bundle, so in Expo
 * Go this reports itself unavailable and the interface offers typing and the
 * picture board instead — the same graceful path the web build takes when a
 * browser has no recognition. In a development build, drop in
 * `@react-native-voice/voice` and implement `startDictation` against it.
 */
export function dictationAvailable(): boolean {
  return false
}
