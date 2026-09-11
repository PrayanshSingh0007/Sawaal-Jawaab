import { useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { LogoMark, Wordmark } from '../components/Logo'
import { WelcomeArt } from '../components/WelcomeArt'
import { LanguagePicker } from '../components/LanguagePicker'
import { Button } from '../components/Button'
import { T } from '../components/Type'

/** The door into the app. Short enough to read in one breath. */
export default function Welcome() {
  const { settings, update } = useApp()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (settings.onboarded) router.replace('/(tabs)')
  }, [settings.onboarded])

  if (settings.onboarded) return <View style={{ flex: 1 }} />

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: space[5],
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: space[5],
        paddingTop: insets.top + space[6],
        paddingBottom: insets.bottom + space[6],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <LogoMark size={44} />
        <Wordmark size={26} />
      </View>

      <View style={{ alignItems: 'center', paddingVertical: space[4] }}>
        <WelcomeArt />
      </View>

      <View style={{ gap: space[6] }}>
        <View style={{ gap: space[3] }}>
          <T variant="display">{'Ask what you need.\nWe’ll help you be understood.'}</T>
          <T variant="body" color="muted" style={{ maxWidth: 340 }}>
            Type, speak or tap pictures. Your phone shows the question in big words — and turns
            their reply into something clear.
          </T>
        </View>

        <View style={{ gap: space[3] }}>
          <T variant="label" color="muted">
            Choose a language
          </T>
          <LanguagePicker value={settings.language} onChange={(code) => update({ language: code })} />
        </View>

        <View style={{ gap: space[3] }}>
          <Button variant="accent" size="lg" block icon="forward" onPress={() => router.push('/onboarding/method')}>
            Start
          </Button>
          <Button
            variant="quiet"
            size="sm"
            block
            onPress={() => {
              update({ onboarded: true })
              router.replace('/(tabs)')
            }}
          >
            Skip setup
          </Button>
          <T variant="caption" color="muted" center>
            No account. Nothing leaves your phone unless you show it.
          </T>
        </View>
      </View>
    </ScrollView>
  )
}
