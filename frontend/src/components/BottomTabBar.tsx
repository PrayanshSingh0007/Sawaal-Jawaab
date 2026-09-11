import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useNavigator } from '../state/router'
import { useLiquidPointer } from '../state/useLiquid'

const TABS = [
  { name: 'home', label: 'Ask', icon: 'ask' },
  { name: 'packs', label: 'Packs', icon: 'packs' },
  { name: 'history', label: 'History', icon: 'history' },
  { name: 'more', label: 'More', icon: 'more' },
] as const

/** Four destinations, always labelled, with one pill that flows between them. */
export function BottomTabBar({ current }: { current: string }) {
  const { go } = useNavigator()
  const nav = useLiquidPointer<HTMLElement>()
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const [ready, setReady] = useState(false)

  const place = useCallback(() => {
    const host = nav.current
    const active = buttons.current.get(current)
    if (!host || !active) return
    host.style.setProperty('--pill-x', `${active.offsetLeft}px`)
    host.style.setProperty('--pill-w', `${active.offsetWidth}px`)
    setReady(true)
  }, [current, nav])

  useLayoutEffect(place, [place])

  useEffect(() => {
    const host = nav.current
    if (!host || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(place)
    ro.observe(host)
    return () => ro.disconnect()
  }, [place, nav])

  return (
    <nav className="tabbar liquid" aria-label="Main" ref={nav}>
      <span className="tabbar__pill" data-ready={ready} aria-hidden="true" />
      {TABS.map((tab) => {
        const active = current === tab.name
        return (
          <button
            key={tab.name}
            type="button"
            className="tab"
            aria-current={active ? 'page' : undefined}
            ref={(el) => {
              if (el) buttons.current.set(tab.name, el)
              else buttons.current.delete(tab.name)
            }}
            onClick={() => go(tab.name)}
          >
            <Icon name={tab.icon} size={22} className="tab__ico" strokeWidth={active ? 2 : 1.75} />
            <span className="tab__label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
