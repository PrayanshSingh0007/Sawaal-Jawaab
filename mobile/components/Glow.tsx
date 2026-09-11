import { useEffect } from 'react'
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

/**
 * A slow warm breath of light behind an object, so it reads as lifted off the
 * surface rather than pasted onto it. Used once, behind the shown question.
 */
export function Glow({ size = 340, tint = color.accent }: { size?: number; tint?: string }) {
  const { reduceMotion, settings } = useApp()
  const pulse = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(pulse)
      pulse.value = 0.5
      return
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    )
    return () => cancelAnimation(pulse)
  }, [reduceMotion, pulse])

  const style = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.4,
    transform: [{ scale: 0.94 + pulse.value * 0.18 }],
  }))

  if (settings.highContrast) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: '50%', marginLeft: -size / 2, bottom: -size * 0.35, width: size, height: size * 0.6 },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 60">
        <Defs>
          <RadialGradient id="showGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={tint} stopOpacity="0.72" />
            <Stop offset="1" stopColor={tint} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="60" fill="url(#showGlow)" />
      </Svg>
    </Animated.View>
  )
}
