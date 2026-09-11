import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Exchange,
  Handoff,
  InputMethod,
  ReplyResult,
  SavedPhrase,
  SentenceResult,
  SymbolDef,
  Tone,
} from '../lib/types'
import { newId } from '../lib/id'
import { listExchanges, listPhrases, saveExchange, savePhrase } from '../lib/store'
import { createHandoff, watchHandoff } from '../lib/handoff'
import { simplifyReply } from '../lib/ai'
import { PACK_TITLES } from '../data/packMeta'

/**
 * The one journey: ask → polish → show → understand.
 *
 * The draft question exists the moment it is typed. Everything after that —
 * variants, handoff, simplification — is layered on top, never a gate in front.
 */

interface Draft {
  raw: string
  method: InputMethod
  symbols: SymbolDef[]
  packId: string | null
}

interface FlowApi {
  draft: Draft
  setRaw: (raw: string) => void
  setMethod: (method: InputMethod) => void
  setSymbols: (symbols: SymbolDef[]) => void
  startFrom: (text: string, packId?: string | null) => void
  clearDraft: () => void

  variants: SentenceResult | null
  setVariants: (v: SentenceResult | null) => void
  tone: Tone
  setTone: (t: Tone) => void

  /** The sentence being shown right now. Always available, never pending. */
  question: string
  setQuestionOverride: (text: string) => void
  /** Called by the Show screen. Nothing enters history until it is shown. */
  markShown: () => void

  handoff: Handoff | null
  registerHandoff: (handoff: Handoff) => void
  openHandoff: (question: string) => Handoff
  suggestion: string | null
  clearSuggestion: () => void

  reply: string | null
  understood: ReplyResult | null
  understanding: boolean
  receiveReply: (text: string) => Promise<void>

  exchanges: Exchange[]
  phrases: SavedPhrase[]
  refresh: () => Promise<void>
  recordUse: (text: string, packId?: string | null) => Promise<void>
}

const EMPTY_DRAFT: Draft = { raw: '', method: 'type', symbols: [], packId: null }

const Ctx = createContext<FlowApi | null>(null)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [variants, setVariants] = useState<SentenceResult | null>(null)
  const [tone, setTone] = useState<Tone>('short')
  const [override, setOverride] = useState<string | null>(null)
  const [shown, setShown] = useState(false)

  const [handoff, setHandoff] = useState<Handoff | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [reply, setReply] = useState<string | null>(null)
  const [understood, setUnderstood] = useState<ReplyResult | null>(null)
  const [understanding, setUnderstanding] = useState(false)

  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [phrases, setPhrases] = useState<SavedPhrase[]>([])
  const savedRef = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    const [e, p] = await Promise.all([listExchanges(), listPhrases()])
    setExchanges(e)
    setPhrases(p)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const question = useMemo(() => {
    if (override) return override
    if (variants) {
      const picked = variants[tone]
      if (picked) return picked
    }
    return draft.raw.trim()
  }, [override, variants, tone, draft.raw])

  const setRaw = useCallback((raw: string) => {
    setDraft((d) => ({ ...d, raw }))
    // New words mean the polished versions no longer describe them.
    setVariants(null)
    setOverride(null)
    setShown(false)
  }, [])

  const setMethod = useCallback((method: InputMethod) => {
    setDraft((d) => ({ ...d, method }))
  }, [])

  const setSymbols = useCallback((symbols: SymbolDef[]) => {
    setDraft((d) => ({ ...d, symbols }))
    setVariants(null)
    setOverride(null)
  }, [])

  const startFrom = useCallback((text: string, packId: string | null = null) => {
    setDraft({ raw: text, method: 'type', symbols: [], packId })
    setVariants(null)
    setOverride(null)
    setTone('short')
    setReply(null)
    setUnderstood(null)
    setShown(false)
    savedRef.current = null
  }, [])

  const clearDraft = useCallback(() => {
    setDraft(EMPTY_DRAFT)
    setVariants(null)
    setOverride(null)
    setTone('short')
    setReply(null)
    setUnderstood(null)
    setHandoff(null)
    setSuggestion(null)
    setShown(false)
    savedRef.current = null
  }, [])

  const markShown = useCallback(() => setShown(true), [])

  const openHandoff = useCallback((q: string) => {
    const h = createHandoff(q)
    setHandoff(h)
    return h
  }, [])

  const registerHandoff = useCallback((h: Handoff) => {
    setHandoff((current) => (current?.id === h.id ? current : h))
  }, [])

  const receiveReply = useCallback(async (text: string) => {
    setReply(text)
    setUnderstanding(true)
    // The words show immediately; the plain version and action settle after.
    const result = await simplifyReply(text)
    setUnderstood(result)
    setUnderstanding(false)
  }, [])

  const receiveReplyRef = useRef(receiveReply)
  useEffect(() => {
    receiveReplyRef.current = receiveReply
  }, [receiveReply])

  /* A reply arriving from the other person's device. */
  useEffect(() => {
    // Nothing to wait for once the reply is here.
    if (!handoff || reply) return
    const watcher = watchHandoff(
      handoff.id,
      (patch) => {
        if (patch.reply) void receiveReplyRef.current(patch.reply)
        if (patch.suggestion) setSuggestion(patch.suggestion)
      },
      handoff.expiresAt,
    )
    return () => watcher.stop()
  }, [handoff, reply])

  /* One exchange per question, written only once it has been shown. */
  useEffect(() => {
    if (!shown || !question.trim()) return
    const id = savedRef.current ?? newId()
    savedRef.current = id
    const record: Exchange = {
      id,
      question,
      tone,
      method: draft.method,
      reply,
      simplified: understood?.simple ?? null,
      action: understood?.action ?? null,
      place: draft.packId ? (PACK_TITLES[draft.packId] ?? null) : null,
      packId: draft.packId,
      createdAt: Date.now(),
    }
    void saveExchange(record).then(refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, question, reply, understood?.simple])

  const recordUse = useCallback(
    async (text: string, packId: string | null = null) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const existing = phrases.find((p) => p.text.toLowerCase() === trimmed.toLowerCase())
      const next: SavedPhrase = existing
        ? { ...existing, uses: existing.uses + 1, lastUsedAt: Date.now() }
        : { id: newId(), text: trimmed, packId, uses: 1, lastUsedAt: Date.now() }
      await savePhrase(next)
      await refresh()
    },
    [phrases, refresh],
  )

  const value = useMemo<FlowApi>(
    () => ({
      draft,
      setRaw,
      setMethod,
      setSymbols,
      startFrom,
      clearDraft,
      variants,
      setVariants,
      tone,
      setTone,
      question,
      setQuestionOverride: setOverride,
      markShown,
      handoff,
      registerHandoff,
      openHandoff,
      suggestion,
      clearSuggestion: () => setSuggestion(null),
      reply,
      understood,
      understanding,
      receiveReply,
      exchanges,
      phrases,
      refresh,
      recordUse,
    }),
    [
      draft, setRaw, setMethod, setSymbols, startFrom, clearDraft, variants, tone,
      question, markShown, handoff, registerHandoff, openHandoff, suggestion,
      reply, understood, understanding, receiveReply, exchanges, phrases, refresh, recordUse,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFlow(): FlowApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFlow must be used inside FlowProvider')
  return ctx
}
