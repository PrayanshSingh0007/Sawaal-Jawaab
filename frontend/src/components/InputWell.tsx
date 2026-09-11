import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface InputWellProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  showCount?: boolean
  maxCount?: number
}

/** A pressed-in well. Text sits inside the surface rather than on top of it. */
export const InputWell = forwardRef<HTMLTextAreaElement, InputWellProps>(function InputWell(
  { label, hint, showCount, maxCount = 200, className = '', value, ...rest },
  ref,
) {
  const length = typeof value === 'string' ? value.length : 0
  return (
    <div className={`well compose__well ${className}`}>
      <label className="sr-only" htmlFor={rest.id ?? 'compose'}>
        {label}
      </label>
      <textarea
        id={rest.id ?? 'compose'}
        ref={ref}
        className="well__input"
        value={value}
        rows={3}
        {...(hint ? { placeholder: hint } : {})}
        {...rest}
      />
      {showCount && (
        <p className="compose__count" aria-hidden="true">
          {length}/{maxCount}
        </p>
      )}
    </div>
  )
})
