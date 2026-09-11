import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { color, motion } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { Icon } from './Icon'

/** 72pt, always paired with a written label beside it. */
export function MicButton({
  recording,
  onPress,
  disabled,
}: {
  recording: boolean
  onPress: () => void
  disabled?: boolean
}) {
  const { elevation, reduceMotion, tap } = useApp()
  const ring = useSharedValue(0)

  useEffect(() => {
    if (recording && !reduceMotion) {
      ring.value = 0
      ring.value = withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.bezier(...motion.easing) }),
        -1,
        false,
      )
    } else {
      cancelAnimation(ring)
      ring.value = 0
    }
    return () => cancelAnimation(ring)
  }, [recording, reduceMotion, ring])

  // A slow breathing ring. No red dot: this is not a recording studio.
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - ring.value) * 0.55,
    transform: [{ scale: 0.92 + ring.value * 0.24 }],
  }))

  return (
    <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: 92,
            height: 92,
            borderRadius: 46,
            borderWidth: 2,
            borderColor: color.accent,
          },
          ringStyle,
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, selected: recording }}
        accessibilityLabel={recording ? 'Stop listening' : 'Speak your question'}
        disabled={disabled}
        onPress={() => {
          tap()
          onPress()
        }}
        style={({ pressed }) => ({
          width: 72,
          height: 72,
          borderRadius: 36,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.96 : 1 }],
          boxShadow: disabled ? elevation.sunk : elevation.hot,
        })}
      >
        <LinearGradient
          colors={
            disabled
              ? [color.surfaceSunk, color.surfaceSunk]
              : ['#F26A34', color.accent, color.accentDeep]
          }
          locations={[0, 0.46, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon
            name={recording ? 'pause' : 'mic'}
            size={30}
            strokeWidth={1.9}
            color={disabled ? color.ink2 : '#fff'}
          />
        </LinearGradient>
      </Pressable>
    </View>
  )
}
