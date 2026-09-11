import { useEffect, useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { Banner } from '../components/Surfaces'
import { QRCard } from '../components/QRCard'
import { BottomSheet } from '../components/BottomSheet'
import { ReplyComposer } from '../components/ReplyComposer'
import { SegmentedControl } from '../components/SegmentedControl'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { createHandoff, handoffLink } from '../lib/handoff'
import { isSpeaking } from '../lib/speech'

type Speed = 'slow' | 'normal' | 'fast'
const RATES: Record<Speed, number> = { slow: 0.7, normal: 1, fast: 1.25 }

/**
 * SHOW — the phone becomes a card.
 *
 * This screen renders from whatever text exists right now. It never waits for
 * a network call, a model, or a voice to load: the question is on screen the
 * moment the person arrives.
 */
export function Show() {
  const { canSpeak, say, hush, announce, settings } = useApp()
  const { question, registerHandoff, receiveReply, markShown, reply: incoming } = useFlow()
  const { go, back } = useNavigator()
  const [speed, setSpeed] = useState<Speed>('normal')
  const [speaking, setSpeaking] = useState(false)
  const [replying, setReplying] = useState(false)

  // The code exists on the first paint: the record is created with the screen,
  // then handed to the flow so any reply is watched for.
  const [record, setRecord] = useState(() => createHandoff(question))
  useEffect(() => {
    if (record.question !== question) setRecord(createHandoff(question))
  }, [question, record.question])
  useEffect(() => {
    registerHandoff(record)
  }, [record, registerHandoff])
  const link = handoffLink(record)

  useEffect(() => {
    markShown()
    announce(`Showing your question: ${question}`)
    return () => hush()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A reply landing — whether typed here or sent from the phone that scanned
     the code — moves the person straight to it. */
  useEffect(() => {
    if (incoming) go('understand', null, { replace: true })
  }, [incoming, go])

  useEffect(() => {
    if (!speaking) return
    const t = window.setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 400)
    return () => clearInterval(t)
  }, [speaking])

  const readAloud = () => {
    if (speaking) {
      hush()
      setSpeaking(false)
      return
    }
    const ok = say(question, RATES[speed])
    setSpeaking(ok)
  }

  const onReply = async (text: string) => {
    setReplying(false)
    await receiveReply(text)
  }

  return (
    <div className="show page-anim" data-nav="false">
      <div className="row between">
        <IconButton icon="back" label="Back to your question" onClick={back} />
        <span className="caption dim">Showing to someone</span>
      </div>

      <section className="show__q">
        <h1 className="show__text" lang={settings.language}>
          {question || 'Your question will appear here.'}
        </h1>
      </section>

      <div className="stack gap3">
        <Button
          variant="accent"
          size="lg"
          block
          icon="speaker"
          onClick={readAloud}
          disabled={!canSpeak}
        >
          {speaking ? 'Stop reading' : 'Read aloud'}
        </Button>

        {canSpeak ? (
          <div className="row gap3">
            <IconButton
              icon="replay"
              label="Read it again"
              onClick={() => {
                hush()
                const ok = say(question, RATES[speed])
                setSpeaking(ok)
              }}
            />
            <div className="grow">
              <SegmentedControl
                label="Reading speed"
                options={[
                  { value: 'slow', label: 'Slow' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'fast', label: 'Fast' },
                ]}
                value={speed}
                onChange={(v) => {
                  setSpeed(v)
                  if (speaking) {
                    hush()
                    setSpeaking(say(question, RATES[v]))
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <Banner icon="speaker">
            This browser has no voice. The big words and the code still work.
          </Banner>
        )}
      </div>

      <QRCard value={link} />

      <p className="show__note">
        I find speaking difficult.
        <br />
        Please reply here or scan the code.
      </p>

      <Button variant="ghost" size="lg" block icon="ask" onClick={() => setReplying(true)}>
        Reply here
      </Button>

      <BottomSheet
        open={replying}
        onClose={() => setReplying(false)}
        title="Reply to this question"
      >
        <div className="stack gap5">
          <div>
            <p className="eyebrow">They asked</p>
            <p className="h1 balance" style={{ marginTop: 'var(--s2)' }}>
              {question}
            </p>
          </div>
          <ReplyComposer onSend={(text) => void onReply(text)} autoFocus />
        </div>
      </BottomSheet>
    </div>
  )
}
