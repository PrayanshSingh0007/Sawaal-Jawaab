import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { space } from '../theme/tokens'
import { ProgressiveBlur } from './ProgressiveBlur'

/**
 * The page container.
 *
 * Mobile-first with a reading column that stays comfortable on a tablet — the
 * app centres rather than stretching, because this is a communication tool and
 * not a dashboard.
 *
 * A `header` is pinned above the scroll and the content passes beneath it
 * through a blur that fades out rather than ending at a line. The back button
 * therefore stays reachable no matter how far down someone has scrolled, which
 * is the whole reason to pin it.
 */
export function Screen({
  children,
  header,
  scroll = true,
  padded = true,
  bottomInset = 0,
}: {
  children: ReactNode
  /** Pinned above the content, over glass. */
  header?: ReactNode
  scroll?: boolean
  padded?: boolean
  /** Extra room for a floating tab bar. */
  bottomInset?: number
}) {
  const insets = useSafeAreaInsets()
  const [headerHeight, setHeaderHeight] = useState(0)
  const padX = padded ? space[5] : 0

  const column = (
    <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1 }}>{children}</View>
  )

  const pinned = header ? (
    <View
      onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
      pointerEvents="box-none"
    >
      <ProgressiveBlur height={insets.top + 76} intensity={46} />
      <View
        style={{
          paddingTop: insets.top + space[2],
          paddingHorizontal: padX,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }}
      >
        {header}
      </View>
    </View>
  ) : null

  // Clearance so content rests below the header rather than touching it; it
  // still travels under the glass on the way up.
  const topPad = header
    ? Math.max(headerHeight, insets.top + 68) + space[3]
    : insets.top + space[3]

  if (!scroll) {
    return (
      <View style={{ flex: 1 }}>
        {pinned}
        <View
          style={{
            flex: 1,
            paddingHorizontal: padX,
            paddingTop: topPad,
            paddingBottom: insets.bottom + space[4] + bottomInset,
          }}
        >
          {column}
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {pinned}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: padX,
          paddingTop: topPad,
          paddingBottom: insets.bottom + space[7] + bottomInset,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        scrollIndicatorInsets={{ top: topPad }}
      >
        {column}
      </ScrollView>
    </View>
  )
}
