import { Pressable, View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { Button } from '../../components/Button'
import { T } from '../../components/Type'
import type { Settings } from '../../lib/types'

export const SIZES: Array<{ value: Settings['textScale']; label: string; aa: number }> = [
  { value: 1, label: 'Normal', aa: 17 },
  { value: 1.15, label: 'Large', aa: 21 },
  { value: 1.35, label: 'Larger', aa: 25 },
  { value: 1.6, label: 'Biggest', aa: 30 },
]

export function TextSizePicker() {
  const { settings, update, elevation, tap } = useApp()
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
      {SIZES.map((opt) => {
        const active = settings.textScale === opt.value
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${opt.label} text`}
            onPress={() => {
              tap('select')
              update({ textScale: opt.value })
            }}
            style={{
              flexGrow: 1,
              flexBasis: 68,
              minHeight: 76,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: space[2],
              borderRadius: R.tile,
              backgroundColor: active ? '#FFFDFB' : color.surface,
              boxShadow: active
                ? `${elevation.e2}, inset 0 0 0 2px ${color.accent}`
                : `${elevation.e1}, ${elevation.rim}`,
            }}
          >
            <T
              variant="h1"
              color={active ? 'ink' : 'muted'}
              style={{ fontSize: opt.aa, lineHeight: opt.aa + 2, fontFamily: 'Inter_700Bold' }}
            >
              Aa
            </T>
            <T variant="caption" color={active ? 'ink' : 'muted'} center>
              {opt.label}
            </T>
          </Pressable>
        )
      })}
    </View>
  )
}

/** The sample really resizes — what you pick is what you get everywhere. */
export default function TextSize() {
  const { settings, update, elevation } = useApp()
  const current = SIZES.find((s) => s.value === settings.textScale)

  return (
    <Screen>
      <TopBar backLabel="Back" />
      <View style={{ gap: space[6] }}>
        <View style={{ gap: space[3] }}>
          <T variant="eyebrow" color="muted">
            Step 2 of 2
          </T>
          <T variant="display">Pick your text size</T>
          <T variant="body" color="muted" style={{ maxWidth: 340 }}>
            Everything in the app grows with it. You can change this any time.
          </T>
        </View>

        <View
          style={{
            minHeight: 190,
            alignItems: 'center',
            justifyContent: 'center',
            padding: space[6],
            borderRadius: R.card,
            backgroundColor: color.surface,
            boxShadow: elevation.sunk,
          }}
        >
          <T variant="h1" center>
            Where do I submit this form?
          </T>
        </View>

        <View style={{ gap: space[3] }}>
          <TextSizePicker />
          <T variant="caption" color="muted" center accessibilityLiveRegion="polite">
            {current?.label} text
          </T>
        </View>

        <Button
          variant="accent"
          size="lg"
          block
          icon="check"
          onPress={() => {
            update({ onboarded: true })
            router.replace('/(tabs)')
          }}
        >
          Done
        </Button>
      </View>
    </Screen>
  )
}
