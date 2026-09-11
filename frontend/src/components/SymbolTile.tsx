import { Icon } from './Icon'
import type { SymbolDef } from '../lib/types'

export interface SymbolTileProps {
  symbol: SymbolDef
  count: number
  onTap: () => void
  solid?: boolean
}

/** 88px minimum, picture and word together — never a picture alone. */
export function SymbolTile({ symbol, count, onTap, solid }: SymbolTileProps) {
  return (
    <button
      type="button"
      className="symbol"
      data-selected={count > 0}
      onClick={onTap}
      aria-label={count > 0 ? `${symbol.label}, added ${count} times` : `Add ${symbol.label}`}
    >
      <Icon
        name={symbol.icon}
        size={30}
        strokeWidth={solid ? 2.4 : 1.75}
        className="symbol__ico"
      />
      <span className="symbol__label">{symbol.label}</span>
      {count > 1 && (
        <span className="symbol__count" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  )
}
