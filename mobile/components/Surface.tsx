import { useState } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { Sheen } from './Sheen'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { T } from './Type'
import { Icon } from './Icon'

/* ── Card ──────────────────────────────────────────────────────────────── */

export function Card({
  children,
  tile,
  lift,
  style,
}: {
  children: ReactNode
  tile?: boolean
  lift?: boolean
  style?: object
}) {
  const { elevation } = useApp()
  return (
    <View
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: tile ? R.tile : R.card,
          padding: tile ? space[5] : space[6],
          boxShadow: `${lift ? elevation.e2 : elevation.e1}, ${elevation.rim}`,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

/** The one big statement on a screen. Used at most once per screen. */
export function Hero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  const { elevation, settings } = useApp()
  const [width, setWidth] = useState(0)
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        borderRadius: R.sheet,
        overflow: 'hidden',
        boxShadow: `${elevation.e2}, ${elevation.rim}`,
      }}
    >
      <LinearGradient
        colors={
          settings.highContrast
            ? [color.surface, color.surface]
            : [color.surface, color.canvasLift, '#EFECE7']
        }
        locations={[0, 0.62, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ padding: space[6], paddingTop: space[7] }}
      >
        {/* Warm light pooling in the corner — the one place accent appears as
            atmosphere rather than as a control. */}
        {settings.highContrast ? null : (
          <View
            style={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220 }}
            pointerEvents="none"
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id="heroBloom" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={color.accent} stopOpacity="0.34" />
                  <Stop offset="0.55" stopColor={color.accent} stopOpacity="0.12" />
                  <Stop offset="1" stopColor={color.accent} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="100" fill="url(#heroBloom)" />
            </Svg>
          </View>
        )}
        {eyebrow ? (
          <T variant="eyebrow" color="accent" style={{ marginBottom: space[3] }}>
            {eyebrow}
          </T>
        ) : null}
        <T variant="display">{title}</T>
        {subtitle ? (
          <T variant="body" color="muted" style={{ marginTop: space[3], maxWidth: 320 }}>
            {subtitle}
          </T>
        ) : null}
        {children ? <View style={{ marginTop: space[6] }}>{children}</View> : null}
      </LinearGradient>
      {settings.highContrast ? null : (
        <Sheen width={width} delay={700} duration={2600} loop strength={0.28} />
      )}
    </View>
  )
}

/* ── Tag ───────────────────────────────────────────────────────────────── */

export function Tag({
  children,
  tone = 'default',
  icon,
}: {
  children: ReactNode
  tone?: 'default' | 'accent' | 'outline'
  icon?: string
}) {
  const { elevation } = useApp()
  const bg =
    tone === 'accent' ? color.accentSoft : tone === 'outline' ? 'transparent' : color.surfaceSunk
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: R.pill,
        backgroundColor: bg,
        ...(tone === 'outline' ? { boxShadow: elevation.rim === 'none' ? 'none' : `inset 0 0 0 1px ${color.hairline}` } : null),
      }}
    >
      {icon ? <Icon name={icon} size={13} strokeWidth={2} color={tone === 'accent' ? color.accentInk : color.ink2} /> : null}
      <T variant="caption" color={tone === 'accent' ? 'accent' : 'muted'} style={{ fontWeight: '600' }}>
        {children}
      </T>
    </View>
  )
}

/* ── Banner ────────────────────────────────────────────────────────────── */

/** Explains what happened and what still works. Never an apology. */
export function Banner({
  children,
  icon = 'info',
  tone = 'default',
}: {
  children: ReactNode
  icon?: string
  tone?: 'default' | 'accent'
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space[3],
        padding: space[4],
        paddingHorizontal: space[5],
        borderRadius: R.tile,
        backgroundColor: tone === 'accent' ? color.accentSoft : color.canvasLift,
      }}
    >
      <Icon name={icon} size={18} color={tone === 'accent' ? color.accentInk : color.ink2} />
      <T variant="label" color={tone === 'accent' ? 'accent' : 'muted'} style={{ flex: 1, fontWeight: '400' }}>
        {children}
      </T>
    </View>
  )
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string
  title: string
  body: string
  action?: ReactNode
}) {
  const { elevation } = useApp()
  return (
    <View style={{ alignItems: 'center', gap: space[4], paddingVertical: space[8] }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: R.card,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.canvasLift,
          boxShadow: elevation.sunk,
        }}
      >
        <Icon name={icon} size={36} strokeWidth={1.6} color={color.ink2} />
      </View>
      <T variant="h2" center>
        {title}
      </T>
      <T variant="body" color="muted" center style={{ maxWidth: 300 }}>
        {body}
      </T>
      {action}
    </View>
  )
}

/* ── AI disclosure ─────────────────────────────────────────────────────── */

/** Small, honest disclosure that a model wrote the text on screen. */
export function AiNote({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <Icon name="sparkle" size={14} strokeWidth={1.9} color={color.ink2} />
      <T variant="caption" color="muted" style={{ flex: 1 }}>
        {children}
      </T>
    </View>
  )
}
