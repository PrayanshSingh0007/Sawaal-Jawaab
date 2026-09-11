import { useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { AiNote, Banner, Card, Tag } from '../components/Surfaces'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { buildSentence, buildSymbolSentence } from '../lib/ai'
import type { Tone } from '../lib/types'

const TONES: Array<{ value: Tone; label: string; hint: string; icon: string }> = [
  { value: 'short', label: 'Short', hint: 'Straight to the point', icon: 'ask' },
  { value: 'polite', label: 'Polite', hint: 'Good at a counter', icon: 'heart' },
  { value: 'urgent', label: 'Urgent', hint: 'Needs attention now', icon: 'alert' },
]

/** The bridge: raw words in, one clear sentence out. Never a dead end. */
export function Polish() {
  const { announce, settings } = useApp()
  const { draft, variants, setVariants, tone, setTone, question, setQuestionOverride, recordUse } =
    useFlow()
  const { go } = useNavigator()
  const [loading, setLoading] = useState(!variants)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(question)
  const group = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variants) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    const source =
      draft.method === 'symbols' && draft.symbols.length
        ? buildSymbolSentence(draft.symbols, settings.language)
        : buildSentence(draft.raw, settings.language)
    void source.then((result) => {
      if (!alive) return
      setVariants(result)
      setLoading(false)
      announce('Three versions are ready. Choose one.')
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onKeyNav = (e: React.KeyboardEvent) => {
    const order = TONES.map((t) => t.value)
    const i = order.indexOf(tone)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setTone(order[(i + 1) % order.length]!)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setTone(order[(i - 1 + order.length) % order.length]!)
    }
  }

  const showIt = () => {
    void recordUse(question, draft.packId)
    go('show')
  }

  return (
    <div className="page page-anim" data-nav="false">
      <TopBar title="Check it" />

      <div className="stack gap6">
        <div className="stack gap3">
          <h2 className="display balance">What do you want to say?</h2>
          <p className="body muted">You said:</p>
          <Card variant="tile" className="row gap3">
            <Icon name={draft.method === 'symbols' ? 'symbols' : 'edit'} size={20} className="dim" />
            <p className="body grow">
              {draft.method === 'symbols' && draft.symbols.length
                ? draft.symbols.map((s) => s.label).join(' → ')
                : draft.raw || '—'}
            </p>
          </Card>
        </div>

        {variants?.needs && (
          <Banner icon="hint" tone="accent">
            {variants.needs}
          </Banner>
        )}

        <div
          className="stack gap4"
          role="radiogroup"
          aria-label="Choose how it should sound"
          ref={group}
          onKeyDown={onKeyNav}
        >
          {TONES.map((t) => {
            const text = variants?.[t.value]
            const selected = tone === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                className="variant"
                onClick={() => setTone(t.value)}
              >
                <span className="variant__head">
                  <Icon name={t.icon} size={18} className={selected ? 'accent-text' : 'dim'} />
                  <Tag tone={selected ? 'accent' : 'outline'}>{t.label}</Tag>
                  <span className="caption dim">{t.hint}</span>
                  <span className="variant__radio">
                    <Icon name="check" size={14} strokeWidth={3.2} />
                  </span>
                </span>
                {loading && !text ? (
                  <span className="stack gap2" aria-hidden="true">
                    <span className="skel" style={{ height: 18, width: '92%' }} />
                    <span className="skel" style={{ height: 18, width: '64%' }} />
                  </span>
                ) : (
                  <span className="variant__text">{text || draft.raw}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="between wrap gap3">
          <AiNote>
            {loading
              ? 'Writing three versions…'
              : variants?.source === 'ai'
                ? 'AI suggestion — check it’s right'
                : 'Written on your device — check it’s right'}
          </AiNote>
          <Button
            variant="quiet"
            size="sm"
            icon="edit"
            onClick={() => {
              setEditText(question)
              setEditing(true)
            }}
          >
            Edit words
          </Button>
        </div>

        <Button variant="accent" size="lg" block icon="forward" onClick={showIt}>
          Show this
        </Button>
        <p className="caption dim" style={{ textAlign: 'center', marginTop: 'calc(var(--s4) * -1)' }}>
          Your phone becomes a card the other person can read.
        </p>
      </div>

      <BottomSheet open={editing} onClose={() => setEditing(false)} title="Edit your words">
        <div className="stack gap4">
          <div className="well">
            <label className="sr-only" htmlFor="edit-q">
              Your question
            </label>
            <textarea
              id="edit-q"
              className="well__input"
              value={editText}
              rows={4}
              onChange={(e) => setEditText(e.target.value)}
            />
          </div>
          <Button
            variant="accent"
            size="lg"
            block
            icon="check"
            onClick={() => {
              setQuestionOverride(editText.trim())
              setEditing(false)
              announce('Your words are saved.')
            }}
          >
            Save words
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
