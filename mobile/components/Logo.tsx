import { View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { color } from '../theme/tokens'
import { T } from './Type'

/** The mark: a question, and an answer coming back. Two shapes, one accent. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Defs>
        <LinearGradient id="sjMark" x1="4" y1="2" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#F8764A" />
          <Stop offset="0.55" stopColor={color.accent} />
          <Stop offset="1" stopColor={color.accentDeep} />
        </LinearGradient>
      </Defs>
      {/* the reply, sitting behind */}
      <Path
        d="M18.5 14h12A5.5 5.5 0 0 1 36 19.5v6a5.5 5.5 0 0 1-5.5 5.5h-2.2l.1 5.2-5.6-5.2h-4.3A5.5 5.5 0 0 1 13 25.5v-6a5.5 5.5 0 0 1 5.5-5.5Z"
        fill={color.surface}
      />
      <Circle cx="24.5" cy="22.5" r="2.1" fill={color.accent} />
      {/* the question, in front */}
      <Path
        d="M8 2h11.5A6 6 0 0 1 25.5 8v6.5a6 6 0 0 1-6 6h-5.4L7.4 26.4l.1-5.9H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z"
        fill="url(#sjMark)"
      />
      <Path
        d="M10.4 9.2c0-1.9 1.5-3.2 3.5-3.2s3.4 1.2 3.4 3c0 1.5-.8 2.3-2.1 3-.9.5-1.3.9-1.3 1.7v.4"
        stroke="#fff"
        strokeWidth={1.9}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="13.9" cy="17.1" r="1.35" fill="#fff" />
    </Svg>
  )
}

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <T variant="h1" style={{ fontSize: size, lineHeight: Math.round(size * 1.15) }}>
        Sawaal{' '}
      </T>
      <T
        variant="h1"
        color="accent"
        style={{ fontSize: size, lineHeight: Math.round(size * 1.15) }}
      >
        Jawaab
      </T>
    </View>
  )
}
