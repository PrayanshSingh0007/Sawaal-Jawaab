import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { ActionChip } from '../components/ActionChip'
import { AiNote, Banner, Card, EmptyState, Skeleton } from '../components/Surfaces'
import { Disclosure } from '../components/Disclosure'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'

/**
 * UNDERSTAND — what they said, and the one thing to do about it.
 * Calm by design: the answer arrives first, the action settles in after it.
 */
export function Understand() {
  const { say, announce, canSpeak } = useApp()
  const { reply, understood, understanding, question, startFrom } = useFlow()
  const { go } = useNavigator()
  const [followUp, setFollowUp] = useState<string | null>(null)

  useEffect(() => {
    if (reply) announce(`A reply came back: ${reply}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply])

  if (!reply) {
    return (
      <div className="page page-anim">
        <TopBar title="Their reply" />
        <EmptyState
          icon="ask"
          title="No reply yet"
          body="Show your question first. When someone replies, their answer appears here in plain words."
          action={
            <Button variant="dark" icon="forward" onClick={() => go('home')}>
              Ask something
            </Button>
          }
        />
      </div>
    )
  }

  const lowConfidence = understood ? understood.confidence < 0.7 : false
  const plain = understood?.simple ?? reply

  const askAgain = () => {
    const question2 =
      'I did not understand that. Please write it down for me, or say it in a simpler way.'
    setFollowUp(question2)
    announce('A follow-up question is ready to show.')
  }

  return (
    <div className="page page-anim">
      <TopBar title="Their reply" />

      <div className="stack gap6">
        {understanding && !understood?.action ? (
          <Card variant="tile" className="stack gap3" aria-hidden="true">
            <Skeleton height={14} width="30%" />
            <Skeleton height={26} width="80%" />
          </Card>
        ) : (
          understood?.action && <ActionChip text={understood.action} />
        )}

        <section aria-labelledby="said-h">
          <h2 id="said-h" className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            What they said
          </h2>
          <Card>
            <p className="reply__body balance" aria-live="polite">
              {plain}
            </p>
            {understood && !lowConfidence && (
              <div style={{ marginTop: 'var(--s5)' }}>
                <AiNote>
                  {understood.source === 'ai'
                    ? 'AI made this simpler — check it’s right'
                    : 'Made simpler on your device — check it’s right'}
                </AiNote>
              </div>
            )}
          </Card>
        </section>

        {lowConfidence && (
          <Banner icon="info">
            This reply was hard to shorten safely, so it is shown exactly as it was written.
          </Banner>
        )}

        {!lowConfidence && (
          <Disclosure summary="Original reply">
            <p>{reply}</p>
          </Disclosure>
        )}

        <div className="stack gap3">
          <Button
            variant="ghost"
            size="lg"
            block
            icon="speaker"
            disabled={!canSpeak}
            onClick={() => say(plain, 0.75)}
          >
            Say it again slower
          </Button>
          <Button variant="ghost" size="lg" block icon="hint" onClick={askAgain}>
            I didn’t understand
          </Button>
        </div>

        {followUp && (
          <Card variant="tile" className="stack gap4 rise">
            <p className="eyebrow">Ask them this</p>
            <p className="h2">{followUp}</p>
            <Button
              variant="accent"
              size="lg"
              block
              icon="forward"
              onClick={() => {
                startFrom(followUp)
                go('show')
              }}
            >
              Show this
            </Button>
          </Card>
        )}

        <div className="hairline" style={{ paddingTop: 'var(--s5)' }}>
          <div className="stack gap3">
            <p className="caption dim">You asked: “{question}”</p>
            <div className="row gap3 wrap">
              <Button variant="quiet" size="sm" icon="ask" onClick={() => go('home')}>
                Ask something else
              </Button>
              <Button variant="quiet" size="sm" icon="history" onClick={() => go('history')}>
                See history
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
