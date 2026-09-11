import { ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { space } from '../theme/tokens'

/**
 * The page container.
 *
 * Mobile-first with a reading column that stays comfortable on a tablet — the
 * app centres rather than stretching, because this is a communication tool and
 * not a dashboard.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  bottomInset = 0,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /** Extra room for a floating tab bar. */
  bottomInset?: number
}) {
  const insets = useSafeAreaInsets()
  const inner = (
    <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1 }}>{children}</View>
  )

  if (!scroll) {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: padded ? space[5] : 0,
          paddingTop: insets.top + space[3],
          paddingBottom: insets.bottom + space[4] + bottomInset,
        }}
      >
        {inner}
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: padded ? space[5] : 0,
        paddingTop: insets.top + space[3],
        paddingBottom: insets.bottom + space[7] + bottomInset,
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {inner}
    </ScrollView>
  )
}
