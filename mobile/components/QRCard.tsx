import { View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { T } from './Type'
import { Icon } from './Icon'

/**
 * A real, scannable code in a clean white well.
 *
 * It points at the web reply page, never at this app — the person replying is
 * a stranger at a counter and must not have to install anything.
 */
export function QRCard({ value, size = 128 }: { value: string; size?: number }) {
  const { elevation } = useApp()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
        padding: space[3],
        borderRadius: R.card,
        backgroundColor: color.surface,
        boxShadow: `${elevation.e1}, ${elevation.rim}`,
      }}
    >
      <View
        style={{
          padding: space[3],
          borderRadius: R.tile,
          backgroundColor: '#fff',
          boxShadow: elevation.sunk,
        }}
      >
        <QRCode value={value} size={size} color={color.ink} backgroundColor="#ffffff" ecl="M" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="label">Scan to reply</T>
        <T variant="caption" color="muted">
          No app, no account.
        </T>
      </View>
      <Icon name="qr" size={22} color={color.ink2} />
    </View>
  )
}
