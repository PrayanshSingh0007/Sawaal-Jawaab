import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import { color, shadow } from '../theme/tokens'
import { useApp } from '../state/AppState'

export interface GlassProps {
  children: ReactNode
  radius?: number
  /** Denser glass for surfaces carrying a lot of reading text. */
  dense?: boolean
  /** For the emergency surface, where the ground is near-black. */
  tint?: 'light' | 'dark'
  style?: object
}

/**
 * Liquid glass.
 *
 * Four things together read as a pane of glass rather than a blur:
 *
 *   the blur itself;
 *   a saturation lift, so colour blooms through from behind;
 *   a gradient through the body, because glass is not evenly lit — it is
 *     brightest where the light enters and dimmest at the far edge;
 *   and light caught on the edges: a hard specular line along the top where
 *     the surface turns, and a softer bounce along the bottom where light
 *     reflects back up off whatever the pane is resting above.
 *
 * That last pair is what gives it thickness. Without them a blurred rectangle
 * reads as a filter over the page; with them it reads as an object sitting on
 * top of it.
 *
 * Used only on things that float — never on content, and never stacked on
 * other glass. In high contrast it becomes a plain surface with a hard border
 * and every optical trick is dropped.
 *
 * On Android there is no blur. `expo-blur` defaults `blurMethod` to 'none'
 * there, which renders a plain semi-transparent view, and the alternative
 * needs a `blurTarget` plumbed through every call site and still degrades on
 * SDK 30 and below. Translucency without blur is not glass — it is text
 * showing through text. So Android gets a near-opaque frosted panel instead,
 * keeping the same gradient body and the same specular edges. It reads as a
 * solid pane of frosted glass rather than as a broken one.
 */
const CAN_BLUR = Platform.OS !== 'android'
export function Glass({ children, radius = 32, dense, tint = 'light', style }: GlassProps) {
  const { settings } = useApp()
  const dark = tint === 'dark'

  if (settings.highContrast) {
    return (
      <View
        style={[
          {
            borderRadius: radius,
            backgroundColor: color.surface,
            borderWidth: 2,
            borderColor: color.ink,
          },
          style,
        ]}
      >
        {children}
      </View>
    )
  }

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: dark ? '0 18px 40px -20px rgba(0,0,0,0.75)' : shadow.e2,
        },
        style,
      ]}
    >
      {CAN_BLUR ? (
        <BlurView
          intensity={dense ? 60 : 42}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {/* The body of the pane: brightest where the light enters. Opaque enough
          on Android to stand in for the blur that is not there. */}
      <LinearGradient
        colors={
          dark
            ? CAN_BLUR
              ? ['rgba(52,46,38,0.70)', 'rgba(30,27,22,0.58)', 'rgba(23,21,15,0.50)']
              : ['rgba(48,43,35,0.97)', 'rgba(32,29,23,0.96)', 'rgba(25,23,17,0.95)']
            : dense || !CAN_BLUR
              ? CAN_BLUR
                ? ['rgba(252,251,249,0.94)', 'rgba(248,246,243,0.90)', 'rgba(244,242,238,0.88)']
                : ['rgba(252,251,249,0.98)', 'rgba(248,246,243,0.97)', 'rgba(243,241,237,0.96)']
              : [color.glassEdge, color.glass, color.glassDeep]
        }
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Specular line along the top edge, where the surface turns to meet the
          light. Brightest at the corner the light comes from. */}
      <LinearGradient
        colors={
          dark
            ? ['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']
        }
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5 }}
        pointerEvents="none"
      />

      {/* Light bouncing back up off whatever the pane rests above. Softer, and
          it fades the other way. */}
      <LinearGradient
        colors={
          dark
            ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.10)']
            : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)']
        }
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.1, y: 0 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }}
        pointerEvents="none"
      />

      {children}
    </View>
  )
}
