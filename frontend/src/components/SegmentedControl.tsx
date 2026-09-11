import { Icon } from './Icon'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: string
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  block?: boolean
}

/** A physical switch: the chosen segment is raised, the rest are sunk with it. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  block = true,
}: SegmentedControlProps<T>) {
  return (
    <div className={`segmented ${block ? 'segmented--block' : ''}`} role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="seg"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <Icon name={opt.icon} size={18} className="seg__ico" />}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
