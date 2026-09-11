import { cloneElement } from 'react'
import type { CSSProperties, JSX } from 'react'

/**
 * One icon family: 24px grid, 1.75 stroke, round joins, no fills.
 * Icons are decorative here — every place one is used carries its own label.
 */

const P = (d: string, key?: string) => <path key={key} d={d} />

const GLYPHS: Record<string, JSX.Element[]> = {
  /* ── Navigation ─────────────────────────────────────────────────────── */
  ask: [P('M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-5 4V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z')],
  packs: [
    <rect key="a" x="3.5" y="3.5" width="7.4" height="7.4" rx="2.2" />,
    <rect key="b" x="13.1" y="3.5" width="7.4" height="7.4" rx="2.2" />,
    <rect key="c" x="3.5" y="13.1" width="7.4" height="7.4" rx="2.2" />,
    <rect key="d" x="13.1" y="13.1" width="7.4" height="7.4" rx="2.2" />,
  ],
  history: [
    P('M3.6 12a8.4 8.4 0 1 0 2.5-6', 'a'),
    P('M3.3 4.8v3.8h3.8', 'b'),
    P('M12 7.6V12l3.1 1.9', 'c'),
  ],
  more: [
    <circle key="a" cx="5.2" cy="12" r="1.7" fill="currentColor" stroke="none" />,
    <circle key="b" cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />,
    <circle key="c" cx="18.8" cy="12" r="1.7" fill="currentColor" stroke="none" />,
  ],
  back: [P('M15 4.5 7.5 12 15 19.5')],
  forward: [P('M9 4.5 16.5 12 9 19.5')],
  down: [P('M5 9 12 16 19 9')],
  close: [P('M6.2 6.2 17.8 17.8', 'a'), P('M17.8 6.2 6.2 17.8', 'b')],
  check: [P('M4.8 12.6 9.6 17.4 19.2 6.8')],
  plus: [P('M12 5v14', 'a'), P('M5 12h14', 'b')],
  search: [<circle key="a" cx="11" cy="11" r="7" />, P('M16.2 16.2 21 21', 'b')],
  edit: [
    P('M4 20.2h4L18.6 9.6a2.2 2.2 0 0 0-3.1-3.1L4.9 17.1Z', 'a'),
    P('M13.6 8.4 16.7 11.5', 'b'),
  ],
  trash: [
    P('M4 6.8h16', 'a'),
    P('M9.2 6.8V5.4A1.6 1.6 0 0 1 10.8 3.8h2.4a1.6 1.6 0 0 1 1.6 1.6v1.4', 'b'),
    P('M17.6 6.8 16.8 19a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6.4 6.8', 'c'),
  ],
  send: [P('M21.2 2.8 3.4 10.4l7.4 3 3 7.4Z', 'a'), P('M10.8 13.4 21.2 2.8', 'b')],
  phone: [
    P('M6.4 3.6h3.1l1.5 4-2.1 1.5a12.6 12.6 0 0 0 6 6l1.5-2.1 4 1.5v3.1a2 2 0 0 1-2.2 2A17.6 17.6 0 0 1 4.4 5.8a2 2 0 0 1 2-2.2Z'),
  ],
  location: [P('M21 3 10.4 21l-1.8-7.6L1 11.6Z')],
  settings: [
    <circle key="a" cx="12" cy="12" r="3.1" />,
    P('M19.6 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z', 'b'),
  ],

  /* ── Input ──────────────────────────────────────────────────────────── */
  keyboard: [
    <rect key="a" x="2.2" y="6.3" width="19.6" height="11.4" rx="2.4" />,
    P('M6.2 10.2h.01', 'b'),
    P('M9.8 10.2h.01', 'c'),
    P('M13.4 10.2h.01', 'd'),
    P('M17 10.2h.01', 'e'),
    P('M8 14.2h8', 'f'),
  ],
  mic: [
    P('M12 3.4a3 3 0 0 1 3 3v5.2a3 3 0 0 1-6 0V6.4a3 3 0 0 1 3-3Z', 'a'),
    P('M5.6 11a6.4 6.4 0 0 0 12.8 0', 'b'),
    P('M12 17.6v3', 'c'),
  ],
  symbols: [
    <circle key="a" cx="6" cy="6" r="1.8" />,
    <circle key="b" cx="12" cy="6" r="1.8" />,
    <circle key="c" cx="18" cy="6" r="1.8" />,
    <circle key="d" cx="6" cy="12" r="1.8" />,
    <circle key="e" cx="12" cy="12" r="1.8" />,
    <circle key="f" cx="18" cy="12" r="1.8" />,
    <circle key="g" cx="6" cy="18" r="1.8" />,
    <circle key="h" cx="12" cy="18" r="1.8" />,
    <circle key="i" cx="18" cy="18" r="1.8" />,
  ],
  speaker: [
    P('M4 9.4h3.2L12 5.2v13.6L7.2 14.6H4Z', 'a'),
    P('M15.6 9.4a3.9 3.9 0 0 1 0 5.2', 'b'),
    P('M18.3 6.8a7.6 7.6 0 0 1 0 10.4', 'c'),
  ],
  replay: [P('M20.4 12a8.4 8.4 0 1 1-2.5-6', 'a'), P('M20.7 4.8v3.8h-3.8', 'b')],
  speed: [P('M3.8 17.4a8.6 8.6 0 1 1 16.4 0', 'a'), P('M12 13.6 16.2 8.8', 'b')],
  qr: [
    <rect key="a" x="3.5" y="3.5" width="6.6" height="6.6" rx="1.6" />,
    <rect key="b" x="13.9" y="3.5" width="6.6" height="6.6" rx="1.6" />,
    <rect key="c" x="3.5" y="13.9" width="6.6" height="6.6" rx="1.6" />,
    P('M13.9 13.9h2.9v2.9h-2.9Z', 'd'),
    P('M20.5 13.9h-1.2', 'e'),
    P('M20.5 17.6v2.9h-3.7', 'f'),
  ],
  sparkle: [
    P('M12 3.2 13.7 8 18.5 9.7 13.7 11.4 12 16.2 10.3 11.4 5.5 9.7 10.3 8Z', 'a'),
    P('M18.4 15.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z', 'b'),
  ],
  offline: [
    P('M2.4 8.6a16 16 0 0 1 5.2-3.1', 'a'),
    P('M12.6 4.6a15.8 15.8 0 0 1 9 4', 'b'),
    P('M6.4 12.4A10 10 0 0 1 13.6 10.6', 'c'),
    P('M9.6 15.9a5.4 5.4 0 0 1 2.4-1', 'd'),
    P('M3 3 21 21', 'e'),
    <circle key="f" cx="12" cy="19.4" r="1" fill="currentColor" stroke="none" />,
  ],
  hint: [
    P('M9.4 18.4h5.2', 'a'),
    P('M10.2 21.2h3.6', 'b'),
    P('M12 3a6 6 0 0 0-3.5 10.9c.7.5 1.1 1.3 1.1 2.1h4.8c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3Z', 'c'),
  ],
  info: [<circle key="a" cx="12" cy="12" r="8.6" />, P('M12 11.2v5', 'b'), P('M12 7.9h.01', 'c')],

  /* ── Symbol board ───────────────────────────────────────────────────── */
  pin: [
    P('M12 21.2s6.9-6.2 6.9-11.1a6.9 6.9 0 1 0-13.8 0C5.1 15 12 21.2 12 21.2Z', 'a'),
    <circle key="b" cx="12" cy="9.9" r="2.6" />,
  ],
  clock: [<circle key="a" cx="12" cy="12" r="8.6" />, P('M12 7.2V12l3.2 2', 'b')],
  coin: [
    <circle key="a" cx="12" cy="12" r="8.6" />,
    P('M8.8 8h6.4', 'b'),
    P('M8.8 10.6h6.4', 'c'),
    P('M13.6 8c1.9 0 2.4 3.2-.4 3.2H8.8L14 17.4', 'd'),
  ],
  hand: [
    P('M9 11.6V6.2a1.6 1.6 0 1 1 3.2 0v5.1', 'a'),
    P('M12.2 10.6a1.6 1.6 0 1 1 3.2 0v1', 'b'),
    P('M15.4 11.2a1.6 1.6 0 0 1 3.2 0v4.2a6 6 0 0 1-6 6h-.9a5 5 0 0 1-4.2-2.4l-2.6-4.3a1.7 1.7 0 0 1 2.7-2l1.4 1.7', 'c'),
  ],
  toilet: [
    P('M8.2 3.4h7.6v4.2H8.2Z', 'a'),
    P('M5.6 7.6h12.8v2.8a6.4 6.4 0 0 1-12.8 0Z', 'b'),
    P('M9.8 16.6v3.8h4.4v-3.8', 'c'),
    P('M6.6 20.4h10.8', 'd'),
  ],
  stethoscope: [
    P('M5.4 3.2v5.2a5.6 5.6 0 0 0 11.2 0V3.2', 'a'),
    P('M3.8 3.2h1.6M16.6 3.2h1.6', 'b'),
    P('M11 13.8v1.4a4.4 4.4 0 0 0 8.8 0v-1.6', 'c'),
    <circle key="d" cx="19.8" cy="10.6" r="2.4" />,
  ],
  wallet: [
    P('M3.4 8.6A2.6 2.6 0 0 1 6 6h12a2.6 2.6 0 0 1 2.6 2.6v7.8A2.6 2.6 0 0 1 18 19H6a2.6 2.6 0 0 1-2.6-2.6Z', 'a'),
    P('M15.6 12.5h5', 'b'),
    <circle key="c" cx="16.4" cy="12.5" r="1.1" fill="currentColor" stroke="none" />,
  ],
  papers: [
    P('M7.4 3.4h6L18 8v10.6a2 2 0 0 1-2 2H7.4a2 2 0 0 1-2-2V5.4a2 2 0 0 1 2-2Z', 'a'),
    P('M13.2 3.4V8H18', 'b'),
    P('M8.6 12.8h6', 'c'),
    P('M8.6 16.2h4', 'd'),
  ],
  repeat: [
    P('M4.2 9.4h11.4a4 4 0 0 1 0 8H9.6', 'a'),
    P('M7.2 6.4 4.2 9.4l3 3', 'b'),
    P('M12.6 14.4l-3 3 3 3', 'c'),
  ],
  pause: [
    <rect key="a" x="7.4" y="5" width="3.4" height="14" rx="1.6" />,
    <rect key="b" x="13.2" y="5" width="3.4" height="14" rx="1.6" />,
  ],

  /* ── Packs ──────────────────────────────────────────────────────────── */
  hospital: [
    P('M4.6 20.4V8.4a1.5 1.5 0 0 1 .8-1.3l6-3.2a1.5 1.5 0 0 1 1.4 0l6 3.2a1.5 1.5 0 0 1 .8 1.3v12', 'a'),
    P('M2.8 20.4h18.4', 'b'),
    P('M12 9.6v5M9.5 12.1h5', 'c'),
  ],
  pill: [
    P('M14.4 3.9a4.6 4.6 0 0 1 6.5 6.5l-8.5 8.5a4.6 4.6 0 0 1-6.5-6.5Z', 'a'),
    P('M9.2 8.2 15.8 14.8', 'b'),
  ],
  bank: [
    P('M3.4 9.6 12 4.4l8.6 5.2', 'a'),
    P('M5.8 9.6v8M9.9 9.6v8M14.1 9.6v8M18.2 9.6v8', 'b'),
    P('M2.8 20.6h18.4', 'c'),
  ],
  shield: [
    P('M12 3.4 5.2 6.1v5.2c0 4.3 2.9 8.3 6.8 9.3 3.9-1 6.8-5 6.8-9.3V6.1Z', 'a'),
    P('M9.2 12.1 11.3 14.2 15 10.4', 'b'),
  ],
  train: [
    P('M6.6 3.6h10.8a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2H6.6a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2Z', 'a'),
    P('M4.6 9.2h14.8', 'b'),
    P('M8.4 20.4 10 16.2M15.6 20.4 14 16.2', 'c'),
    <circle key="d" cx="8.4" cy="12.9" r="1" fill="currentColor" stroke="none" />,
    <circle key="e" cx="15.6" cy="12.9" r="1" fill="currentColor" stroke="none" />,
  ],
  school: [
    P('M12 3.4 21.6 7.8 12 12.2 2.4 7.8Z', 'a'),
    P('M6.6 10.2v4.6c0 1.7 2.4 3 5.4 3s5.4-1.3 5.4-3v-4.6', 'b'),
    P('M20.4 8.8v5.4', 'c'),
  ],
  shop: [
    P('M4.2 9.4h15.6l-1 10a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8Z', 'a'),
    P('M8.6 9.4V7a3.4 3.4 0 0 1 6.8 0v2.4', 'b'),
  ],
  briefcase: [
    P('M3.4 9.6a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2Z', 'a'),
    P('M9 7.6V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.6', 'b'),
    P('M3.4 13.2h17.2', 'c'),
  ],
  home: [
    P('M3.8 10.4 12 3.9l8.2 6.5V19a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2Z', 'a'),
    P('M9.4 21v-5.8h5.2V21', 'b'),
  ],
  alert: [
    P('M10.3 4.6 2.5 17.3a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z', 'a'),
    P('M12 9.8v4.2', 'b'),
    P('M12 17.4h.01', 'c'),
  ],

  /* ── Settings ───────────────────────────────────────────────────────── */
  textsize: [
    P('M2.6 19 8 5l5.4 14', 'a'),
    P('M4.6 14.6h6.8', 'b'),
    P('M21.4 19v-5.2a2.6 2.6 0 0 0-5.2 0', 'c'),
    P('M21.4 16.4h-2.8a2 2 0 0 0 0 4c1.7 0 2.8-1.1 2.8-2.6', 'd'),
  ],
  contrast: [
    <circle key="a" cx="12" cy="12" r="8.6" />,
    P('M12 3.4a8.6 8.6 0 0 1 0 17.2Z', 'b'),
  ],
  motion: [
    P('M3 8h9M3 12h12.5M3 16h7', 'a'),
    P('M17.4 8.4 21 12l-3.6 3.6', 'b'),
  ],
  font: [
    <rect key="a" x="3.4" y="3.4" width="17.2" height="17.2" rx="4" />,
    P('M8 16 11.6 7.6 15.2 16', 'b'),
    P('M9.2 13.4h4.8', 'c'),
  ],
  language: [
    <circle key="a" cx="12" cy="12" r="8.6" />,
    P('M3.6 12h16.8', 'b'),
    P('M12 3.4a13.2 13.2 0 0 1 0 17.2 13.2 13.2 0 0 1 0-17.2', 'c'),
  ],
  user: [<circle key="a" cx="12" cy="8.4" r="3.8" />, P('M4.8 20.4a7.4 7.4 0 0 1 14.4 0', 'b')],
  heart: [
    P('M12 20.2s-7.6-4.6-7.6-10a4.4 4.4 0 0 1 7.6-3 4.4 4.4 0 0 1 7.6 3c0 5.4-7.6 10-7.6 10Z'),
  ],
  star: [P('M12 3.6 14.5 9l5.9.7-4.4 4 1.2 5.8L12 16.6 6.8 19.5 8 13.7l-4.4-4L9.5 9Z')],
}

export type IconName = keyof typeof GLYPHS

export interface IconProps {
  name: IconName | string
  size?: number
  className?: string
  strokeWidth?: number
  style?: CSSProperties
}

export function Icon({ name, size = 22, className, strokeWidth = 1.75, style }: IconProps) {
  const glyph = GLYPHS[name] ?? GLYPHS['info']!
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {glyph.map((el, i) => cloneElement(el, { key: el.key ?? i }))}
    </svg>
  )
}
