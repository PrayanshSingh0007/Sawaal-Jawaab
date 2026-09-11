import { useEffect } from 'react'
import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Rect, Stop, Circle } from 'react-native-svg'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, cancelAnimation } from 'react-native-reanimated'
import { color } from '../theme/tokens'
import { useApp } from '../state/AppState'

/**
 * A question card, and an answer coming back to it.
 *
 * Built from the same ceramic surfaces as the rest of the interface, so it
 * belongs to the product rather than sitting on top of it.
 */
export function WelcomeArt() {
  const { reduceMotion } = useApp()
  const float = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(float)
      float.value = 0
      return
    }
    float.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }), -1, true)
    return () => cancelAnimation(float)
  }, [reduceMotion, float])

  const askStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * -8 }] }))
  const replyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * -11 }] }))

  return (
    <View style={{ width: 280, height: 200 }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 210" fill="none" style={{ position: 'absolute' }}>
        <Path
          d="M78 150c26 34 118 34 146-6"
          stroke={color.accent}
          strokeOpacity={0.4}
          strokeWidth={2}
          strokeDasharray="4 7"
          strokeLinecap="round"
        />
      </Svg>

      <Animated.View style={[{ position: 'absolute', right: 0, top: 10 }, replyStyle]}>
        <Svg width={110} height={92} viewBox="0 0 110 92" fill="none">
          <Rect x="3" y="3" width="104" height="80" rx="22" fill="#FCFBF9" />
          <Rect x="21" y="25" width="52" height="8" rx="4" fill="#DCD6CE" />
          <Rect x="21" y="41" width="68" height="8" rx="4" fill="#E6E2DC" />
          <Circle cx="27" cy="65" r="7" fill={color.accentSoft} />
          <Path d="M24 65.2l2.2 2.2 4-4.4" stroke={color.accentDeep} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', left: 6, top: 48 }, askStyle]}>
        <Svg width={160} height={122} viewBox="0 0 160 122" fill="none">
          <Defs>
            <LinearGradient id="sjHot" x1="0" y1="0" x2="1" y2="1">
              <Stop stopColor="#F8764A" />
              <Stop offset="1" stopColor={color.accentDeep} />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="4" width="150" height="112" rx="28" fill="#FCFBF9" />
          <Rect x="26" y="32" width="94" height="11" rx="5.5" fill="#CFC8BF" />
          <Rect x="26" y="51" width="70" height="11" rx="5.5" fill="#DED9D1" />
          <Rect x="26" y="74" width="58" height="26" rx="13" fill="url(#sjHot)" />
          <Path d="M38 87h14" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M47 82.5l4.5 4.5-4.5 4.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </View>
  )
}
