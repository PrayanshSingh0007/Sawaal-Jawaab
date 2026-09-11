import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { color, radius as R, space, TAP } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { T } from './Type'
import { Icon } from './Icon'

type Variant = 'dark' | 'accent' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  children: string
  onPress: () => void
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: string
  iconAfter?: string
  disabled?: boolean
  style?: object
}

const HEIGHT: Record<Size, number> = { sm: 44, md: TAP, lg: 68 }

/** Snappy, slightly overshooting — a real object being pushed and let go. */
const SPRING = { damping: 17, stiffness: 340, mass: 0.6 } as const

/** Scale that springs on touch, shared by every pressable surface. */
export function usePressSpring(to = 0.96) {
  const { reduceMotion } = useApp()
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return {
    style,
    onPressIn: () => {
      if (!reduceMotion) scale.value = withSpring(to, SPRING)
    },
    onPressOut: () => {
      if (!reduceMotion) scale.value = withSpring(1, SPRING)
    },
  }
}

/**
 * Every button in the app is this button.
 *
 * Raised at rest, sunk and slightly smaller when pressed — the same physical
 * behaviour as the web build, at the same 120ms.
 */
export function Button({
  children,
  onPress,
  variant = 'ghost',
  size = 'md',
  block,
  icon,
  iconAfter,
  disabled,
  style,
}: ButtonProps) {
  const { elevation, t, tap } = useApp()
  const press = usePressSpring(0.965)
  const iconSize = size === 'lg' ? 24 : 20
  const fontSize = size === 'sm' ? t.label : size === 'lg' ? t.h2 : t.body
  // 700 at these sizes keeps white-on-accent above the large-text threshold.
  const fontFamily = size === 'lg' || variant === 'accent' ? 'Inter_700Bold' : 'Inter_600SemiBold'

  const label = disabled
    ? color.ink2
    : variant === 'accent'
      ? '#FFFFFF'
      : variant === 'dark'
        ? '#F7F4F0'
        : variant === 'quiet'
          ? color.ink2
          : color.ink

  const body = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[3],
        minHeight: HEIGHT[size],
        paddingHorizontal: size === 'sm' ? space[4] : space[6],
        paddingVertical: space[3],
      }}
    >
      {icon ? <Icon name={icon} size={iconSize} color={label} /> : null}
      <T
        variant="body"
        style={{ fontFamily, fontSize, lineHeight: Math.round(fontSize * 1.25), color: label, textAlign: 'center' }}
      >
        {children}
      </T>
      {iconAfter ? <Icon name={iconAfter} size={iconSize} color={label} /> : null}
    </View>
  )

  return (
    <Animated.View
      style={[
        { alignSelf: block ? 'stretch' : 'flex-start', maxWidth: '100%' },
        disabled ? null : press.style,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => {
          tap(variant === 'accent' ? 'success' : 'light')
          onPress()
        }}
        style={({ pressed }) => ({
          borderRadius: R.pill,
          overflow: 'hidden',
          ...surfaceFor(variant, pressed, disabled, elevation),
        })}
      >
        {({ pressed }) =>
          variant === 'accent' && !disabled ? (
            <LinearGradient
              // The light end is capped so white text stays above 3:1 everywhere.
              colors={pressed ? ['#D8531F', color.accentDeep] : ['#F26A34', color.accent, color.accentDeep]}
              locations={pressed ? [0, 1] : [0, 0.46, 1]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            >
              {body()}
            </LinearGradient>
          ) : (
            body()
          )
        }
      </Pressable>
    </Animated.View>
  )
}

function surfaceFor(
  variant: Variant,
  pressed: boolean,
  disabled: boolean | undefined,
  elevation: { e1: string; sunk: string; hot: string; dark: string; rim: string },
) {
  // A disabled control looks inert and pressed-in rather than a faded version
  // of itself — nothing here relies on opacity.
  if (disabled) return { backgroundColor: color.surfaceSunk, boxShadow: elevation.sunk }
  switch (variant) {
    case 'dark':
      return {
        backgroundColor: pressed ? '#171512' : color.pillDark,
        boxShadow: pressed ? 'inset 3px 3px 8px rgba(0,0,0,0.45)' : elevation.dark,
      }
    case 'accent':
      return { boxShadow: pressed ? 'none' : elevation.hot }
    case 'quiet':
      return { backgroundColor: pressed ? 'rgba(26,23,20,0.05)' : 'transparent' }
    default:
      return {
        backgroundColor: pressed ? color.surfaceSunk : color.surface,
        boxShadow: pressed ? elevation.sunk : `${elevation.e1}, ${elevation.rim}`,
      }
  }
}

/* ── Icon button ───────────────────────────────────────────────────────── */

export interface IconButtonProps {
  /** Required: an icon-only control still announces itself. */
  label: string
  icon: string
  onPress: () => void
  tone?: 'plain' | 'accent' | 'night'
  size?: number
  disabled?: boolean
}

export function IconButton({ label, icon, onPress, tone = 'plain', size = 22, disabled }: IconButtonProps) {
  const { elevation, tap } = useApp()
  const press = usePressSpring(0.92)
  return (
    <Animated.View style={press.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        tap()
        onPress()
      }}
      style={({ pressed }) => ({
        width: TAP,
        height: TAP,
        borderRadius: TAP / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor:
          tone === 'night'
            ? 'rgba(255,255,255,0.1)'
            : tone === 'accent'
              ? color.accent
              : pressed
                ? color.surfaceSunk
                : color.surface,
        boxShadow:
          tone === 'night'
            ? 'inset 0 0 0 1px rgba(255,255,255,0.22)'
            : tone === 'accent'
              ? elevation.hot
              : pressed
                ? elevation.sunk
                : `${elevation.e1}, ${elevation.rim}`,
      })}
    >
      <Icon
        name={icon}
        size={size}
        color={tone === 'accent' ? '#fff' : tone === 'night' ? color.nightInk : disabled ? color.ink2 : color.ink}
      />
    </Pressable>
    </Animated.View>
  )
}
