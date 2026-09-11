import { useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { eraseEverything } from '../lib/store'
import { LANGUAGES } from '../data/languages'
import { Screen } from '../components/Screen'
import { TopBar } from '../components/TopBar'
import { Group, LinkRow, Segmented, ToggleRow } from '../components/Controls'
import { Card } from '../components/Surface'
import { Button } from '../components/Button'
import { Sheet } from '../components/Sheet'
import { LanguagePicker } from '../components/LanguagePicker'
import { TextSizePicker, SIZES } from './onboarding/size'
import { T } from '../components/Type'

export default function SettingsScreen() {
  const { settings, update, resetSettings, showToast, announce, say } = useApp()
  const { refresh, clearDraft } = useFlow()
  const [confirmErase, setConfirmErase] = useState(false)

  const scaleLabel = SIZES.find((s) => s.value === settings.textScale)?.label ?? 'Normal'
  const langLabel = LANGUAGES.find((l) => l.code === settings.language)?.native ?? 'English'

  return (
    <Screen
      header={<TopBar title="Settings" backLabel="Back" />}
    >
      <View style={{ gap: space[5] }}>
        <Group title="Reading">
          <View style={{ paddingHorizontal: space[5], paddingBottom: space[5], gap: space[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <T variant="body" style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }}>
                Text size
              </T>
              <T variant="label" color="muted">
                {scaleLabel}
              </T>
            </View>
            <TextSizePicker />
            <T variant="caption" color="muted">
              Everything grows together, so nothing gets cut off.
            </T>
          </View>

          <ToggleRow
            icon="contrast"
            title="High contrast"
            subtitle="Stronger edges and pure black text."
            value={settings.highContrast}
            onChange={(v) => update({ highContrast: v })}
          />
          <ToggleRow
            icon="motion"
            title="Reduce motion"
            subtitle="Turn off movement between screens."
            value={settings.reduceMotion === true}
            onChange={(v) => update({ reduceMotion: v ? true : null })}
          />
        </Group>

        <Group title="Sound">
          <ToggleRow
            icon="speaker"
            title="Read everything aloud"
            subtitle="Speak choices as you move around."
            value={settings.readAloudAll}
            onChange={(v) => {
              update({ readAloudAll: v })
              if (v) say('Reading aloud is on.')
            }}
          />
          <View style={{ paddingHorizontal: space[5], paddingBottom: space[5], gap: space[3] }}>
            <T variant="body" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Reading speed
            </T>
            <Segmented
              label="Reading speed"
              options={[
                { value: '0.7', label: 'Slow' },
                { value: '1', label: 'Normal' },
                { value: '1.25', label: 'Fast' },
              ]}
              value={String(settings.speechRate)}
              onChange={(v) => {
                update({ speechRate: Number(v) })
                say('This is how fast I will read.', Number(v))
              }}
            />
          </View>
        </Group>

        <Group title="Words and pictures">
          <View style={{ paddingHorizontal: space[5], paddingBottom: space[5], gap: space[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <T variant="body" style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }}>
                Language
              </T>
              <T variant="label" color="muted">
                {langLabel}
              </T>
            </View>
            <LanguagePicker value={settings.language} onChange={(code) => update({ language: code })} />
          </View>
          <View style={{ paddingHorizontal: space[5], paddingBottom: space[5], gap: space[3] }}>
            <T variant="body" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Symbol set
            </T>
            <Segmented
              label="Symbol set"
              options={[
                { value: 'line', label: 'Outline' },
                { value: 'solid', label: 'Bold' },
              ]}
              value={settings.symbolSet}
              onChange={(v) => update({ symbolSet: v })}
            />
          </View>
        </Group>

        <Group title="Your data">
          <LinkRow
            icon="trash"
            title="Delete all data"
            subtitle="Removes your history, phrases and emergency card from this device."
            onPress={() => setConfirmErase(true)}
            danger
          />
        </Group>

        <Card tile>
          <T variant="caption" color="muted">
            Everything you write stays on this device. Nothing is sent anywhere unless you show a
            question or open a helper link. Your emergency card never leaves this phone.
          </T>
        </Card>
      </View>

      <Sheet open={confirmErase} onClose={() => setConfirmErase(false)} title="Delete everything on this device?">
        <View style={{ gap: space[5] }}>
          <T variant="body" color="muted">
            Your history, saved phrases and emergency card will be removed from this device. This
            cannot be undone.
          </T>
          <Button
            variant="accent"
            size="lg"
            block
            icon="trash"
            onPress={() => {
              void (async () => {
                await eraseEverything()
                clearDraft()
                resetSettings()
                await refresh()
                setConfirmErase(false)
                showToast('Everything on this device is deleted.')
                announce('All your data has been deleted from this device.')
                router.replace('/(tabs)')
              })()
            }}
          >
            Yes, delete everything
          </Button>
          <Button variant="quiet" size="lg" block onPress={() => setConfirmErase(false)}>
            Keep my data
          </Button>
        </View>
      </Sheet>
    </Screen>
  )
}
