import { Fragment, useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button, IconButton } from '../components/Button'
import { SymbolTile } from '../components/SymbolTile'
import { Icon } from '../components/Icon'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { SYMBOLS } from '../data/symbols'
import type { SymbolDef } from '../lib/types'

/** Build a question by tapping pictures. Every tile carries its word. */
export function SymbolBoard() {
  const { settings, announce, say } = useApp()
  const { setSymbols, setMethod, setRaw } = useFlow()
  const { go } = useNavigator()
  const [picked, setPicked] = useState<SymbolDef[]>([])
  const strip = useRef<HTMLDivElement>(null)

  // Keep the newest word in view as the sentence grows past the edge.
  useEffect(() => {
    const el = strip.current
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
  }, [picked])

  const add = (symbol: SymbolDef) => {
    const next = [...picked, symbol]
    setPicked(next)
    announce(`${symbol.label} added. ${next.length} pictures chosen.`)
    if (settings.readAloudAll) say(symbol.label)
  }

  const removeLast = () => {
    if (!picked.length) return
    const last = picked[picked.length - 1]!
    setPicked(picked.slice(0, -1))
    announce(`${last.label} removed.`)
  }

  const countOf = (id: string) => picked.filter((p) => p.id === id).length

  const goOn = () => {
    if (!picked.length) return
    setSymbols(picked)
    setMethod('symbols')
    setRaw(picked.map((p) => p.word).join(' '))
    go('polish')
  }

  return (
    <div className="page page-anim" data-nav="false">
      <TopBar
        title="Tap pictures"
        right={
          <IconButton icon="keyboard" label="Type instead" onClick={() => go('home')} />
        }
      />

      <div className="stack gap5">
        <section aria-label="Your sentence so far">
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            Your sentence
          </p>
          <div className="strip" ref={strip}>
            {picked.length === 0 ? (
              <p className="body muted">Tap a picture below to begin.</p>
            ) : (
              picked.map((s, i) => (
                <Fragment key={`${s.id}-${i}`}>
                  {i > 0 && <Icon name="forward" size={15} className="strip__arrow" />}
                  <span className="strip__word">
                    <Icon name={s.icon} size={16} />
                    {s.label}
                  </span>
                </Fragment>
              ))
            )}
          </div>
          {picked.length > 0 && (
            <div className="row gap3" style={{ marginTop: 'var(--s3)' }}>
              <Button variant="quiet" size="sm" icon="back" onClick={removeLast}>
                Undo last
              </Button>
              <Button variant="quiet" size="sm" icon="close" onClick={() => setPicked([])}>
                Clear all
              </Button>
            </div>
          )}
        </section>

        <section aria-label="Pictures">
          <div className="symgrid">
            {SYMBOLS.map((symbol) => (
              <SymbolTile
                key={symbol.id}
                symbol={symbol}
                count={countOf(symbol.id)}
                solid={settings.symbolSet === 'solid'}
                onTap={() => add(symbol)}
              />
            ))}
          </div>
        </section>

        <Button
          variant="accent"
          size="lg"
          block
          icon="forward"
          disabled={!picked.length}
          onClick={goOn}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
