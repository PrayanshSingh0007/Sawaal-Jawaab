import { QRCodeSVG } from 'qrcode.react'
import { Icon } from './Icon'

export interface QRCardProps {
  value: string
  caption?: string
  size?: number
}

/** A real, scannable code sitting in a clean white well. */
export function QRCard({ value, caption = 'Scan to reply', size = 96 }: QRCardProps) {
  return (
    <div className="show__qr">
      <div className="qrwell">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#1A1714"
          marginSize={0}
        />
      </div>
      <div className="grow">
        <p className="label">{caption}</p>
        <p className="caption muted" style={{ marginTop: 2, lineHeight: 1.35 }}>
          No app, no account.
        </p>
      </div>
      <Icon name="qr" size={22} className="dim" />
    </div>
  )
}
