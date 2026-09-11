import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className="disclose">
      <button
        type="button"
        className="disclose__btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="papers" size={18} />
        <span>{summary}</span>
        <Icon name="down" size={18} className="disclose__chev" />
      </button>
      {open && (
        <div className="disclose__body" id={id}>
          {children}
        </div>
      )}
    </div>
  )
}
