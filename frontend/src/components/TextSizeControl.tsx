import type { Settings } from '../lib/types'

const OPTIONS: Array<{ value: Settings['textScale']; label: string; aa: number }> = [
  { value: 1, label: 'Normal', aa: 17 },
  { value: 1.15, label: 'Large', aa: 21 },
  { value: 1.35, label: 'Larger', aa: 25 },
  { value: 1.6, label: 'Biggest', aa: 30 },
]

export interface TextSizeControlProps {
  value: Settings['textScale']
  onChange: (value: Settings['textScale']) => void
}

export function TextSizeControl({ value, onChange }: TextSizeControlProps) {
  return (
    <div className="sizeopts" role="group" aria-label="Text size">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="sizeopt"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          <span className="sizeopt__aa" style={{ fontSize: opt.aa }} aria-hidden="true">
            Aa
          </span>
          <span className="sizeopt__label">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

export { OPTIONS as TEXT_SIZE_OPTIONS }
