import type { ReactNode } from 'react'
import { IconButton } from './Button'
import { useNavigator } from '../state/router'

export interface TopBarProps {
  title?: string
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
}

export function TopBar({ title, onBack, backLabel = 'Go back', right }: TopBarProps) {
  const { back } = useNavigator()
  return (
    <header className="topbar">
      <IconButton icon="back" label={backLabel} onClick={onBack ?? back} />
      {title && <h1 className="topbar__title">{title}</h1>}
      <span className="topbar__spacer" />
      {right}
    </header>
  )
}
