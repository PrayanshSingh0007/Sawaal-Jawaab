import { useEffect } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { ViewStyle, StyleProp } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { motion } from '../theme/tokens'
import { useApp } from '../state/AppState'

const EASE = Easing.bezier(...motion.easing)

/**
 * Content arriving.
 *
 * Everything on a screen rises into place in sequence rather than appearing at
 * once — the difference between a page that loads and a room that lights up.
 * Under reduced motion it is a plain view: no delay, no movement, no wait.
 */
export function Rise({
  children,
  delay = 0,
  distance = 16,
  style,
}: {
  children: ReactNode
  delay?: number
  distance?: number
  style?: StyleProp<ViewStyle>
}) {
  const { reduceMotion } = useApp()
  const progress = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1
      return
    }
    progress.value = withDelay(delay, withTiming(1, { duration: 460, easing: EASE }))
  }, [delay, reduceMotion, progress])

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }))

  if (reduceMotion) return <View style={style}>{children}</View>
  return <Animated.View style={[style, animated]}>{children}</Animated.View>
}

/** Staggers a list of children so they arrive one after another. */
export function Stagger({
  children,
  step = 60,
  from = 0,
  style,
  itemStyle,
}: {
  children: ReactNode[]
  step?: number
  from?: number
  style?: StyleProp<ViewStyle>
  itemStyle?: StyleProp<ViewStyle>
}) {
  return (
    <View style={style}>
      {children.map((child, i) => (
        <Rise key={i} delay={from + i * step} style={itemStyle}>
          {child}
        </Rise>
      ))}
    </View>
  )
}
