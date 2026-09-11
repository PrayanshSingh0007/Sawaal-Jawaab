import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { color, motion, radius as R, space, TAP } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { Glass } from './Glass'
import { T } from './Type'
import { Icon } from './Icon'

/** The icon of the destination you just arrived at gives a small kick. */
function TabIcon({ name, active, color: tint }: { name: string; active: boolean; color: string }) {
  const { reduceMotion } = useApp()
  const pop = useSharedValue(1)

  useEffect(() => {
    if (!active || reduceMotion) return
    pop.value = withSequence(
      withTiming(1.18, { duration: 130 }),
      withSpring(1, { damping: 12, stiffness: 320, mass: 0.5 }),
    )
  }, [active, reduceMotion, pop])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }))

  return (
    <Animated.View style={style}>
      <Icon name={name} size={22} strokeWidth={active ? 2 : 1.75} color={tint} />
    </Animated.View>
  )
}

const TABS = [
  { path: '/', label: 'Ask', icon: 'ask' },
  { path: '/packs', label: 'Packs', icon: 'packs' },
  { path: '/history', label: 'History', icon: 'history' },
  { path: '/more', label: 'More', icon: 'more' },
] as const

export const TAB_BAR_HEIGHT = 76

/**
 * Four destinations, always labelled, floating on liquid glass.
 *
 * The active destination is one pill that flows to where you are going, rather
 * than four that blink on and off.
 */
export function TabBar() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const pathname = usePathname()
  const { elevation, reduceMotion, tap, settings } = useApp()
  const [width, setWidth] = useState(0)

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => (t.path === '/' ? pathname === '/' : pathname.startsWith(t.path))),
  )

  const slotWidth = width > 0 ? (width - 12 - 6) / TABS.length : 0
  const x = useSharedValue(0)

  useEffect(() => {
    const target = 6 + activeIndex * (slotWidth + 2)
    if (reduceMotion || x.value === 0) x.value = target
    else x.value = withTiming(target, { duration: 460, easing: Easing.bezier(...motion.easing) })
  }, [activeIndex, slotWidth, reduceMotion, x])

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + space[3],
        alignItems: 'center',
      }}
      pointerEvents="box-none"
    >
      <Glass
        radius={R.pill}
        style={{ width: '100%', maxWidth: 420, marginHorizontal: space[4] }}
      >
        <View
          accessibilityRole="tablist"
          style={{ flexDirection: 'row', padding: 6, gap: 2 }}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          {slotWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 6,
                  bottom: 6,
                  left: 0,
                  width: slotWidth,
                  borderRadius: R.pill,
                  backgroundColor: settings.highContrast ? color.ink : color.surface,
                  boxShadow: settings.highContrast ? 'none' : `${elevation.e1}, ${elevation.rim}`,
                },
                pillStyle,
              ]}
            />
          ) : null}

          {TABS.map((t, i) => {
            const active = i === activeIndex
            const fg = settings.highContrast && active ? '#fff' : active ? color.ink : color.ink2
            return (
              <Pressable
                key={t.path}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
                onPress={() => {
                  tap('select')
                  router.navigate(t.path as never)
                }}
                style={{
                  flex: 1,
                  minHeight: TAP,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  paddingVertical: 6,
                }}
              >
                <TabIcon
                  name={t.icon}
                  active={active}
                  color={active ? (settings.highContrast ? '#fff' : color.accentInk) : fg}
                />
                <T variant="caption" style={{ fontFamily: 'Inter_600SemiBold', color: fg }}>
                  {t.label}
                </T>
              </Pressable>
            )
          })}
        </View>
      </Glass>
    </View>
  )
}
