/**
 * Design tokens.
 *
 * The same system as the web build: one warm ceramic surface, one accent, and
 * light that always falls from the top-left. React Native on the New
 * Architecture supports multi-layer and inset `boxShadow`, so the neumorphic
 * elevation carries over almost literally rather than being flattened into a
 * single drop shadow.
 */

export const color = {
  canvas: '#EDEAE5',
  canvasLift: '#F4F2EE',

  surface: '#FAF9F6',
  surfaceSunk: '#E6E2DC',

  accent: '#F2622E',
  accentDeep: '#C74A1C',
  /** Accent used as TEXT — the fill colours do not clear 4.5:1 at small sizes. */
  accentInk: '#A83C0E',
  accentSoft: '#FCE3D5',

  ink: '#1A1714',
  ink2: '#6B645C',
  /** Ornament only — never meaningful text. */
  ink3: '#A39C93',

  pillDark: '#24211E',
  hairline: 'rgba(26,23,20,0.08)',

  ok: '#3F7D58',
  warn: '#B8410E',

  glass: 'rgba(255,255,255,0.62)',
  glassEdge: 'rgba(255,255,255,0.75)',
  glassDeep: 'rgba(255,255,255,0.44)',

  /** The emergency card's ground. Maximum contrast, no red. */
  night: '#17150F',
  nightInk: '#FDFBF7',
  nightInk2: '#D6CEC3',
} as const

export const radius = {
  sheet: 32,
  card: 28,
  tile: 20,
  sm: 14,
  pill: 999,
} as const

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 56,
} as const

/** Minimum comfortable target. Everything interactive clears this. */
export const TAP = 56

export const shadow = {
  e1: '-6px -6px 16px rgba(255,255,255,0.90), 8px 8px 22px rgba(150,136,124,0.18)',
  e2: '-8px -8px 22px rgba(255,255,255,0.92), 12px 12px 32px rgba(150,136,124,0.22)',
  e3: '0 28px 60px -18px rgba(120,104,92,0.38), -2px -2px 12px rgba(255,255,255,0.70)',
  sunk: 'inset 4px 4px 10px rgba(150,136,124,0.26), inset -4px -4px 10px rgba(255,255,255,0.92)',
  hot: '0 10px 28px -6px rgba(242,98,46,0.28), -4px -4px 14px rgba(255,255,255,0.85)',
  dark: '0 12px 24px -12px rgba(26,23,20,0.65)',
  /** A whisper of edge light along the top of a raised ceramic surface. */
  rim: 'inset 0 1px 0 rgba(255,255,255,0.85)',
} as const

/** High contrast replaces every soft edge with a hard one. */
export const hcShadow = {
  e1: '0 0 0 2px rgba(0,0,0,0.9)',
  e2: '0 0 0 2px rgba(0,0,0,0.9)',
  e3: '0 0 0 3px rgba(0,0,0,0.9)',
  sunk: 'inset 0 0 0 2px rgba(0,0,0,0.9)',
  hot: '0 0 0 3px #8A2F0D',
  dark: '0 0 0 2px rgba(0,0,0,0.9)',
  rim: 'none',
} as const

export const motion = {
  press: 120,
  page: 280,
  /** cubic-bezier(0.32, 0.72, 0, 1) */
  easing: [0.32, 0.72, 0, 1] as const,
} as const

/** Base type scale in points. Everything is multiplied by the text-size setting. */
export const type = {
  show: 44,
  display: 34,
  h1: 26,
  h2: 20,
  body: 17,
  label: 14,
  caption: 12,
} as const

export const weight = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const
