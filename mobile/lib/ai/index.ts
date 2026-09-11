/**
 * The AI service the UI talks to.
 *
 * Every function here resolves. None of them throw, none of them hang, and all
 * of them return a usable result whether or not a model is reachable — the
 * `source` field says which engine answered so the interface can be honest.
 */

import type { LanguageCode, PracticeTurn, ReplyResult, SentenceResult, SymbolDef } from '../types'
import { LANGUAGES } from '../../data/languages'
import {
  offlinePractice,
  offlineSentence,
  offlineSimplify,
  offlineSymbolSentence,
  practiceHint,
  practiceOpener,
} from './offline'
import {
  PRACTICE_SYSTEM,
  SENTENCE_SYSTEM,
  SIMPLIFY_SYSTEM,
  practiceUserPrompt,
  sentenceUserPrompt,
  simplifyUserPrompt,
  symbolUserPrompt,
} from './prompts'
import { askModel, remoteLikelyDown } from './remote'

function languageName(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? 'English'
}

function cleanSentence(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.replace(/\s+/g, ' ').trim()
  return s.length > 1 && s.length < 400 ? s : null
}

/** Turns a rough fragment into short / polite / urgent versions of one sentence. */
export async function buildSentence(
  fragment: string,
  language: LanguageCode = 'en',
): Promise<SentenceResult> {
  const fallback = offlineSentence(fragment)
  if (!fragment.trim()) return fallback

  const raw = await askModel<Partial<SentenceResult>>(
    SENTENCE_SYSTEM,
    sentenceUserPrompt(fragment, languageName(language)),
  )
  const short = cleanSentence(raw?.short)
  const polite = cleanSentence(raw?.polite)
  const urgent = cleanSentence(raw?.urgent)
  if (!short || !polite || !urgent) return fallback

  return {
    short,
    polite,
    urgent,
    needs: cleanSentence(raw?.needs),
    source: 'ai',
  }
}

/** Turns a run of tapped pictures into one sentence with the same meaning. */
export async function buildSymbolSentence(
  symbols: SymbolDef[],
  language: LanguageCode = 'en',
): Promise<SentenceResult> {
  const fallback = offlineSymbolSentence(symbols)
  if (!symbols.length) return fallback

  const raw = await askModel<Partial<SentenceResult>>(
    SENTENCE_SYSTEM,
    symbolUserPrompt(symbols.map((s) => s.word), languageName(language)),
  )
  const short = cleanSentence(raw?.short)
  const polite = cleanSentence(raw?.polite)
  const urgent = cleanSentence(raw?.urgent)
  if (!short || !polite || !urgent) return fallback

  return { short, polite, urgent, needs: cleanSentence(raw?.needs), source: 'ai' }
}

/** Reduces a reply to plain words plus the single next thing to do. */
export async function simplifyReply(reply: string): Promise<ReplyResult> {
  const fallback = offlineSimplify(reply)
  if (!reply.trim()) return fallback

  const raw = await askModel<Partial<ReplyResult>>(SIMPLIFY_SYSTEM, simplifyUserPrompt(reply), 500)
  const simple = cleanSentence(raw?.simple)
  if (!simple) return fallback

  const confidence =
    typeof raw?.confidence === 'number' && raw.confidence >= 0 && raw.confidence <= 1
      ? raw.confidence
      : 0.6

  // Below the threshold the person sees exactly what was written to them.
  if (confidence < 0.7) {
    return { simple: reply, action: cleanSentence(raw?.action), verbatim: reply, confidence, source: 'ai' }
  }

  return {
    simple,
    action: cleanSentence(raw?.action),
    verbatim: null,
    confidence,
    source: 'ai',
  }
}

/** One turn of a rehearsal conversation. The persona is always patient. */
export async function practiceConversation(
  situation: string,
  history: PracticeTurn[],
  message: string,
): Promise<{ reply: string; source: 'ai' | 'offline' }> {
  const fallback = offlinePractice(situation, history, message)

  const transcript = history
    .filter((t) => t.from !== 'hint')
    .slice(-8)
    .map((t) => `${t.from === 'me' ? 'Person' : 'You'}: ${t.text}`)
    .join('\n')

  const raw = await askModel<{ reply?: string }>(
    PRACTICE_SYSTEM,
    practiceUserPrompt(situation, transcript, message),
    300,
  )
  const reply = cleanSentence(raw?.reply)
  return reply ? { reply, source: 'ai' } : { ...fallback, source: 'offline' }
}

export { practiceHint, practiceOpener, remoteLikelyDown }
