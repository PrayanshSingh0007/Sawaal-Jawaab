import { useEffect, useRef, useState } from 'react'

const HOLD_MS = 850
/** A finger is never perfectly still; only a real drag should cancel the hold. */
const MOVE_TOLERANCE_PX = 12

export interface HoldPoint {
  x: number
  y: number
}

/**
 * Press and hold anywhere on the background to open the emergency card.
 *
 * Controls, text fields and open sheets are excluded, so it never fires while
 * the person is doing something else.
 */
export function useLongPressAnywhere(onTrigger: () => void, enabled: boolean) {
  const [point, setPoint] = useState<HoldPoint | null>(null)
  const timer = useRef(0)
  const origin = useRef<HoldPoint | null>(null)

  useEffect(() => {
    if (!enabled) return

    const cancel = () => {
      window.clearTimeout(timer.current)
      origin.current = null
      setPoint(null)
    }

    const onMove = (e: PointerEvent) => {
      const start = origin.current
      if (!start) return
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_TOLERANCE_PX) cancel()
    }

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (
        target.closest(
          'button, a, input, textarea, select, [role="button"], [role="dialog"], [data-no-longpress]',
        )
      ) {
        return
      }
      const start = { x: e.clientX, y: e.clientY }
      origin.current = start
      setPoint(start)
      timer.current = window.setTimeout(() => {
        origin.current = null
        setPoint(null)
        onTrigger()
      }, HOLD_MS)
    }

    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', cancel, { passive: true })
    document.addEventListener('pointercancel', cancel, { passive: true })
    document.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', cancel, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', cancel)
      document.removeEventListener('pointercancel', cancel)
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', cancel)
      window.clearTimeout(timer.current)
    }
  }, [onTrigger, enabled])

  return point
}
