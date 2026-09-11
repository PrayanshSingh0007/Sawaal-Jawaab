import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, View } from 'react-native'
import { useApp } from '../state/AppState'

const STEPS = 6

/**
 * Blur that fades out, rather than stopping at a line.
 *
 * A single blurred strip over scrolling content ends in a hard edge — text is
 * sharp one pixel and frosted the next, which reads as a bug. Real frosted
 * glass has no such edge.
 *
 * There is no gradient mask available here, so the falloff is built from a
 * stack of strips: each one a slice of the height, each blurred a little less
 * than the one above, with a matching tint laid over the whole thing. Six
 * steps is enough that the seams disappear.
 *
 * Purely decorative and never interactive — content passes underneath it.
 *
 * Android has no blur to ramp (see Glass), so it gets the gradient alone —
 * which still does the real job here: content fades out as it travels up
 * behind the header rather than sliding under a hard line.
 */
const CAN_BLUR = Platform.OS !== 'android'
export function ProgressiveBlur({
  height,
  intensity = 48,
  from = 'top',
}: {
  height: number
  intensity?: number
  /** Which edge the blur is strongest at. */
  from?: 'top' | 'bottom'
}) {
  const { settings } = useApp()
  if (settings.highContrast) return null

  const slice = height / STEPS

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height,
        ...(from === 'top' ? { top: 0 } : { bottom: 0 }),
      }}
    >
      {(CAN_BLUR ? Array.from({ length: STEPS }, (_, i) => i) : []).map((i) => {
        // Strongest at the named edge, gone by the far one.
        const depth = from === 'top' ? STEPS - i : i + 1
        return (
          <BlurView
            key={i}
            tint="light"
            intensity={Math.max(1, Math.round((intensity * depth) / STEPS))}
            style={{ position: 'absolute', top: i * slice, left: 0, right: 0, height: slice + 1 }}
          />
        )
      })}
      <LinearGradient
        colors={
          from === 'top'
            ? CAN_BLUR
              ? ['rgba(237,234,229,0.92)', 'rgba(237,234,229,0.55)', 'rgba(237,234,229,0)']
              : ['rgba(237,234,229,0.99)', 'rgba(237,234,229,0.88)', 'rgba(237,234,229,0)']
            : ['rgba(237,234,229,0)', 'rgba(237,234,229,0.55)', 'rgba(237,234,229,0.92)']
        }
        locations={[0, 0.55, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}
      />
    </View>
  )
}
