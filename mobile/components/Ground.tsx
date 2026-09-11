import { useEffect } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { color } from '../theme/tokens'
import { useApp } from '../state/AppState'

/** One soft pool of light. Drawn as a radial gradient so it has no edge. */
function Bloom({ tint, opacity, size }: { tint: string; opacity: number; size: number }) {
  const id = `bloom-${tint.replace(/[^a-z0-9]/gi, '')}`
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={tint} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={tint} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={tint} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
    </Svg>
  )
}

/**
 * The ground: warm light falling across a ceramic surface — and slowly moving.
 *
 * Three pools of light drift on long, out-of-phase cycles, so the surface is
 * never quite the same twice without anything ever drawing attention to
 * itself. The motion is transform-only, which the compositor handles on its
 * own thread; nothing here re-renders.
 *
 * High contrast gets a flat white ground, and reduced motion holds the light
 * still.
 */
export function Ground() {
  const { settings, reduceMotion } = useApp()
  const { width, height } = useWindowDimensions()
  const drift = useSharedValue(0)
  const sway = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(drift)
      cancelAnimation(sway)
      drift.value = 0.5
      sway.value = 0.5
      return
    }
    drift.value = withRepeat(
      withTiming(1, { duration: 26000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    )
    sway.value = withRepeat(
      withTiming(1, { duration: 19000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    )
    return () => {
      cancelAnimation(drift)
      cancelAnimation(sway)
    }
  }, [reduceMotion, drift, sway])

  const warmStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -60 + drift.value * 120 },
      { translateY: -40 + sway.value * 70 },
      { scale: 0.95 + drift.value * 0.15 },
    ],
  }))

  const coolStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 70 - sway.value * 130 },
      { translateY: 50 - drift.value * 90 },
      { scale: 1.05 - sway.value * 0.12 },
    ],
  }))

  const lowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 40 - drift.value * 60 }, { scale: 1 + sway.value * 0.1 }],
  }))

  if (settings.highContrast) {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff' }]} pointerEvents="none" />
  }

  const big = Math.max(width, height) * 1.5

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: color.canvas, overflow: 'hidden' }]}
      pointerEvents="none"
    >
      {/* Key light, top-left. */}
      <Animated.View style={[{ position: 'absolute', top: -big * 0.45, left: -big * 0.3 }, warmStyle]}>
        <Bloom tint="#FFFFFF" opacity={0.95} size={big} />
      </Animated.View>

      {/* Warm accent bounce, top-right. */}
      <Animated.View style={[{ position: 'absolute', top: -big * 0.35, right: -big * 0.35 }, coolStyle]}>
        <Bloom tint={color.accentSoft} opacity={1} size={big} />
      </Animated.View>

      {/* The surface settling into shadow at the foot of the screen. */}
      <Animated.View style={[{ position: 'absolute', bottom: -big * 0.55, left: -big * 0.2 }, lowStyle]}>
        <Bloom tint="#96887C" opacity={0.22} size={big} />
      </Animated.View>
    </View>
  )
}
