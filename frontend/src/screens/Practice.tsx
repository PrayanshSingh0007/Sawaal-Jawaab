import { useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button, IconButton } from '../components/Button'
import { ChoiceCard } from '../components/ChoiceCard'
import { AiNote, Card } from '../components/Surfaces'
import { MicButton } from '../components/MicButton'
import { VoiceWaveform } from '../components/VoiceWaveform'
import { useApp } from '../state/AppState'
import { useNavigator } from '../state/router'
import { useDictation } from '../state/useDictation'
import { practiceConversation, practiceHint, practiceOpener } from '../lib/ai'
import { newId } from '../lib/id'
import type { PracticeTurn } from '../lib/types'

const SITUATIONS = [
  { id: 'bank', icon: 'bank', title: 'Bank', subtitle: 'Open an account, update a passbook.' },
  { id: 'doctor', icon: 'stethoscope', title: 'Doctor', subtitle: 'Explain a problem, ask about medicine.' },
  { id: 'ticket', icon: 'train', title: 'Ticket counter', subtitle: 'Buy a ticket, find your platform.' },
]

const STALL_MS = 22000

/** A safe rehearsal. The other person is always patient, and never rushes. */
export function Practice() {
  const { settings, announce } = useApp()
  const { go } = useNavigator()
  const [situation, setSituation] = useState<string | null>(null)
  const [turns, setTurns] = useState<PracticeTurn[]>([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [usedAi, setUsedAi] = useState(false)
  const [stallTick, setStallTick] = useState(0)
  const stalls = useRef(0)
  const hintIndex = useRef(0)
  const bottom = useRef<HTMLDivElement>(null)

  const dictation = useDictation(settings.language, (heard) =>
    setText((t) => (t ? `${t} ${heard}` : heard)),
  )

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns, thinking])

  /* If the person stalls twice, the scene offers an opening — never a comment
     on how they are doing. The tick re-arms the timer, so a second quiet spell
     actually arrives instead of the countdown stopping after the first. */
  useEffect(() => {
    if (!situation || thinking) return
    const timer = window.setTimeout(() => {
      stalls.current += 1
      if (stalls.current >= 2) {
        const hint = practiceHint(situation, hintIndex.current)
        hintIndex.current += 1
        setTurns((t) => [...t, { id: newId(), from: 'hint', text: hint }])
        announce(`Idea: ${hint}`)
        stalls.current = 0
      }
      setStallTick((n) => n + 1)
    }, STALL_MS)
    return () => window.clearTimeout(timer)
  }, [situation, turns, thinking, stallTick, announce])

  const begin = (id: string) => {
    setSituation(id)
    setTurns([{ id: newId(), from: 'them', text: practiceOpener(id) }])
    stalls.current = 0
    hintIndex.current = 0
  }

  const send = async () => {
    const message = text.trim()
    if (!message || !situation) return
    const mine: PracticeTurn = { id: newId(), from: 'me', text: message }
    const history = [...turns, mine]
    setTurns(history)
    setText('')
    setThinking(true)
    stalls.current = 0
    const result = await practiceConversation(situation, history, message)
    if (result.source === 'ai') setUsedAi(true)
    setTurns((t) => [...t, { id: newId(), from: 'them', text: result.reply }])
    setThinking(false)
  }

  if (!situation) {
    return (
      <div className="page page-anim" data-nav="false">
        <TopBar title="Practice" onBack={() => go('more')} />
        <div className="stack gap6">
          <div className="stack gap3">
            <h2 className="display balance">Practise before you go</h2>
            <p className="body muted balance" style={{ maxWidth: '34ch' }}>
              Try the conversation here first. Nothing is saved, and there is no hurry.
            </p>
          </div>
          <div className="stack gap4">
            {SITUATIONS.map((s) => (
              <ChoiceCard
                key={s.id}
                icon={s.icon}
                title={s.title}
                subtitle={s.subtitle}
                selected={false}
                onSelect={() => begin(s.id)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const label = SITUATIONS.find((s) => s.id === situation)?.title ?? 'Practice'

  return (
    <div className="page page-anim" data-nav="false">
      <TopBar
        title={label}
        onBack={() => setSituation(null)}
        backLabel="Choose another situation"
        right={
          <IconButton
            icon="replay"
            label="Start this conversation again"
            onClick={() => begin(situation)}
          />
        }
      />

      <div className="chat" role="log" aria-label="Practice conversation" aria-live="polite">
        {turns.map((turn) => (
          <div key={turn.id} className={`bubble bubble--${turn.from}`}>
            <p className="bubble__who">
              {turn.from === 'me' ? 'You' : turn.from === 'hint' ? 'Idea' : label}
            </p>
            <p>{turn.text}</p>
          </div>
        ))}
        {thinking && (
          <div className="bubble bubble--them" aria-hidden="true">
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="composer liquid">
        {dictation.recording ? (
          <div className="row gap3 grow" style={{ padding: 'var(--s3)' }}>
            <VoiceWaveform getLevel={dictation.getLevel} active />
            <span className="caption muted grow">{dictation.partial || 'Listening…'}</span>
          </div>
        ) : (
          <div className="well grow" style={{ padding: 'var(--s3) var(--s4)' }}>
            <label className="sr-only" htmlFor="practice-input">
              Your turn
            </label>
            <textarea
              id="practice-input"
              className="well__input"
              style={{ fontSize: 'var(--fs-body)', minHeight: 44, paddingTop: 10 }}
              rows={1}
              value={text}
              placeholder="Say your part…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
            />
          </div>
        )}
        <MicButton recording={dictation.recording} onToggle={dictation.toggle} />
        <IconButton
          icon="send"
          label="Send"
          tone="accent"
          onClick={() => void send()}
          disabled={!text.trim()}
        />
      </div>

      <div style={{ marginTop: 'var(--s4)' }}>
        <Card variant="tile" className="stack gap3">
          <AiNote>
            {usedAi
              ? 'AI is playing the other person — it is not a real clerk or doctor.'
              : 'Practising with the built-in partner — it is not a real clerk or doctor.'}
          </AiNote>
          <Button variant="quiet" size="sm" icon="ask" onClick={() => go('home')}>
            I’m ready — ask for real
          </Button>
        </Card>
      </div>
    </div>
  )
}
