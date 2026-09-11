import { useRef, useState } from 'react'
import { TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { useFlow } from '../../state/FlowState'
import { dictationAvailable } from '../../lib/speech'
import { STARTER_PHRASES } from '../../data/packMeta'
import { Screen } from '../../components/Screen'
import { Hero, Banner, Card } from '../../components/Surface'
import { Button, IconButton } from '../../components/Button'
import { Segmented, PhraseCard } from '../../components/Controls'
import { Well } from '../../components/Well'
import { MicButton } from '../../components/Mic'
import { LogoMark } from '../../components/Logo'
import { Rise } from '../../components/Motion'
import { T } from '../../components/Type'
import { TAB_BAR_HEIGHT } from '../../components/TabBar'
import type { InputMethod } from '../../lib/types'

const METHODS: Array<{ value: InputMethod; label: string; icon: string }> = [
  { value: 'type', label: 'Type', icon: 'keyboard' },
  { value: 'speak', label: 'Speak', icon: 'mic' },
  { value: 'symbols', label: 'Pictures', icon: 'symbols' },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { settings, announce } = useApp()
  const { draft, setRaw, setMethod, phrases, startFrom, recordUse, suggestion, clearSuggestion } = useFlow()
  const field = useRef<TextInput>(null)
  // 'symbols' lives on its own screen, so the tab here starts on a text method.
  const [method, setLocalMethod] = useState<InputMethod>(
    settings.preferredMethod === 'symbols' ? 'type' : settings.preferredMethod,
  )
  const [micNote, setMicNote] = useState(false)

  const ready = draft.raw.trim().length > 0
  const top = phrases.slice(0, 3)
  const starters = top.length ? [] : STARTER_PHRASES

  const chooseMethod = (next: InputMethod) => {
    setMethod(next)
    if (next === 'symbols') {
      router.push('/symbols')
      return
    }
    setLocalMethod(next)
    if (next === 'speak') {
      if (dictationAvailable()) return
      setMicNote(true)
      announce('Speaking to type is not available in this build. Typing and pictures still work.')
    }
  }

  return (
    <Screen bottomInset={TAB_BAR_HEIGHT}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[5] }}>
        <LogoMark size={34} />
        <View style={{ flex: 1 }}>
          <T variant="label" color="muted">
            {greeting()}
          </T>
          <T variant="caption" color="muted">
            Sawaal Jawaab
          </T>
        </View>
        <IconButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      {suggestion ? (
        <Card tile style={{ marginBottom: space[4], gap: space[3] }}>
          <T variant="label" color="accent">
            A suggestion from your helper
          </T>
          <T variant="body">{suggestion}</T>
          <View style={{ flexDirection: 'row', gap: space[3], flexWrap: 'wrap' }}>
            <Button
              variant="dark"
              size="sm"
              icon="check"
              onPress={() => {
                setRaw(suggestion)
                clearSuggestion()
                field.current?.focus()
              }}
            >
              Use this
            </Button>
            <Button variant="quiet" size="sm" onPress={clearSuggestion}>
              Not now
            </Button>
          </View>
        </Card>
      ) : null}

      <Rise delay={40}>
        <Hero
          eyebrow="Ask"
        title="How can I help you ask?"
          subtitle="Say it any way you like. We turn it into one clear sentence and show it big."
        >
          <Button variant="dark" size="lg" icon="ask" onPress={() => field.current?.focus()}>
            Ask something
          </Button>
        </Hero>
      </Rise>

      <Rise delay={130} style={{ marginTop: space[7], gap: space[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <T variant="h2" style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }}>
            {top.length ? 'Your phrases' : 'Start with these'}
          </T>
          <Button variant="quiet" size="sm" iconAfter="forward" onPress={() => router.push('/packs')}>
            More
          </Button>
        </View>

        <View style={{ gap: space[3] }}>
          {top.map((p, i) => (
            <Rise key={p.id} delay={190 + i * 60}>
            <PhraseCard
              text={p.text}
              meta={p.uses > 1 ? `Used ${p.uses} times` : 'Used once'}
              onPress={() => {
                startFrom(p.text, p.packId)
                void recordUse(p.text, p.packId)
                router.push('/show')
              }}
            />
            </Rise>
          ))}
          {starters.map((text, i) => (
            <Rise key={text} delay={190 + i * 60}>
            <PhraseCard
              text={text}
              category="Common"
              onPress={() => {
                startFrom(text)
                void recordUse(text)
                router.push('/show')
              }}
            />
            </Rise>
          ))}
        </View>
      </Rise>

      <Rise delay={380} style={{ marginTop: space[7], gap: space[4] }}>
        <T variant="h2" style={{ fontFamily: 'Inter_600SemiBold' }}>
          Write your question
        </T>

        <Segmented label="How do you want to say it?" options={METHODS} value={method} onChange={chooseMethod} />

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[4] }}>
          <Well
            ref={field}
            label="Your question"
            placeholder="Where do I submit this form?"
            value={draft.raw}
            onChangeText={setRaw}
            maxLength={200}
            big
            minHeight={132}
            style={{ flex: 1 }}
          />
          <View style={{ alignItems: 'center', gap: 2 }}>
            <MicButton
              recording={false}
              disabled={!dictationAvailable()}
              onPress={() => chooseMethod('speak')}
            />
            <T variant="caption" color="muted">
              Speak
            </T>
          </View>
        </View>

        {micNote ? (
          <Banner icon="mic">
            Speaking to type needs a development build. Typing and pictures still work.
          </Banner>
        ) : null}

        <View style={{ flexDirection: 'row', gap: space[3], flexWrap: 'wrap' }}>
          <Button
            variant="accent"
            size="lg"
            icon="forward"
            disabled={!ready}
            onPress={() => router.push('/polish')}
            style={{ flexGrow: 1 }}
          >
            Continue
          </Button>
          <Button variant="ghost" size="lg" icon="symbols" onPress={() => router.push('/symbols')}>
            Pictures
          </Button>
        </View>

        {ready ? (
          <T variant="caption" color="muted" center>
            Next: choose how it should sound, then show it.
          </T>
        ) : null}
      </Rise>
    </Screen>
  )
}
