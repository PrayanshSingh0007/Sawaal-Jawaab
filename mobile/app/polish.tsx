import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { buildSentence, buildSymbolSentence } from '../lib/ai'
import { Screen } from '../components/Screen'
import { TopBar } from '../components/TopBar'
import { AiNote, Banner, Card, Tag } from '../components/Surface'
import { Button } from '../components/Button'
import { Rise } from '../components/Motion'
import { Sheet } from '../components/Sheet'
import { Well } from '../components/Well'
import { T } from '../components/Type'
import { Icon } from '../components/Icon'
import type { Tone } from '../lib/types'

const TONES: Array<{ value: Tone; label: string; hint: string; icon: string }> = [
  { value: 'short', label: 'Short', hint: 'Straight to the point', icon: 'ask' },
  { value: 'polite', label: 'Polite', hint: 'Good at a counter', icon: 'heart' },
  { value: 'urgent', label: 'Urgent', hint: 'Needs attention now', icon: 'alert' },
]

/** The bridge: raw words in, one clear sentence out. Never a dead end. */
export default function Polish() {
  const { announce, elevation, settings } = useApp()
  const { draft, variants, setVariants, tone, setTone, question, setQuestionOverride, recordUse } = useFlow()
  const [loading, setLoading] = useState(!variants)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(question)

  useEffect(() => {
    if (variants) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    const source =
      draft.method === 'symbols' && draft.symbols.length
        ? buildSymbolSentence(draft.symbols, settings.language)
        : buildSentence(draft.raw, settings.language)
    void source.then((result) => {
      if (!alive) return
      setVariants(result)
      setLoading(false)
      announce('Three versions are ready. Choose one.')
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen>
      <TopBar title="Check it" />
      <View style={{ gap: space[6] }}>
        <View style={{ gap: space[3] }}>
          <T variant="display">What do you want to say?</T>
          <T variant="body" color="muted">
            You said:
          </T>
          <Card tile style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Icon
              name={draft.method === 'symbols' ? 'symbols' : 'edit'}
              size={20}
              color={color.ink2}
            />
            <T variant="body" style={{ flex: 1 }}>
              {draft.method === 'symbols' && draft.symbols.length
                ? draft.symbols.map((s) => s.label).join(' → ')
                : draft.raw || '—'}
            </T>
          </Card>
        </View>

        {variants?.needs ? (
          <Banner icon="hint" tone="accent">
            {variants.needs}
          </Banner>
        ) : null}

        <View accessibilityRole="radiogroup" accessibilityLabel="Choose how it should sound" style={{ gap: space[4] }}>
          {TONES.map((t, i) => {
            const text = variants?.[t.value]
            const selected = tone === t.value
            return (
              <Rise key={t.value} delay={80 + i * 70}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t.label}. ${text ?? draft.raw}`}
                onPress={() => setTone(t.value)}
                style={{
                  padding: space[5],
                  borderRadius: R.card,
                  backgroundColor: selected ? '#FFFDFC' : color.surface,
                  boxShadow: selected
                    ? `${elevation.e2}, inset 0 0 0 2px ${color.accent}`
                    : `${elevation.e1}, ${elevation.rim}`,
                  gap: space[3],
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <Icon name={t.icon} size={18} color={selected ? color.accentInk : color.ink2} />
                  <Tag tone={selected ? 'accent' : 'outline'}>{t.label}</Tag>
                  <T variant="caption" color="muted" style={{ flex: 1 }}>
                    {t.hint}
                  </T>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? color.accent : color.surfaceSunk,
                      boxShadow: selected ? undefined : elevation.sunk,
                    }}
                  >
                    {selected ? <Icon name="check" size={14} strokeWidth={3.2} color="#fff" /> : null}
                  </View>
                </View>
                <T variant="h2">{loading && !text ? 'Writing…' : text || draft.raw}</T>
              </Pressable>
              </Rise>
            )
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 180 }}>
            <AiNote>
              {loading
                ? 'Writing three versions…'
                : variants?.source === 'ai'
                  ? 'AI suggestion — check it’s right'
                  : 'Written on your device — check it’s right'}
            </AiNote>
          </View>
          <Button
            variant="quiet"
            size="sm"
            icon="edit"
            onPress={() => {
              setEditText(question)
              setEditing(true)
            }}
          >
            Edit words
          </Button>
        </View>

        <View style={{ gap: space[3] }}>
          <Button
            variant="accent"
            size="lg"
            block
            icon="forward"
            onPress={() => {
              void recordUse(question, draft.packId)
              router.push('/show')
            }}
          >
            Show this
          </Button>
          <T variant="caption" color="muted" center>
            Your phone becomes a card the other person can read.
          </T>
        </View>
      </View>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit your words">
        <View style={{ gap: space[4] }}>
          <Well label="Your question" value={editText} onChangeText={setEditText} big minHeight={140} />
          <Button
            variant="accent"
            size="lg"
            block
            icon="check"
            onPress={() => {
              setQuestionOverride(editText.trim())
              setEditing(false)
              announce('Your words are saved.')
            }}
          >
            Save words
          </Button>
        </View>
      </Sheet>
    </Screen>
  )
}
