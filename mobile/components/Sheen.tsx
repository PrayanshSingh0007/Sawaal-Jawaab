import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useApp } from '../state/AppState'

/**
 * A band of light travelling across a surface.
 *
 * Once on arrival, it reads as the object catching the light as it settles.
 * On a loop it keeps a large surface quietly alive. Either way it is a
 * transform on a single layer, and it does not exist at all under reduced
 * motion.
 */
export function Sheen({
  width,
  delay = 260,
  loop = false,
  duration = 1100,
  strength = 0.5,
}: {
  /** How far the band has to travel — usually the surface's width. */
  width: number
  delay?: number
  loop?: boolean
  duration?: number
  strength?: number
}) {
  const { reduceMotion } = useApp()
  const progress = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion || width <= 0) return
    const run = withTiming(1, { duration, easing: Easing.bezier(0.32, 0.72, 0, 1) })
    progress.value = 0
    progress.value = withDelay(delay, loop ? withRepeat(run, -1, false) : run)
    return () => cancelAnimation(progress)
  }, [reduceMotion, width, delay, loop, duration, progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value === 0 || progress.value === 1 ? 0 : strength,
    transform: [{ translateX: -width * 0.6 + progress.value * width * 1.6 }, { rotate: '18deg' }],
  }))

  if (reduceMotion) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { width: width * 0.45, left: 0 },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  )
}
