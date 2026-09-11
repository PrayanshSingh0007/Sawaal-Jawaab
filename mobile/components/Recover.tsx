import { Pressable, Text, View } from 'react-native'

/**
 * What the person sees if something in the app breaks.
 *
 * A blank screen is the worst possible outcome here: someone is standing at a
 * counter needing to ask a question. So this says what happened in plain
 * words, says what still works, and offers the one button that fixes it.
 *
 * It is built from nothing — plain views, system text, literal colours. No
 * context, no theme, no fonts, no icons. It renders *outside* the providers,
 * because whatever failed may be one of them, and a recovery screen that needs
 * the thing that broke is not a recovery screen.
 */
export function Recover({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#EDEAE5',
        paddingHorizontal: 24,
        paddingVertical: 64,
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{ fontSize: 32, fontWeight: '600', color: '#1A1714', lineHeight: 38 }}
      >
        Something went wrong here
      </Text>

      <Text style={{ fontSize: 17, lineHeight: 26, color: '#6B645C' }}>
        Your questions, your phrases and your emergency card are all still saved on this phone.
        Nothing has been lost.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start again"
        onPress={onRetry}
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          backgroundColor: pressed ? '#171512' : '#24211E',
        })}
      >
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#F7F4F0' }}>Start again</Text>
      </Pressable>
    </View>
  )
}
