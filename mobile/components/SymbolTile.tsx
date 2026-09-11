import { Pressable, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import type { SymbolDef } from '../lib/types'
import { T } from './Type'
import { Icon } from './Icon'
import { usePressSpring } from './Button'

/** Picture and word together — never a picture alone. */
export function SymbolTile({
  symbol,
  count,
  onPress,
}: {
  symbol: SymbolDef
  count: number
  onPress: () => void
}) {
  const { elevation, settings, tap } = useApp()
  const press = usePressSpring(0.93)
  const selected = count > 0
  return (
    <Animated.View style={[press.style, { flex: 1 }]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={selected ? `${symbol.label}, added ${count} times` : `Add ${symbol.label}`}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        tap('select')
        onPress()
      }}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 88,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[2],
        paddingHorizontal: 6,
        paddingVertical: space[3],
        borderRadius: R.tile,
        backgroundColor: selected ? '#FFFDFB' : color.surface,
        boxShadow: selected
          ? `${elevation.e2}, inset 0 0 0 2px ${color.accent}`
          : pressed
            ? elevation.sunk
            : `${elevation.e1}, ${elevation.rim}`,
      })}
    >
      <Icon
        name={symbol.icon}
        size={30}
        strokeWidth={settings.symbolSet === 'solid' ? 2.4 : 1.75}
        color={selected ? color.accentInk : color.ink2}
      />
      <T variant="caption" center style={{ fontFamily: 'Inter_600SemiBold' }}>
        {symbol.label}
      </T>
      {count > 1 ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color.accent,
          }}
        >
          <T variant="caption" color="white">
            {String(count)}
          </T>
        </View>
      ) : null}
    </Pressable>
    </Animated.View>
  )
}
