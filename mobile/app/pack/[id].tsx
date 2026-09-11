import { View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { useFlow } from '../../state/FlowState'
import { packById } from '../../data/packs'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { PhraseCard } from '../../components/Controls'
import { EmptyState, Tag } from '../../components/Surface'
import { Button } from '../../components/Button'
import { T } from '../../components/Type'
import { Icon } from '../../components/Icon'
import { color, radius as R } from '../../theme/tokens'

/** Twelve phrases. Tapping one drops it straight into the flow. */
export default function PackDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const pack = id ? packById(id) : undefined
  const { startFrom, recordUse } = useFlow()
  const { elevation } = useApp()

  if (!pack) {
    return (
      <Screen>
        <TopBar title="Pack" onBack={() => router.replace('/packs')} />
        <EmptyState
          icon="packs"
          title="Pack not found"
          body="That pack is not here any more. All the other packs still work."
          action={
            <Button variant="dark" icon="packs" onPress={() => router.replace('/packs')}>
              See all packs
            </Button>
          }
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <TopBar title={pack.title} backLabel="Back to packs" />
      <View style={{ gap: space[5] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: R.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.canvasLift,
              boxShadow: elevation.sunk,
            }}
          >
            <Icon name={pack.icon} size={26} strokeWidth={1.8} color={color.ink2} />
          </View>
          <View style={{ flex: 1, gap: space[2] }}>
            <T variant="body" color="muted">
              {pack.description}
            </T>
            <Tag>{`${pack.phrases.length} phrases`}</Tag>
          </View>
        </View>

        <View style={{ gap: space[3] }}>
          {pack.phrases.map((phrase) => (
            <PhraseCard
              key={phrase.text}
              text={phrase.text}
              category={phrase.category}
              actionLabel="Show this phrase"
              onPress={() => {
                startFrom(phrase.text, pack.id)
                void recordUse(phrase.text, pack.id)
                router.push('/show')
              }}
            />
          ))}
        </View>
      </View>
    </Screen>
  )
}
