import { useEffect, useRef } from 'react'

const BARS = 22
const STEP_MS = 55

/**
 * A live loudness trace.
 *
 * It samples the level itself and writes bar heights straight to the DOM, so
 * speaking never re-renders the screen around it. When the microphone is
 * unavailable the level source still moves gently — the person can see the app
 * is listening, not that it has broken.
 */
export function VoiceWaveform({
  getLevel,
  active,
}: {
  getLevel: () => number
  active: boolean
}) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bars = Array.from(host.current?.children ?? []) as HTMLElement[]
    if (!bars.length) return
    if (!active) {
      bars.forEach((b) => (b.style.height = '5px'))
      return
    }
    const heights = new Array<number>(BARS).fill(5)
    let raf = 0
    let last = 0
    let tick = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < STEP_MS) return
      last = now
      tick += 1
      heights.shift()
      const jitter = 0.75 + Math.sin(tick * 0.7) * 0.25
      heights.push(Math.max(5, Math.min(34, getLevel() * 34 * jitter + 5)))
      for (let i = 0; i < bars.length; i++) bars[i]!.style.height = `${heights[i]}px`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, getLevel])

  return (
    <div className={`wave ${active ? '' : 'wave--idle'}`} aria-hidden="true" ref={host}>
      {Array.from({ length: BARS }, (_, i) => (
        <span key={i} className="wave__bar" style={{ height: '5px' }} />
      ))}
    </div>
  )
}
