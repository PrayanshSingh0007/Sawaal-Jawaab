import { useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { useFlow } from '../../state/FlowState'
import { companionLink, counterUrlConfigured } from '../../lib/handoff'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { Group, LinkRow } from '../../components/Controls'
import { Card } from '../../components/Surface'
import { LogoMark, Wordmark } from '../../components/Logo'
import { T } from '../../components/Type'
import { TAB_BAR_HEIGHT } from '../../components/TabBar'

/** The fourth tab: everything that isn't the ask journey itself. */
export default function More() {
  const { showToast } = useApp()
  const { question, handoff, openHandoff } = useFlow()
  const [link, setLink] = useState<string | null>(null)

  const inviteHelper = async () => {
    const h = handoff ?? openHandoff(question || 'I want to ask something.')
    const url = companionLink(h)
    setLink(url)
    await Clipboard.setStringAsync(url)
    showToast('Link copied. It works for 60 minutes.')
  }

  return (
    <Screen
      bottomInset={TAB_BAR_HEIGHT}
      header={<TopBar title="More" onBack={() => router.replace('/(tabs)')} backLabel="Back to Ask" />}
    >
      <View style={{ gap: space[5] }}>
        <Group title="Get ready">
          <LinkRow
            icon="ask"
            title="Practice a conversation"
            subtitle="Rehearse the bank, the doctor or a ticket counter."
            onPress={() => router.push('/practice')}
          />
          <LinkRow
            icon="heart"
            title="Emergency card"
            subtitle="Your details, ready for someone helping you."
            onPress={() => router.push('/emergency')}
          />
          <LinkRow
            icon="user"
            title="Ask family to help"
            subtitle="Send a link so someone you trust can suggest words."
            onPress={() => void inviteHelper()}
          />
        </Group>

        {link ? (
          <Card tile style={{ gap: space[3] }}>
            <T variant="label">Helper link</T>
            <T variant="caption" color="muted">
              {link}
            </T>
            <T variant="caption" color="muted">
              {counterUrlConfigured
                ? 'Expires in 60 minutes. Nothing else is shared.'
                : 'Set EXPO_PUBLIC_COUNTER_URL to your deployed web page so this link opens for them.'}
            </T>
          </Card>
        ) : null}

        <Group title="This app">
          <LinkRow
            icon="settings"
            title="Settings"
            subtitle="Text size, contrast, reading aloud, language."
            onPress={() => router.push('/settings')}
          />
          <LinkRow
            icon="packs"
            title="Situation packs"
            subtitle="Ready-made phrases that work offline."
            onPress={() => router.push('/packs')}
          />
          <LinkRow
            icon="history"
            title="History"
            subtitle="Questions you asked and the replies you got."
            onPress={() => router.push('/history')}
          />
        </Group>

        <Card style={{ alignItems: 'center', gap: space[4] }}>
          <LogoMark size={40} />
          <Wordmark size={24} />
          <T variant="body" color="muted" center style={{ maxWidth: 300 }}>
            When speaking is difficult, communication shouldn’t stop.
          </T>
        </Card>
      </View>
    </Screen>
  )
}
