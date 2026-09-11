import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { Screen } from '../components/Screen'
import { TopBar } from '../components/TopBar'
import { ActionChip, LinkRow } from '../components/Controls'
import { AiNote, Banner, Card, EmptyState } from '../components/Surface'
import { Button } from '../components/Button'
import { Rise } from '../components/Motion'
import { T } from '../components/Type'
import { TAB_BAR_HEIGHT } from '../components/TabBar'

/**
 * UNDERSTAND — what they said, and the one thing to do about it.
 * Calm by design: the answer arrives first, the action settles in after it.
 */
export default function Understand() {
  const { say, announce } = useApp()
  const { reply, understood, understanding, question, startFrom } = useFlow()
  const [showOriginal, setShowOriginal] = useState(false)
  const [followUp, setFollowUp] = useState<string | null>(null)

  useEffect(() => {
    if (reply) announce(`A reply came back: ${reply}`)
  }, [reply, announce])

  if (!reply) {
    return (
      <Screen bottomInset={TAB_BAR_HEIGHT}>
        <TopBar title="Their reply" />
        <EmptyState
          icon="ask"
          title="No reply yet"
          body="Show your question first. When someone replies, their answer appears here in plain words."
          action={
            <Button variant="dark" icon="forward" onPress={() => router.replace('/(tabs)')}>
              Ask something
            </Button>
          }
        />
      </Screen>
    )
  }

  const lowConfidence = understood ? understood.confidence < 0.7 : false
  const plain = understood?.simple ?? reply

  return (
    <Screen bottomInset={TAB_BAR_HEIGHT}>
      <TopBar title="Their reply" />
      <View style={{ gap: space[6] }}>
        {understood?.action ? (
          <ActionChip text={understood.action} />
        ) : understanding ? (
          <Card tile>
            <T variant="label" color="muted">
              Working out what to do next…
            </T>
          </Card>
        ) : null}

        <Rise delay={0} style={{ gap: space[3] }}>
          <T variant="eyebrow" color="muted">
            What they said
          </T>
          <Card>
            <T variant="h1" accessibilityLiveRegion="polite" style={{ fontFamily: 'Inter_500Medium' }}>
              {plain}
            </T>
            {understood && !lowConfidence ? (
              <View style={{ marginTop: space[5] }}>
                <AiNote>
                  {understood.source === 'ai'
                    ? 'AI made this simpler — check it’s right'
                    : 'Made simpler on your device — check it’s right'}
                </AiNote>
              </View>
            ) : null}
          </Card>
        </Rise>

        {lowConfidence ? (
          <Banner icon="info">
            This reply was hard to shorten safely, so it is shown exactly as it was written.
          </Banner>
        ) : (
          <View
            style={{
              borderRadius: R.tile,
              overflow: 'hidden',
              backgroundColor: color.canvasLift,
              boxShadow: `inset 0 0 0 1px ${color.hairline}`,
            }}
          >
            <LinkRow
              icon="papers"
              title="Original reply"
              onPress={() => setShowOriginal((v) => !v)}
            />
            {showOriginal ? (
              <View style={{ paddingHorizontal: space[5], paddingBottom: space[5] }}>
                <T variant="body" color="muted">
                  {reply}
                </T>
              </View>
            ) : null}
          </View>
        )}

        <Rise delay={220} style={{ gap: space[3] }}>
          <Button variant="ghost" size="lg" block icon="speaker" onPress={() => say(plain, 0.75)}>
            Say it again slower
          </Button>
          <Button
            variant="ghost"
            size="lg"
            block
            icon="hint"
            onPress={() => {
              const next =
                'I did not understand that. Please write it down for me, or say it in a simpler way.'
              setFollowUp(next)
              announce('A follow-up question is ready to show.')
            }}
          >
            I didn’t understand
          </Button>
        </Rise>

        {followUp ? (
          <Card tile style={{ gap: space[4] }}>
            <T variant="eyebrow" color="muted">
              Ask them this
            </T>
            <T variant="h2">{followUp}</T>
            <Button
              variant="accent"
              size="lg"
              block
              icon="forward"
              onPress={() => {
                startFrom(followUp)
                router.push('/show')
              }}
            >
              Show this
            </Button>
          </Card>
        ) : null}

        <View style={{ paddingTop: space[5], gap: space[3], boxShadow: `inset 0 1px 0 ${color.hairline}` }}>
          <T variant="caption" color="muted" style={{ paddingTop: space[4] }}>
            You asked: “{question}”
          </T>
          <View style={{ flexDirection: 'row', gap: space[3], flexWrap: 'wrap' }}>
            <Button variant="quiet" size="sm" icon="ask" onPress={() => router.replace('/(tabs)')}>
              Ask something else
            </Button>
            <Button variant="quiet" size="sm" icon="history" onPress={() => router.push('/history')}>
              See history
            </Button>
          </View>
        </View>
      </View>
    </Screen>
  )
}
