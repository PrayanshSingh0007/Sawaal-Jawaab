import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import type { ReactNode } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { color, radius as R, space, TAP } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { T } from './Type'
import { Icon } from './Icon'
import { usePressSpring } from './Button'

/* ── Segmented control ─────────────────────────────────────────────────── */

export interface Segment<T extends string> {
  value: T
  label: string
  icon?: string
}

/** A physical switch: the chosen segment is raised, the rest are sunk with it. */
export function Segmented<V extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Segment<V>[]
  value: V
  onChange: (value: V) => void
  label: string
}) {
  const { elevation, tap } = useApp()
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        padding: 5,
        borderRadius: R.pill,
        backgroundColor: color.surfaceSunk,
        boxShadow: elevation.sunk,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            onPress={() => {
              tap('select')
              onChange(opt.value)
            }}
            style={{
              flexGrow: 1,
              flexBasis: 'auto',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[2],
              minHeight: 48,
              paddingHorizontal: space[3],
              borderRadius: R.pill,
              backgroundColor: active ? color.surface : 'transparent',
              boxShadow: active ? `${elevation.e1}, ${elevation.rim}` : undefined,
            }}
          >
            {opt.icon ? (
              <Icon name={opt.icon} size={18} color={active ? color.accentInk : color.ink2} />
            ) : null}
            <T variant="label" color={active ? 'ink' : 'muted'}>
              {opt.label}
            </T>
          </Pressable>
        )
      })}
    </View>
  )
}

/* ── Phrase card ───────────────────────────────────────────────────────── */

export function PhraseCard({
  text,
  category,
  meta,
  onPress,
  actionLabel = 'Use this phrase',
}: {
  text: string
  category?: string
  meta?: string
  onPress: () => void
  actionLabel?: string
}) {
  const { elevation, tap } = useApp()
  const press = usePressSpring(0.975)
  return (
    <Animated.View style={press.style}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text}. ${actionLabel}`}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        tap()
        onPress()
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
        padding: space[5],
        borderRadius: R.tile,
        backgroundColor: pressed ? color.surfaceSunk : color.surface,
        boxShadow: pressed ? elevation.sunk : `${elevation.e1}, ${elevation.rim}`,
      })}
    >
      <View style={{ flex: 1, gap: space[2] }}>
        <T variant="body" style={{ fontFamily: 'Inter_500Medium' }}>
          {text}
        </T>
        {category || meta ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
            {category ? (
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: R.pill,
                  boxShadow: `inset 0 0 0 1px ${color.hairline}`,
                }}
              >
                <T variant="caption" color="muted">
                  {category}
                </T>
              </View>
            ) : null}
            {meta ? (
              <T variant="caption" color="muted">
                {meta}
              </T>
            ) : null}
          </View>
        ) : null}
      </View>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.canvasLift,
          boxShadow: elevation.e1,
        }}
      >
        <Icon name="forward" size={20} strokeWidth={2} color={color.accentInk} />
      </View>
    </Pressable>
    </Animated.View>
  )
}

/* ── Choice card ───────────────────────────────────────────────────────── */

export function ChoiceCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: string
  title: string
  subtitle: string
  selected: boolean
  onPress: () => void
}) {
  const { elevation, tap } = useApp()
  const press = usePressSpring(0.975)
  return (
    <Animated.View style={press.style}>
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${subtitle}`}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        tap('select')
        onPress()
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[5],
        padding: space[5],
        borderRadius: R.card,
        backgroundColor: selected ? '#FFFDFC' : color.surface,
        boxShadow: selected
          ? `${elevation.e2}, inset 0 0 0 2px ${color.accent}`
          : pressed
            ? elevation.sunk
            : `${elevation.e1}, ${elevation.rim}`,
      })}
    >
      <View style={{ width: 62, height: 62, borderRadius: R.tile, overflow: 'hidden' }}>
        {selected ? (
          <LinearGradient
            colors={['#F26A34', color.accent, color.accentDeep]}
            locations={[0, 0.46, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={icon} size={28} strokeWidth={1.8} color="#fff" />
          </LinearGradient>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.canvasLift,
              boxShadow: elevation.sunk,
            }}
          >
            <Icon name={icon} size={28} strokeWidth={1.8} color={color.ink2} />
          </View>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="h2" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {title}
        </T>
        <T variant="label" color="muted" style={{ fontFamily: 'Inter_400Regular' }}>
          {subtitle}
        </T>
      </View>
      {selected ? <Icon name="check" size={24} strokeWidth={2.4} color={color.accentInk} /> : null}
    </Pressable>
    </Animated.View>
  )
}

/* ── Action chip ───────────────────────────────────────────────────────── */

/**
 * The most important thing on the Understand screen: the one thing to do next.
 * Always carries the words "Do this", so the meaning never rests on colour.
 */
export function ActionChip({ text }: { text: string }) {
  const { elevation, reduceMotion } = useApp()
  const settle = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) return
    // The reply is read first; the action lands a beat later.
    settle.value = withSpring(1, { damping: 14, stiffness: 180, mass: 0.8 })
  }, [reduceMotion, settle])

  const style = useAnimatedStyle(() => ({
    opacity: settle.value,
    transform: [{ scale: 0.94 + settle.value * 0.06 }, { translateY: (1 - settle.value) * 12 }],
  }))

  return (
    <Animated.View
      style={[style, {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space[4],
        padding: space[5],
        borderRadius: R.card,
        backgroundColor: color.accentSoft,
        boxShadow: `${elevation.e2}, inset 0 0 0 1.5px rgba(242,98,46,0.35)`,
      }]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.accentDeep,
        }}
      >
        <Icon name="check" size={22} strokeWidth={2.4} color="#fff" />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <T variant="eyebrow" color="accent">
          Do this
        </T>
        <T variant="h2" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {text}
        </T>
      </View>
    </Animated.View>
  )
}

/* ── Setting rows ──────────────────────────────────────────────────────── */

export function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: string
  title: string
  subtitle?: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  const { elevation, tap } = useApp()
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      onPress={() => {
        tap('select')
        onChange(!value)
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
        minHeight: TAP,
        paddingVertical: space[4],
        paddingHorizontal: space[5],
      }}
    >
      <Icon name={icon} size={22} color={color.ink2} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="body" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {title}
        </T>
        {subtitle ? (
          <T variant="label" color="muted" style={{ fontFamily: 'Inter_400Regular' }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {/* State is carried by the word as well as the switch position. */}
      <T variant="label" color="muted">
        {value ? 'On' : 'Off'}
      </T>
      <View
        style={{
          width: 58,
          height: 34,
          borderRadius: 17,
          justifyContent: 'center',
          backgroundColor: value ? color.accent : color.surfaceSunk,
          boxShadow: value ? undefined : elevation.sunk,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            marginLeft: value ? 28 : 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color.surface,
            boxShadow: '0 2px 6px rgba(120,104,92,0.4)',
          }}
        >
          {value ? <Icon name="check" size={14} strokeWidth={3} color={color.accentInk} /> : null}
        </View>
      </View>
    </Pressable>
  )
}

export function LinkRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  danger,
}: {
  icon: string
  title: string
  subtitle?: string
  value?: string
  onPress: () => void
  danger?: boolean
}) {
  const { tap } = useApp()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      onPress={() => {
        tap()
        onPress()
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
        minHeight: TAP,
        paddingVertical: space[4],
        paddingHorizontal: space[5],
        backgroundColor: pressed ? 'rgba(26,23,20,0.04)' : 'transparent',
      })}
    >
      <Icon name={icon} size={22} color={danger ? color.warn : color.ink2} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="body" color={danger ? 'warn' : 'ink'} style={{ fontFamily: 'Inter_600SemiBold' }}>
          {title}
        </T>
        {subtitle ? (
          <T variant="label" color="muted" style={{ fontFamily: 'Inter_400Regular' }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {value ? (
        <T variant="label" color="muted">
          {value}
        </T>
      ) : null}
      <Icon name="forward" size={18} color={color.ink2} />
    </Pressable>
  )
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  const { elevation } = useApp()
  return (
    <View
      style={{
        borderRadius: R.card,
        overflow: 'hidden',
        backgroundColor: color.surface,
        boxShadow: `${elevation.e1}, ${elevation.rim}`,
      }}
    >
      <View style={{ padding: space[5], paddingBottom: space[3] }}>
        <T variant="eyebrow" color="muted">
          {title}
        </T>
      </View>
      <View style={{ paddingBottom: space[2] }}>{children}</View>
    </View>
  )
}
