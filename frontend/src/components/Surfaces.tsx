import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'lift' | 'tile'
  children: ReactNode
}

export function Card({ variant = 'default', className = '', children, ...rest }: CardProps) {
  const v = variant === 'default' ? '' : `card--${variant}`
  return (
    <div className={`card ${v} ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function GlassPanel({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass ${className}`} data-glass="true" {...rest}>
      {children}
    </div>
  )
}

export interface HeroPanelProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
}

/** The one big statement on a screen. Used at most once per screen. */
export function HeroPanel({ eyebrow, title, subtitle, children, className = '' }: HeroPanelProps) {
  return (
    <section className={`hero ${className}`}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>{eyebrow}</p>}
      <h1 className="display balance">{title}</h1>
      {subtitle && (
        <p className="body muted balance" style={{ marginTop: 'var(--s3)', maxWidth: '30ch' }}>
          {subtitle}
        </p>
      )}
      {children && <div style={{ marginTop: 'var(--s6)' }}>{children}</div>}
    </section>
  )
}

export interface TagProps {
  children: ReactNode
  tone?: 'default' | 'accent' | 'ok' | 'outline'
  icon?: string
  dot?: boolean
  /** Lets a long label wrap instead of forcing the row wider. */
  wrap?: boolean
}

export function Tag({ children, tone = 'default', icon, dot, wrap }: TagProps) {
  return (
    <span className={`tag ${tone !== 'default' ? `tag--${tone}` : ''} ${wrap ? 'tag--wrap' : ''}`}>
      {dot && <span className="tag__dot" />}
      {icon && <Icon name={icon} size={13} strokeWidth={2} />}
      {children}
    </span>
  )
}

export interface BannerProps {
  icon?: string
  tone?: 'default' | 'accent'
  children: ReactNode
}

/** Explains what happened and what still works. Never an apology. */
export function Banner({ icon = 'info', tone = 'default', children }: BannerProps) {
  return (
    <p className={`banner ${tone === 'accent' ? 'banner--accent' : ''}`}>
      <Icon name={icon} size={18} className="banner__ico" />
      <span>{children}</span>
    </p>
  )
}

export interface EmptyStateProps {
  icon: string
  title: string
  body: string
  action?: ReactNode
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__ico">
        <Icon name={icon} size={36} strokeWidth={1.6} />
      </div>
      <div>
        <h3 className="h2">{title}</h3>
        <p className="body muted balance" style={{ marginTop: 'var(--s2)', maxWidth: '32ch' }}>
          {body}
        </p>
      </div>
      {action}
    </div>
  )
}

export function Skeleton({ height = 20, width = '100%' }: { height?: number; width?: string }) {
  return <div className="skel" style={{ height, width }} aria-hidden="true" />
}

/** Small, honest disclosure that a model wrote the text on screen. */
export function AiNote({ children = 'AI suggestion — check it’s right' }: { children?: ReactNode }) {
  return (
    <p className="ainote">
      <Icon name="sparkle" size={14} strokeWidth={1.9} />
      {children}
    </p>
  )
}
