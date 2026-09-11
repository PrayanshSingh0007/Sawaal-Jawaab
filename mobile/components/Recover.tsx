import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color } from '../theme/tokens'
import { T } from './Type'
import { Icon } from './Icon'

/**
 * What the person sees if something in the app breaks.
 *
 * A blank screen is the worst possible outcome here: someone is standing at a
 * counter needing to ask a question. So this says what happened in plain
 * words, says what still works, and offers the one button that fixes it.
 *
 * Deliberately built from nothing — plain views, system text, literal colours,
 * no context, no fonts, no tokens. Whatever failed, this still renders.
 */
export function Recover({ onRetry }: { onRetry: () => void }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#EDEAE5',
        paddingHorizontal: 20,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: '#FCE3D5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="hint" size={32} color="#A83C0E" />
      </View>

      <T variant="display">Something went wrong here</T>
      <T variant="body" color="muted">
        Your questions, your phrases and your emergency card are all still saved
        on this phone. Nothing has been lost.
      </T>

      <View
        style={{
          minHeight: 56,
          borderRadius: 999,
          backgroundColor: color.pillDark,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
        onTouchEnd={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Start again"
      >
        <T variant="body" style={{ color: '#F7F4F0', fontFamily: 'Inter_700Bold' }}>
          Start again
        </T>
      </View>
    </View>
  )
}
