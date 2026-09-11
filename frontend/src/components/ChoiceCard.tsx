import { Icon } from './Icon'

export interface ChoiceCardProps {
  icon: string
  title: string
  subtitle: string
  selected: boolean
  onSelect: () => void
}

export function ChoiceCard({ icon, title, subtitle, selected, onSelect }: ChoiceCardProps) {
  return (
    <button
      type="button"
      className="choice"
      data-selected={selected}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="choice__ico">
        <Icon name={icon} size={28} strokeWidth={1.8} />
      </span>
      <span className="grow">
        <span className="choice__title" style={{ display: 'block' }}>
          {title}
        </span>
        <span className="choice__sub" style={{ display: 'block' }}>
          {subtitle}
        </span>
      </span>
      {selected && <Icon name="check" size={24} strokeWidth={2.4} className="choice__check" />}
    </button>
  )
}
