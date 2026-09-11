import { useEffect, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { practiceConversation, practiceHint, practiceOpener } from '../lib/ai'
import { newId } from '../lib/id'
import { Screen } from '../components/Screen'
import { TopBar } from '../components/TopBar'
import { ChoiceCard } from '../components/Controls'
import { AiNote, Card } from '../components/Surface'
import { Button, IconButton } from '../components/Button'
import { Well } from '../components/Well'
import { Glass } from '../components/Glass'
import { T } from '../components/Type'
import type { PracticeTurn } from '../lib/types'

const SITUATIONS = [
  { id: 'bank', icon: 'bank', title: 'Bank', subtitle: 'Open an account, update a passbook.' },
  { id: 'doctor', icon: 'stethoscope', title: 'Doctor', subtitle: 'Explain a problem, ask about medicine.' },
  { id: 'ticket', icon: 'train', title: 'Ticket counter', subtitle: 'Buy a ticket, find your platform.' },
]

const STALL_MS = 22000

/** A safe rehearsal. The other person is always patient, and never rushes. */
export default function Practice() {
  const { announce, elevation } = useApp()
  const [situation, setSituation] = useState<string | null>(null)
  const [turns, setTurns] = useState<PracticeTurn[]>([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [usedAi, setUsedAi] = useState(false)
  const [stallTick, setStallTick] = useState(0)
  const stalls = useRef(0)
  const hintIndex = useRef(0)
  const list = useRef<ScrollView>(null)

  useEffect(() => {
    requestAnimationFrame(() => list.current?.scrollToEnd({ animated: true }))
  }, [turns, thinking])

  /* If the person stalls twice, the scene offers an opening — never a comment
     on how they are doing. The tick re-arms the timer, so a second quiet spell
     actually arrives instead of the countdown stopping after the first. */
  useEffect(() => {
    if (!situation || thinking) return
    const timer = setTimeout(() => {
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
    return () => clearTimeout(timer)
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
      <Screen>
        <TopBar title="Practice" />
        <View style={{ gap: space[6] }}>
          <View style={{ gap: space[3] }}>
            <T variant="display">Practise before you go</T>
            <T variant="body" color="muted" style={{ maxWidth: 340 }}>
              Try the conversation here first. Nothing is saved, and there is no hurry.
            </T>
          </View>
          <View style={{ gap: space[4] }}>
            {SITUATIONS.map((s) => (
              <ChoiceCard
                key={s.id}
                icon={s.icon}
                title={s.title}
                subtitle={s.subtitle}
                selected={false}
                onPress={() => begin(s.id)}
              />
            ))}
          </View>
        </View>
      </Screen>
    )
  }

  const label = SITUATIONS.find((s) => s.id === situation)?.title ?? 'Practice'

  return (
    <Screen scroll={false}>
      <TopBar
        title={label}
        onBack={() => setSituation(null)}
        backLabel="Choose another situation"
        right={
          <IconButton icon="replay" label="Start this conversation again" onPress={() => begin(situation)} />
        }
      />

      <ScrollView
        ref={list}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: space[4], paddingVertical: space[4] }}
        accessibilityLabel="Practice conversation"
      >
        {turns.map((turn) => (
          <View
            key={turn.id}
            style={{
              maxWidth: '86%',
              alignSelf: turn.from === 'me' ? 'flex-end' : 'flex-start',
              padding: space[5],
              paddingVertical: space[4],
              borderRadius: R.card,
              gap: 4,
              backgroundColor:
                turn.from === 'me'
                  ? color.pillDark
                  : turn.from === 'hint'
                    ? color.accentSoft
                    : color.surface,
              boxShadow: turn.from === 'them' ? `${elevation.e1}, ${elevation.rim}` : undefined,
              borderBottomRightRadius: turn.from === 'me' ? space[3] : R.card,
              borderBottomLeftRadius: turn.from === 'me' ? R.card : space[3],
            }}
          >
            <T
              variant="caption"
              style={{
                fontFamily: 'Inter_700Bold',
                letterSpacing: 1,
                textTransform: 'uppercase',
                opacity: 0.6,
                color: turn.from === 'me' ? '#F7F4F0' : color.ink2,
              }}
            >
              {turn.from === 'me' ? 'You' : turn.from === 'hint' ? 'Idea' : label}
            </T>
            <T
              variant="body"
              style={{
                color:
                  turn.from === 'me' ? '#F7F4F0' : turn.from === 'hint' ? color.accentInk : color.ink,
              }}
            >
              {turn.text}
            </T>
          </View>
        ))}
        {thinking ? (
          <View
            style={{
              alignSelf: 'flex-start',
              paddingVertical: space[4],
              paddingHorizontal: space[5],
              borderRadius: R.card,
              backgroundColor: color.surface,
              boxShadow: `${elevation.e1}, ${elevation.rim}`,
            }}
          >
            <T variant="body" color="muted">
              …
            </T>
          </View>
        ) : null}

        <Card tile style={{ gap: space[3], marginTop: space[4] }}>
          <AiNote>
            {usedAi
              ? 'AI is playing the other person — it is not a real clerk or doctor.'
              : 'Practising with the built-in partner — it is not a real clerk or doctor.'}
          </AiNote>
          <Button variant="quiet" size="sm" icon="ask" onPress={() => router.replace('/(tabs)')}>
            I’m ready — ask for real
          </Button>
        </Card>
      </ScrollView>

      <Glass radius={R.sheet} style={{ marginTop: space[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[3], padding: space[3] }}>
          <Well
            label="Your turn"
            placeholder="Say your part…"
            value={text}
            onChangeText={setText}
            minHeight={52}
            style={{ flex: 1, paddingVertical: space[2] }}
          />
          <IconButton
            icon="send"
            label="Send"
            tone="accent"
            disabled={!text.trim()}
            onPress={() => void send()}
          />
        </View>
      </Glass>
    </Screen>
  )
}
