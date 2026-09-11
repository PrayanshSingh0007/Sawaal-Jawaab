import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface ToggleRowProps {
  icon: string
  title: string
  subtitle?: string
  checked: boolean
  onChange: (next: boolean) => void
}

/** State is carried by the words "On"/"Off" as well as the switch position. */
export function ToggleRow({ icon, title, subtitle, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="setting"
      onClick={() => onChange(!checked)}
    >
      <Icon name={icon} size={22} className="dim" />
      <span className="grow">
        <span className="setting__title" style={{ display: 'block' }}>
          {title}
        </span>
        {subtitle && (
          <span className="setting__sub" style={{ display: 'block' }}>
            {subtitle}
          </span>
        )}
      </span>
      <span className="label muted" style={{ minWidth: '2.2em', textAlign: 'right' }}>
        {checked ? 'On' : 'Off'}
      </span>
      <span className="switch" aria-hidden="true">
        <span className="switch__knob">{checked && <Icon name="check" size={14} strokeWidth={3} />}</span>
      </span>
    </button>
  )
}

export interface LinkRowProps {
  icon: string
  title: string
  subtitle?: string
  value?: string
  onClick: () => void
  danger?: boolean
}

export function LinkRow({ icon, title, subtitle, value, onClick, danger }: LinkRowProps) {
  return (
    <button type="button" className="setting" onClick={onClick}>
      <Icon name={icon} size={22} className={danger ? 'danger' : 'dim'} />
      <span className="grow">
        <span className={`setting__title ${danger ? 'danger' : ''}`} style={{ display: 'block' }}>
          {title}
        </span>
        {subtitle && (
          <span className="setting__sub" style={{ display: 'block' }}>
            {subtitle}
          </span>
        )}
      </span>
      {value && <span className="label muted">{value}</span>}
      <Icon name="forward" size={18} className="dim" />
    </button>
  )
}

export function SettingGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="group">
      <div className="group__head">
        <h2 className="eyebrow">{title}</h2>
      </div>
      <div className="group__body">{children}</div>
    </section>
  )
}
