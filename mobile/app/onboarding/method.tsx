import { View } from 'react-native'
import { router } from 'expo-router'
import { space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { ChoiceCard } from '../../components/Controls'
import { Button } from '../../components/Button'
import { T } from '../../components/Type'
import type { InputMethod } from '../../lib/types'

const OPTIONS: Array<{ value: InputMethod; icon: string; title: string; subtitle: string }> = [
  { value: 'type', icon: 'keyboard', title: 'Type', subtitle: 'Write what you want to say.' },
  { value: 'speak', icon: 'mic', title: 'Speak', subtitle: 'Say it in your own way.' },
  { value: 'symbols', icon: 'symbols', title: 'Tap pictures', subtitle: 'Build a question with symbols.' },
]

export default function Method() {
  const { settings, update } = useApp()
  return (
    <Screen
      header={<TopBar backLabel="Back to start" />}
    >
      <View style={{ gap: space[6] }}>
        <View style={{ gap: space[3] }}>
          <T variant="eyebrow" color="muted">
            Step 1 of 2
          </T>
          <T variant="display">How do you talk?</T>
          <T variant="body" color="muted" style={{ maxWidth: 340 }}>
            Pick what feels easiest. You can use any of them, any time.
          </T>
        </View>

        <View accessibilityRole="radiogroup" style={{ gap: space[4] }}>
          {OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              icon={opt.icon}
              title={opt.title}
              subtitle={opt.subtitle}
              selected={settings.preferredMethod === opt.value}
              onPress={() => update({ preferredMethod: opt.value })}
            />
          ))}
        </View>

        <Button variant="accent" size="lg" block icon="forward" onPress={() => router.push('/onboarding/size')}>
          Continue
        </Button>
      </View>
    </Screen>
  )
}
