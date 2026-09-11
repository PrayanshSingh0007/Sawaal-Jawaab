import { Icon } from './Icon'
import { Tag } from './Surfaces'

export interface PhraseCardProps {
  text: string
  category?: string
  meta?: string
  onSelect: () => void
  actionLabel?: string
}

export function PhraseCard({
  text,
  category,
  meta,
  onSelect,
  actionLabel = 'Use this phrase',
}: PhraseCardProps) {
  return (
    <button type="button" className="phrase" onClick={onSelect}>
      <span className="grow">
        <span className="phrase__text" style={{ display: 'block' }}>
          {text}
        </span>
        {(category || meta) && (
          <span className="phrase__meta">
            {category && <Tag tone="outline">{category}</Tag>}
            {meta && <span className="caption dim">{meta}</span>}
          </span>
        )}
      </span>
      <span className="phrase__go" aria-hidden="true">
        <Icon name="forward" size={20} strokeWidth={2} />
      </span>
      <span className="sr-only">{actionLabel}</span>
    </button>
  )
}
