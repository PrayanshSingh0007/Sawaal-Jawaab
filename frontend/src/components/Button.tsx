import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

type Variant = 'dark' | 'accent' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: string
  iconAfter?: string
  children: ReactNode
}

/** Every button in the app is this button. Labels are always visible text. */
export function Button({
  variant = 'ghost',
  size = 'md',
  block,
  icon,
  iconAfter,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 24 : 20} className="btn__icon" />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={size === 'lg' ? 24 : 20} className="btn__icon" />}
    </button>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control still announces itself. */
  label: string
  icon: string
  tone?: 'plain' | 'accent' | 'sunk'
  size?: number
}

export function IconButton({
  label,
  icon,
  tone = 'plain',
  size = 22,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`iconbtn ${tone !== 'plain' ? `iconbtn--${tone}` : ''} ${className}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}
