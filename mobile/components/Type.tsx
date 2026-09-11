import { Text as RNText } from 'react-native'
import type { StyleProp, TextProps, TextStyle } from 'react-native'
import type { ReactNode } from 'react'
import { color as tone, weight } from '../theme/tokens'
import { useApp } from '../state/AppState'

type Variant = 'show' | 'display' | 'h1' | 'h2' | 'body' | 'label' | 'caption' | 'eyebrow'

const FACE: Record<Variant, { font: string; lineHeight: number; tracking: number }> = {
  show: { font: weight.semibold, lineHeight: 1.12, tracking: -1.4 },
  display: { font: weight.semibold, lineHeight: 1.12, tracking: -0.9 },
  h1: { font: weight.semibold, lineHeight: 1.22, tracking: -0.5 },
  h2: { font: weight.medium, lineHeight: 1.3, tracking: -0.2 },
  body: { font: weight.regular, lineHeight: 1.5, tracking: 0 },
  label: { font: weight.semibold, lineHeight: 1.35, tracking: 0.1 },
  caption: { font: weight.regular, lineHeight: 1.4, tracking: 0 },
  eyebrow: { font: weight.bold, lineHeight: 1.3, tracking: 1.1 },
}

export interface TProps extends TextProps {
  variant?: Variant
  /** ink (default) · muted · dim · accent · white */
  color?: 'ink' | 'muted' | 'dim' | 'accent' | 'white' | 'night' | 'nightMuted' | 'warn'
  center?: boolean
  children: ReactNode
  style?: StyleProp<TextStyle>
}

const COLORS = {
  ink: tone.ink,
  // `muted` and `dim` are both ink-2: ink-3 never carries meaning.
  muted: tone.ink2,
  dim: tone.ink2,
  accent: tone.accentInk,
  white: '#FFFFFF',
  night: tone.nightInk,
  nightMuted: tone.nightInk2,
  warn: tone.warn,
} as const

/** Every piece of text in the app goes through here, so the size setting always applies. */
export function T({ variant = 'body', color = 'ink', center, style, children, ...rest }: TProps) {
  const { t } = useApp()
  const face = FACE[variant]
  const size = variant === 'eyebrow' ? t.caption : t[variant]
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: face.font,
          fontSize: size,
          lineHeight: Math.round(size * face.lineHeight),
          letterSpacing: face.tracking,
          color: COLORS[color],
          ...(variant === 'eyebrow' ? { textTransform: 'uppercase' as const } : null),
          ...(center ? { textAlign: 'center' as const } : null),
        },
        style,
      ]}
    >
      {children}
    </RNText>
  )
}
