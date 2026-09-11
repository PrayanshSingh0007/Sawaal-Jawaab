import { useState } from 'react'
import { View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { planQr } from '../lib/qr'
import { T } from '../components/Type'
import { Icon } from './Icon'

/**
 * A real, scannable code in a clean white well.
 *
 * It points at the web reply page, never at this app — the person replying is
 * a stranger at a counter and must not have to install anything.
 *
 * The size is derived from the URL rather than fixed. A long question makes a
 * finer grid, and past a point the code stops fitting beside its caption, so
 * it takes the full width instead of quietly becoming unreadable.
 */
export function QRCard({ value }: { value: string }) {
  const { elevation } = useApp()
  const [width, setWidth] = useState(0)
  // The well's padding on both sides, plus the card's own.
  const available = width > 0 ? width - space[3] * 2 - space[3] * 2 : 0
  const plan = planQr(value, available)

  const caption = (
    <View style={{ flex: plan.needsFullWidth ? undefined : 1, gap: 2 }}>
      <T variant="label">Scan to reply</T>
      <T variant="caption" color="muted">
        No app, no account.
      </T>
    </View>
  )

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: plan.needsFullWidth ? 'column' : 'row',
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
        <QRCode
          value={value}
          size={plan.size}
          color={color.ink}
          backgroundColor="#ffffff"
          ecl="M"
        />
      </View>
      {plan.needsFullWidth ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <Icon name="qr" size={20} color={color.ink2} />
          {caption}
        </View>
      ) : (
        <>
          {caption}
          <Icon name="qr" size={22} color={color.ink2} />
        </>
      )}
    </View>
  )
}
