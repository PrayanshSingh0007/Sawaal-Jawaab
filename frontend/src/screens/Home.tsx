import { useRef, useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { HeroPanel, Banner, Tag, Card } from '../components/Surfaces'
import { InputWell } from '../components/InputWell'
import { MicButton } from '../components/MicButton'
import { VoiceWaveform } from '../components/VoiceWaveform'
import { PhraseCard } from '../components/PhraseCard'
import { SegmentedControl } from '../components/SegmentedControl'
import { LogoMark } from '../components/Logo'
import { Icon } from '../components/Icon'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { useDictation } from '../state/useDictation'
import { STARTER_PHRASES } from '../data/packMeta'
import type { InputMethod } from '../lib/types'

const METHODS: Array<{ value: InputMethod; label: string; icon: string }> = [
  { value: 'type', label: 'Type', icon: 'keyboard' },
  { value: 'speak', label: 'Speak', icon: 'mic' },
  { value: 'symbols', label: 'Pictures', icon: 'symbols' },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Home() {
  const { settings, online, announce } = useApp()
  const { draft, setRaw, setMethod, phrases, startFrom, recordUse, suggestion, clearSuggestion } =
    useFlow()
  const { go } = useNavigator()
  // 'symbols' lives on its own screen, so the tab here starts on a text method.
  const [method, setLocalMethod] = useState<InputMethod>(
    settings.preferredMethod === 'symbols' ? 'type' : settings.preferredMethod,
  )
  const field = useRef<HTMLTextAreaElement>(null)

  const dictation = useDictation(settings.language, (text) => {
    setRaw(draft.raw ? `${draft.raw} ${text}` : text)
    announce('Heard it. Check the words before you continue.')
  })

  const chooseMethod = (next: InputMethod) => {
    if (next !== 'speak') dictation.stop()
    setMethod(next)
    if (next === 'symbols') {
      go('symbols')
      return
    }
    setLocalMethod(next)
    if (next === 'speak' && !dictation.recording) void dictation.start()
  }

  const ready = draft.raw.trim().length > 0
  const top = phrases.slice(0, 3)
  const starters = top.length ? [] : STARTER_PHRASES

  const focusField = () => {
    setLocalMethod('type')
    field.current?.focus()
    field.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const continueToPolish = () => {
    if (!ready) return
    go('polish')
  }

  return (
    <div className="page page-anim">
      <div className="greet">
        <div className="row gap3">
          <LogoMark size={34} />
          <div>
            <p className="label muted">{greeting()}</p>
            <p className="caption dim">Sawaal Jawaab</p>
          </div>
        </div>
        <div className="row gap2">
          {!online && <Tag icon="offline">Offline</Tag>}
          <IconButton icon="settings" label="Settings" onClick={() => go('settings')} />
        </div>
      </div>

      {suggestion && (
        <div style={{ marginBottom: 'var(--s4)' }}>
          <Card variant="tile" className="stack gap3">
            <p className="label accent-text row gap2">
              <Icon name="heart" size={16} /> A suggestion from your helper
            </p>
            <p className="body">{suggestion}</p>
            <div className="row gap3 wrap">
              <Button
                variant="dark"
                size="sm"
                icon="check"
                onClick={() => {
                  setRaw(suggestion)
                  clearSuggestion()
                  focusField()
                }}
              >
                Use this
              </Button>
              <Button variant="quiet" size="sm" onClick={clearSuggestion}>
                Not now
              </Button>
            </div>
          </Card>
        </div>
      )}

      {!online && (
        <div style={{ marginBottom: 'var(--s4)' }}>
          <Banner icon="offline">
            No internet. Your saved phrases, packs and emergency card still work.
          </Banner>
        </div>
      )}

      <HeroPanel
        eyebrow="Ask"
        title="How can I help you ask?"
        subtitle="Say it any way you like. We turn it into one clear sentence and show it big."
      >
        <Button variant="dark" size="lg" icon="ask" onClick={focusField}>
          Ask something
        </Button>
      </HeroPanel>

      <section style={{ marginTop: 'var(--s7)' }} aria-labelledby="phrases-h">
        <div className="between" style={{ marginBottom: 'var(--s4)' }}>
          <h2 id="phrases-h" className="h2">
            {top.length ? 'Your phrases' : 'Start with these'}
          </h2>
          <Button variant="quiet" size="sm" iconAfter="forward" onClick={() => go('packs')}>
            More
          </Button>
        </div>
        <div className="stack gap3">
          {top.map((p) => (
            <PhraseCard
              key={p.id}
              text={p.text}
              meta={p.uses > 1 ? `Used ${p.uses} times` : 'Used once'}
              onSelect={() => {
                startFrom(p.text, p.packId)
                void recordUse(p.text, p.packId)
                go('show')
              }}
            />
          ))}
          {starters.map((text) => (
            <PhraseCard
              key={text}
              text={text}
              category="Common"
              onSelect={() => {
                startFrom(text)
                void recordUse(text)
                go('show')
              }}
            />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 'var(--s7)' }} aria-labelledby="compose-h">
        <h2 id="compose-h" className="h2" style={{ marginBottom: 'var(--s4)' }}>
          Write your question
        </h2>

        <div className="compose">
          <SegmentedControl
            label="How do you want to say it?"
            options={METHODS}
            value={dictation.recording ? 'speak' : method}
            onChange={chooseMethod}
          />

          {dictation.recording ? (
            <div className="reclive" role="status">
              <VoiceWaveform getLevel={dictation.getLevel} active />
              <div className="grow">
                <p className="label">Listening</p>
                <p className="caption muted">{dictation.partial || 'Say it in your own way.'}</p>
              </div>
              <MicButton recording onToggle={dictation.toggle} />
            </div>
          ) : (
            <div className="compose__bar">
              <InputWell
                ref={field}
                label="Your question"
                hint="Where do I submit this form?"
                value={draft.raw}
                onChange={(e) => setRaw(e.target.value)}
                showCount
                maxCount={200}
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) continueToPolish()
                }}
              />
              <div className="stack gap2 center">
                <MicButton recording={false} onToggle={dictation.toggle} />
                <span className="caption muted">Speak</span>
              </div>
            </div>
          )}

          {dictation.problem === 'denied' && (
            <Banner icon="mic">
              The microphone is blocked in your browser. Typing and pictures still work.
            </Banner>
          )}
          {dictation.problem === 'unavailable' && (
            <Banner icon="mic">
              This browser cannot listen. Typing and pictures still work.
            </Banner>
          )}
          {dictation.problem === 'nothing' && (
            <Banner icon="mic">Nothing was heard. Try once more, a little closer.</Banner>
          )}

          <div className="row gap3 wrap">
            <Button
              variant="accent"
              size="lg"
              className="grow"
              icon="forward"
              disabled={!ready}
              onClick={continueToPolish}
            >
              Continue
            </Button>
            <Button variant="ghost" size="lg" icon="symbols" onClick={() => go('symbols')}>
              Pictures
            </Button>
          </div>
          {ready && (
            <p className="caption dim" style={{ textAlign: 'center' }}>
              Next: choose how it should sound, then show it.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
