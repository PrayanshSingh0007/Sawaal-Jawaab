import { Pressable, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { router } from 'expo-router'
import { color, radius as R, space } from '../../theme/tokens'
import { useApp } from '../../state/AppState'
import { PACKS } from '../../data/packs'
import { Screen } from '../../components/Screen'
import { TopBar } from '../../components/TopBar'
import { Tag } from '../../components/Surface'
import { T } from '../../components/Type'
import { Icon } from '../../components/Icon'
import { Rise } from '../../components/Motion'
import { usePressSpring } from '../../components/Button'
import { TAB_BAR_HEIGHT } from '../../components/TabBar'

/** One pack card. Its own icon, very faint and oversized, gives the card an
 *  identity without introducing a second colour to the palette. */
function PackCard({
  pack,
  onPress,
}: {
  pack: (typeof PACKS)[number]
  onPress: () => void
}) {
  const { elevation, tap } = useApp()
  const press = usePressSpring(0.97)
  return (
    <Animated.View style={press.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pack.title}. ${pack.description}`}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        tap()
        onPress()
      }}
      style={({ pressed }) => ({
        minHeight: 180,
        gap: space[3],
        padding: space[5],
        borderRadius: R.card,
        overflow: 'hidden',
        backgroundColor: pressed ? color.surfaceSunk : color.surface,
        boxShadow: pressed ? elevation.sunk : `${elevation.e1}, ${elevation.rim}`,
      })}
    >
      <View style={{ position: 'absolute', right: -18, bottom: -14, opacity: 0.05 }} pointerEvents="none">
        <Icon name={pack.icon} size={112} strokeWidth={1.2} color={color.ink} />
      </View>
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
      <T variant="body" style={{ fontFamily: 'Inter_600SemiBold' }}>
        {pack.title}
      </T>
      <T variant="label" color="muted" style={{ fontFamily: 'Inter_400Regular' }}>
        {pack.description}
      </T>
      <View style={{ marginTop: 'auto' }}>
        <Tag tone={pack.id === 'emergency' ? 'accent' : 'default'}>{pack.tag}</Tag>
      </View>
    </Pressable>
    </Animated.View>
  )
}

/** Ready-made phrases for the places people actually go. Works offline. */
export default function Packs() {
  return (
    <Screen
      bottomInset={TAB_BAR_HEIGHT}
      header={
        <TopBar title="Situation packs" onBack={() => router.replace('/(tabs)')} backLabel="Back to Ask" />
      }
    >
      <View style={{ gap: space[5] }}>
        <T variant="body" color="muted" style={{ maxWidth: 380 }}>
          Phrases you can show straight away. All of them work with no internet.
        </T>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[4] }}>
          {PACKS.map((pack, i) => (
            <Rise key={pack.id} delay={60 + i * 45} style={{ flexGrow: 1, flexBasis: 150 }}>
              <PackCard pack={pack} onPress={() => router.push(`/pack/${pack.id}`)} />
            </Rise>
          ))}
        </View>
      </View>
    </Screen>
  )
}
