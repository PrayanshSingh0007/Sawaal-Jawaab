import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color, radius as R, space } from '../theme/tokens'
import { T } from './Type'
import { Icon } from './Icon'

export function Toast({ message }: { message: string }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 110,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          maxWidth: '90%',
          paddingVertical: space[3],
          paddingHorizontal: space[5],
          borderRadius: R.pill,
          backgroundColor: color.pillDark,
          boxShadow: '0 28px 60px -18px rgba(120,104,92,0.38)',
        }}
      >
        <Icon name="check" size={18} strokeWidth={2.4} color="#F7F4F0" />
        <T variant="label" style={{ color: '#F7F4F0', flexShrink: 1 }}>
          {message}
        </T>
      </View>
    </View>
  )
}
