import { useState } from 'react'
import { ReplyComposer } from '../components/ReplyComposer'
import { LogoMark } from '../components/Logo'
import { Icon } from '../components/Icon'
import { Button } from '../components/Button'
import { readLink, sendReply } from '../lib/handoff'

/**
 * The page a stranger lands on after scanning the code.
 *
 * No account, no install, no navigation. A question, a box, a button — the
 * whole interaction should take seconds.
 */
export function Counter({ payload }: { payload: string | null }) {
  const parsed = payload ? readLink(payload) : null
  const [sent, setSent] = useState(false)

  if (!parsed) {
    return (
      <main className="counter page-anim">
        <div className="stack gap4">
          <LogoMark size={40} />
          <h1 className="h1">This link has expired</h1>
          <p className="body muted balance">
            Ask the person to show you their code again, or simply reply out loud.
          </p>
        </div>
      </main>
    )
  }

  if (sent) {
    return (
      <main className="counter page-anim">
        <div className="stack gap5 center" style={{ textAlign: 'center', margin: 'auto 0' }}>
          <span className="empty__ico" style={{ color: 'var(--accent-deep)' }}>
            <Icon name="check" size={40} strokeWidth={2.2} />
          </span>
          <h1 className="display">Reply sent</h1>
          <p className="body muted balance" style={{ maxWidth: '30ch' }}>
            It is on their screen now, in large, plain words. Thank you for taking the time.
          </p>
          <Button variant="quiet" size="sm" icon="edit" onClick={() => setSent(false)}>
            Send another reply
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="counter page-anim">
      <header className="stack gap4">
        <div className="row gap3">
          <LogoMark size={32} />
          <span className="label muted">Sawaal Jawaab</span>
        </div>
        <p className="eyebrow">Someone is asking you a question</p>
      </header>

      <section aria-label="Their question">
        <h1 className="counter__q balance">{parsed.question}</h1>
      </section>

      <p className="banner">
        <Icon name="info" size={18} className="banner__ico" />
        <span>
          They find speaking difficult. Please write your reply below — short and plain is best.
        </span>
      </p>

      <ReplyComposer
        onSend={(text) => {
          void sendReply(parsed.id, parsed.question, text)
          setSent(true)
        }}
        autoFocus
      />
    </main>
  )
}
