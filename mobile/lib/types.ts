/** Shared domain types. UI never invents its own shapes. */

export type InputMethod = 'type' | 'speak' | 'symbols'

export type Tone = 'short' | 'polite' | 'urgent'

export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn' | 'te'

export interface Language {
  code: LanguageCode
  label: string
  native: string
  /** BCP-47 tag handed to speech synthesis / recognition. */
  bcp47: string
}

/** Result of turning a fragment into a sentence someone else can act on. */
export interface SentenceResult {
  short: string
  polite: string
  urgent: string
  /** One clarifying question when a required fact is missing. Never a guess. */
  needs: string | null
  /** Where the sentence came from, so the UI can be honest about it. */
  source: 'ai' | 'offline'
}

export interface ReplyResult {
  simple: string
  action: string | null
  /** Set when confidence is low: the original reply, unchanged. */
  verbatim: string | null
  confidence: number
  source: 'ai' | 'offline'
}

export interface PracticeTurn {
  id: string
  from: 'me' | 'them' | 'hint'
  text: string
}

export interface Exchange {
  id: string
  question: string
  tone: Tone
  method: InputMethod
  reply: string | null
  simplified: string | null
  action: string | null
  place: string | null
  packId: string | null
  createdAt: number
}

export interface SavedPhrase {
  id: string
  text: string
  packId: string | null
  uses: number
  lastUsedAt: number
}

export interface EmergencyProfile {
  name: string
  bloodGroup: string
  condition: string
  allergies: string
  contactName: string
  contactPhone: string
  message: string
}

export interface Settings {
  language: LanguageCode
  textScale: 1 | 1.15 | 1.35 | 1.6
  highContrast: boolean
  reduceMotion: boolean | null
  hyperlegible: boolean
  readAloudAll: boolean
  symbolSet: 'line' | 'solid'
  preferredMethod: InputMethod
  onboarded: boolean
  speechRate: number
}

export interface Pack {
  id: string
  title: string
  description: string
  tag: string
  icon: string
  phrases: PackPhrase[]
}

export interface PackPhrase {
  text: string
  category: string
}

export interface SymbolDef {
  id: string
  label: string
  icon: string
  /** Word used when the symbols are assembled into a sentence. */
  word: string
  kind: 'question' | 'thing' | 'answer' | 'action'
}

/** A question handed to another person, with any reply that comes back. */
export interface Handoff {
  id: string
  question: string
  createdAt: number
  expiresAt: number
  reply: string | null
  suggestion: string | null
}
