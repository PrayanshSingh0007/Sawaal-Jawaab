import { useLayoutEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from './Icon'
import { planQr } from '../lib/qr'

export interface QRCardProps {
  value: string
  caption?: string
}

/**
 * A real, scannable code sitting in a clean white well.
 *
 * The size is derived from the URL rather than fixed. A long question makes a
 * finer grid, and past a point the code stops fitting beside its caption, so
 * it takes the full width instead of quietly becoming unreadable.
 */
export function QRCard({ value, caption = 'Scan to reply' }: QRCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The card's padding, plus the white well's, on both sides.
  const plan = planQr(value, width > 0 ? width - 24 - 24 : 0)

  return (
    <div className="show__qr" data-stack={plan.needsFullWidth} ref={host}>
      <div className="qrwell">
        <QRCodeSVG
          value={value}
          size={plan.size}
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
