import { useMemo, useState } from 'react'
import { TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space, TAP } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { useFlow } from '../../state/FlowState'
import { deleteExchange } from '../../lib/store'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { Card, EmptyState, Tag } from '../../components/Surface'
import { Button, IconButton } from '../../components/Button'
import { T } from '../../components/Type'
import { Icon } from '../../components/Icon'
import { TAB_BAR_HEIGHT } from '../../components/TabBar'

function when(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time}`
}

export default function History() {
  const { exchanges, startFrom, refresh, receiveReply, recordUse } = useFlow()
  const { announce, elevation, t } = useApp()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return exchanges
    return exchanges.filter(
      (e) =>
        e.question.toLowerCase().includes(q) ||
        (e.reply ?? '').toLowerCase().includes(q) ||
        (e.action ?? '').toLowerCase().includes(q),
    )
  }, [exchanges, query])

  return (
    <Screen
      bottomInset={TAB_BAR_HEIGHT}
      header={<TopBar title="History" onBack={() => router.replace('/(tabs)')} backLabel="Back to Ask" />}
    >
      <View style={{ gap: space[5] }}>
        {exchanges.length > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[3],
              minHeight: TAP,
              paddingHorizontal: space[5],
              borderRadius: R.pill,
              backgroundColor: color.surfaceSunk,
              boxShadow: elevation.sunk,
            }}
          >
            <Icon name="search" size={20} color={color.ink2} />
            <TextInput
              accessibilityLabel="Search your questions"
              value={query}
              onChangeText={setQuery}
              placeholder="Search questions and replies"
              placeholderTextColor={color.ink2}
              style={{
                flex: 1,
                minHeight: TAP,
                fontFamily: 'Inter_400Regular',
                fontSize: t.body,
                color: color.ink,
              }}
            />
          </View>
        ) : null}

        {exchanges.length === 0 ? (
          <EmptyState
            icon="history"
            title="Nothing here yet"
            body="Every question you show is kept on this device, with the reply beside it."
            action={
              <Button variant="dark" icon="ask" onPress={() => router.replace('/(tabs)')}>
                Ask something
              </Button>
            }
          />
        ) : null}

        {exchanges.length > 0 && results.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matches"
            body="Nothing matched those words. Try a shorter search."
          />
        ) : null}

        <View style={{ gap: space[4] }}>
          {results.map((e) => (
            <Card key={e.id} style={{ padding: space[5], gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <T variant="caption" color="muted" style={{ flex: 1 }}>
                  {when(e.createdAt)}
                </T>
                {e.place ? <Tag tone="outline">{e.place}</Tag> : null}
                <IconButton
                  icon="trash"
                  label={`Delete “${e.question}”`}
                  onPress={() => {
                    void deleteExchange(e.id).then(refresh)
                    announce('Deleted.')
                  }}
                />
              </View>

              <T variant="h2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {e.question}
              </T>

              {e.action ? <Tag tone="accent" icon="check">{e.action}</Tag> : null}

              <View
                style={{
                  flexDirection: 'row',
                  gap: space[3],
                  paddingTop: space[4],
                  boxShadow: `inset 0 1px 0 ${color.hairline}`,
                }}
              >
                <Icon name={e.reply ? 'ask' : 'info'} size={18} color={color.ink2} />
                <T variant="body" color="muted" style={{ flex: 1 }}>
                  {e.reply ? (e.simplified ?? e.reply) : 'No reply came back.'}
                </T>
              </View>

              <View style={{ flexDirection: 'row', gap: space[3], flexWrap: 'wrap' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="replay"
                  onPress={() => {
                    startFrom(e.question, e.packId)
                    void recordUse(e.question, e.packId)
                    router.push('/show')
                  }}
                >
                  Ask again
                </Button>
                {e.reply ? (
                  <Button
                    variant="quiet"
                    size="sm"
                    icon="forward"
                    onPress={() => {
                      startFrom(e.question, e.packId)
                      void receiveReply(e.reply as string)
                      router.push('/understand')
                    }}
                  >
                    Open reply
                  </Button>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  )
}
