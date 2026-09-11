import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { color, motion, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { handoffLink, newHandoff, persistHandoff, recordReply } from '../lib/handoff'
import { isSpeaking } from '../lib/speech'
import { fitShowSize } from '../lib/fit'
import { Screen } from '../components/Screen'
import { Rise } from '../components/Motion'
import { Sheen } from '../components/Sheen'
import { Glow } from '../components/Glow'
import { Banner } from '../components/Surface'
import { Button, IconButton } from '../components/Button'
import { Segmented } from '../components/Controls'
import { QRCard } from '../components/QRCard'
import { Sheet } from '../components/Sheet'
import { Well } from '../components/Well'
import { T } from '../components/Type'

type Speed = 'slow' | 'normal' | 'fast'
const RATES: Record<Speed, number> = { slow: 0.7, normal: 1, fast: 1.25 }

/**
 * SHOW — the phone becomes a card.
 *
 * This screen renders from whatever text exists right now. It never waits for
 * a network call, a model, or a voice to load: the question is on screen the
 * moment the person arrives.
 */
export default function Show() {
  const { say, hush, announce, elevation, reduceMotion, t } = useApp()
  const { question, registerHandoff, receiveReply, markShown, reply: incoming } = useFlow()
  const [speed, setSpeed] = useState<Speed>('normal')
  const [speaking, setSpeaking] = useState(false)
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [cardWidth, setCardWidth] = useState(0)
  // A long question steps the type down so the whole sentence stays visible
  // and Read aloud stays reachable.
  const shown = fitShowSize(question, t.show)

  // The code exists on the first frame: the record is created with the screen,
  // then handed to the flow so any reply is watched for.
  const [record, setRecord] = useState(() => newHandoff(question))
  useEffect(() => {
    if (record.question !== question) setRecord(newHandoff(question))
  }, [question, record.question])
  useEffect(() => {
    persistHandoff(record)
    registerHandoff(record)
  }, [record, registerHandoff])

  const bloom = useSharedValue(reduceMotion ? 1 : 0)
  const lift = useSharedValue(reduceMotion ? 1 : 0)
  useEffect(() => {
    markShown()
    announce(`Showing your question: ${question}`)
    if (!reduceMotion) {
      bloom.value = withTiming(1, { duration: 420, easing: Easing.bezier(...motion.easing) })
      // A spring on the scale so the card settles like a held object rather
      // than easing to a stop.
      lift.value = withSpring(1, { damping: 15, stiffness: 140, mass: 0.9 })
    }
    return () => hush()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A reply landing — whether typed here or sent from the phone that scanned
     the code — moves the person straight to it. */
  useEffect(() => {
    if (incoming) router.replace('/understand')
  }, [incoming])

  useEffect(() => {
    if (!speaking) return
    const timer = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 400)
    return () => clearInterval(timer)
  }, [speaking])

  // scale 0.94 → 1 on a spring, the light blooming with it
  const cardStyle = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [{ scale: 0.94 + lift.value * 0.06 }, { translateY: (1 - lift.value) * 10 }],
  }))

  const readAloud = () => {
    if (speaking) {
      hush()
      setSpeaking(false)
      return
    }
    setSpeaking(say(question, RATES[speed]))
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space[3] }}>
        <IconButton
          icon="back"
          label="Back to your question"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        />
        <View style={{ flex: 1 }} />
        <T variant="caption" color="muted">
          Showing to someone
        </T>
      </View>

      <View style={{ flex: 1, minHeight: 240, marginBottom: space[4] }}>
        <Glow />
        <Animated.View
          onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
          style={[
            {
              flex: 1,
              borderRadius: R.sheet,
              overflow: 'hidden',
              boxShadow: `${elevation.e3}, ${elevation.rim}, inset 0 0 0 1px rgba(242,98,46,0.16)`,
            },
            cardStyle,
          ]}
        >
          <LinearGradient
            colors={['#FFFEFC', color.surface, '#F2EFEA']}
            locations={[0, 0.55, 1]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={{ flex: 1, justifyContent: 'center', padding: space[6] }}
          >
            <T
              variant="show"
              accessibilityRole="header"
              style={{ fontSize: shown, lineHeight: Math.round(shown * 1.14) }}
            >
              {question || 'Your question will appear here.'}
            </T>
          </LinearGradient>
          {/* The card catching the light as it settles. */}
          <Sheen width={cardWidth} delay={320} />
        </Animated.View>
      </View>

      <View style={{ gap: space[3] }}>
        <Rise delay={180}>
          <Button variant="accent" size="lg" block icon="speaker" onPress={readAloud}>
            {speaking ? 'Stop reading' : 'Read aloud'}
          </Button>
        </Rise>

        <Rise delay={250} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <IconButton
            icon="replay"
            label="Read it again"
            onPress={() => {
              hush()
              setSpeaking(say(question, RATES[speed]))
            }}
          />
          <View style={{ flex: 1 }}>
            <Segmented
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
          </View>
        </Rise>

        <Rise delay={320}>
          <QRCard value={handoffLink(record)} />
        </Rise>

        <Rise delay={390}>
          <T variant="body" color="muted" center style={{ fontFamily: 'Inter_500Medium' }}>
            {'I find speaking difficult.\nPlease reply here or scan the code.'}
          </T>
        </Rise>

        <Rise delay={450}>
          <Button variant="ghost" size="lg" block icon="ask" onPress={() => setReplying(true)}>
            Reply here
          </Button>
        </Rise>
      </View>

      <Sheet open={replying} onClose={() => setReplying(false)} title="Reply to this question">
        <View style={{ gap: space[5] }}>
          <View style={{ gap: space[2] }}>
            <T variant="eyebrow" color="muted">
              They asked
            </T>
            <T variant="h1">{question}</T>
          </View>
          <Well
            label="Your reply"
            placeholder="Type your reply here"
            value={reply}
            onChangeText={setReply}
            minHeight={140}
            autoFocus
          />
          <Button
            variant="accent"
            size="lg"
            block
            icon="send"
            disabled={!reply.trim()}
            onPress={() => {
              const text = reply.trim()
              setReplying(false)
              setReply('')
              void recordReply(record.id, text)
              void receiveReply(text)
            }}
          >
            Send reply
          </Button>
          <Banner icon="info">Your reply appears on their screen in large, plain words.</Banner>
        </View>
      </Sheet>
    </Screen>
  )
}
