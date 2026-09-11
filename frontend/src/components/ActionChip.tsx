import { Icon } from './Icon'

/**
 * The most important thing on the Understand screen: the one thing to do next.
 * Always carries the words "Do this" so the meaning never rests on colour.
 */
export function ActionChip({ text, settle = true }: { text: string; settle?: boolean }) {
  return (
    <div className={`actionchip ${settle ? 'chip-settle' : ''}`}>
      <span className="actionchip__ico">
        <Icon name="check" size={22} strokeWidth={2.4} />
      </span>
      <span className="grow">
        <span className="actionchip__label" style={{ display: 'block' }}>
          Do this
        </span>
        <span className="actionchip__text" style={{ display: 'block' }}>
          {text}
        </span>
      </span>
    </div>
  )
}
