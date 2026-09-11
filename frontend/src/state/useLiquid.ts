import { useEffect, useRef } from 'react'

/**
 * Moves the specular highlight on a glass surface with the pointer.
 *
 * Only runs where there is a real pointer to follow, and never when the person
 * has asked for less motion. Values are written straight to the element's
 * custom properties, so tracking the cursor never re-renders anything.
 */
export function useLiquidPointer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (document.documentElement.dataset['motion'] === 'reduced') return
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      document.documentElement.dataset['motion'] !== 'full'
    ) {
      return
    }

    let frame = 0
    const move = (e: PointerEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        el.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`)
        el.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`)
        el.style.setProperty('--sheen', '0.95')
      })
    }
    const leave = () => {
      el.style.removeProperty('--lx')
      el.style.removeProperty('--ly')
      el.style.removeProperty('--sheen')
    }

    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return ref
}
