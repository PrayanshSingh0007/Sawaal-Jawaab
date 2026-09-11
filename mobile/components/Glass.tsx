import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import { color, shadow } from '../theme/tokens'
import { useApp } from '../state/AppState'

export interface GlassProps {
  children: ReactNode
  radius?: number
  /** Denser glass for surfaces carrying a lot of reading text. */
  dense?: boolean
  style?: object
}

/**
 * Liquid glass.
 *
 * Three things together read as glass rather than as a blur: the blur itself,
 * a light tint with real depth from top to bottom, and a specular rim where
 * light catches the curved edge. On the web that rim is a masked gradient
 * border; here it is a hairline gradient laid over the top edge, which reads
 * the same at these radii.
 *
 * Used only on things that float above the page — never on content, and never
 * stacked on other glass. In high contrast it becomes a plain surface with a
 * hard border, and the optics go entirely.
 */
export function Glass({ children, radius = 32, dense, style }: GlassProps) {
  const { settings } = useApp()

  if (settings.highContrast) {
    return (
      <View
        style={[
          { borderRadius: radius, backgroundColor: color.surface, borderWidth: 2, borderColor: color.ink },
          style,
        ]}
      >
        {children}
      </View>
    )
  }

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', boxShadow: shadow.e2 }, style]}>
      <BlurView intensity={dense ? 60 : 42} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          dense
            ? ['rgba(252,251,249,0.94)', 'rgba(246,244,240,0.88)']
            : [color.glassEdge, color.glass, color.glassDeep]
        }
        locations={dense ? [0, 1] : [0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* The specular rim: light catching the top edge, fading as it wraps. */}
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5 }}
        pointerEvents="none"
      />
      {children}
    </View>
  )
}
