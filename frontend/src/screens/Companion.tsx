import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { LogoMark } from '../components/Logo'
import { Icon } from '../components/Icon'
import { Card } from '../components/Surfaces'
import { readLink, sendSuggestion } from '../lib/handoff'

const SESSION_MINUTES = 60

/**
 * The family helper's view. Deliberately tiny: see the question, offer words.
 * The session is temporary and nothing is stored on the helper's device.
 */
export function Companion({ payload }: { payload: string | null }) {
  const parsed = payload ? readLink(payload) : null
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [minutes, setMinutes] = useState(SESSION_MINUTES)

  useEffect(() => {
    const t = window.setInterval(() => setMinutes((m) => Math.max(0, m - 1)), 60000)
    return () => clearInterval(t)
  }, [])

  if (!parsed) {
    return (
      <main className="companion page-anim">
        <LogoMark size={40} />
        <h1 className="h1">This helper link has ended</h1>
        <p className="body muted balance">
          Helper links last {SESSION_MINUTES} minutes. Ask them to send you a new one.
        </p>
      </main>
    )
  }

  return (
    <main className="companion page-anim">
      <header className="row gap3">
        <LogoMark size={32} />
        <span className="label muted grow">Helping someone ask</span>
        <span className="tag">
          <Icon name="clock" size={13} strokeWidth={2} />
          {minutes} min left
        </span>
      </header>

      <section aria-label="What they want to ask">
        <p className="eyebrow">They are asking</p>
        <h1 className="h1 balance" style={{ marginTop: 'var(--s3)' }}>
          {parsed.question}
        </h1>
      </section>

      {sent ? (
        <Card className="stack gap4 center" style={{ textAlign: 'center' }}>
          <span className="empty__ico" style={{ color: 'var(--accent-deep)' }}>
            <Icon name="check" size={34} strokeWidth={2.2} />
          </span>
          <p className="h2">Your words are on their phone</p>
          <p className="body muted balance">
            They can use it, change it, or ignore it — it is their question.
          </p>
          <Button variant="quiet" size="sm" icon="edit" onClick={() => { setSent(false); setText('') }}>
            Suggest something else
          </Button>
        </Card>
      ) : (
        <form
          className="stack gap4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            void sendSuggestion(parsed.id, parsed.question, text.trim())
            setSent(true)
          }}
        >
          <div className="stack gap2">
            <label className="label" htmlFor="suggestion">
              Suggest better words
            </label>
            <div className="well">
              <textarea
                id="suggestion"
                className="well__input"
                rows={4}
                value={text}
                placeholder="Write it the way you would say it."
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="accent" size="lg" block icon="send" disabled={!text.trim()}>
            Send suggestion
          </Button>
        </form>
      )}

      <p className="caption dim" style={{ textAlign: 'center' }}>
        You can see this one question only. Nothing else is shared with you.
      </p>
    </main>
  )
}
