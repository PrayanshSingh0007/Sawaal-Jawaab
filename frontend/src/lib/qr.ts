/**
 * How big a QR code has to be drawn to actually be scannable.
 *
 * A code is not either valid or invalid — it is a grid, and the longer the URL
 * the finer that grid becomes. A long question silently turns a working code
 * into one a camera cannot resolve across a counter, which is the only place
 * this is ever used. So the size is derived from the data rather than fixed.
 */

/** Byte capacity per QR version at error-correction level M. */
const CAPACITY_M = [
  0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450,
  504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370,
  1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331,
]

/** Below this, phone cameras start to struggle at arm's length. */
const MIN_PX_PER_MODULE = 2.6

export interface QrPlan {
  /** Side length to draw, in CSS px / points. */
  size: number
  modules: number
  pxPerModule: number
  /** True when the code needs more room than a side-by-side row can give. */
  needsFullWidth: boolean
}

/**
 * @param available the widest the code could be drawn if it took the full row
 * @param inline    the size it would be drawn at beside its caption
 */
export function planQr(value: string, available: number, inline = 128): QrPlan {
  let version = 1
  while (version < CAPACITY_M.length - 1 && CAPACITY_M[version]! < value.length) version += 1
  const modules = 17 + 4 * version

  const wanted = Math.ceil(modules * MIN_PX_PER_MODULE)
  const roomy = available > 0 ? Math.min(wanted, available) : wanted
  const size = Math.max(inline, roomy)

  return {
    size,
    modules,
    pxPerModule: size / modules,
    needsFullWidth: wanted > inline,
  }
}
