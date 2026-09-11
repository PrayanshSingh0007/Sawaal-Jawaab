import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from './Button'
import { useLiquidPointer } from '../state/useLiquid'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Hides the visible heading but keeps it for screen readers. */
  quietTitle?: boolean
}

/** A focus-trapping sheet. Escape closes it; focus returns where it came from. */
export function BottomSheet({ open, onClose, title, children, quietTitle }: BottomSheetProps) {
  const panel = useRef<HTMLDivElement | null>(null)
  const liquid = useLiquidPointer<HTMLDivElement>()
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement as HTMLElement
    const node = panel.current
    const focusable = node?.querySelector<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnTo.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="sheet liquid liquid--dense"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={(node) => {
          panel.current = node
          liquid.current = node
        }}
        data-no-longpress="true"
      >
        <div className="sheet__grip" />
        <div className="between" style={{ marginBottom: 'var(--s5)' }}>
          {quietTitle ? <span className="sr-only">{title}</span> : <h2 className="h1">{title}</h2>}
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </>
  )
}
