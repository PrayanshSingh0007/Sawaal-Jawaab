import { useState } from 'react'
import { ReplyComposer } from '../components/ReplyComposer'
import { LogoMark } from '../components/Logo'
import { Icon } from '../components/Icon'
import { Button } from '../components/Button'
import { readLink, sendReply, sharedTransportAvailable } from '../lib/handoff'

/**
 * The page a stranger lands on after scanning the code.
 *
 * No account, no install, no navigation. A question, a box, a button — the
 * whole interaction should take seconds.
 */
export function Counter({ payload }: { payload: string | null }) {
  const parsed = payload ? readLink(payload) : null
  const [sent, setSent] = useState<string | null>(null)

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

  /* Two honest endings.
   *
   * With a shared transport the reply really does travel to their phone. With
   * none — the default, because this page needs no setup at all — it cannot,
   * so it says so and turns this screen into the thing worth showing them:
   * their answer, large and plain, ready to be turned around. */
  if (sent !== null) {
    return (
      <main className="counter page-anim">
        {sharedTransportAvailable ? (
          <div className="stack gap5 center" style={{ textAlign: 'center', margin: 'auto 0' }}>
            <span className="empty__ico" style={{ color: 'var(--accent-deep)' }}>
              <Icon name="check" size={40} strokeWidth={2.2} />
            </span>
            <h1 className="display">Reply sent</h1>
            <p className="body muted balance" style={{ maxWidth: '30ch' }}>
              It is on their screen now, in large, plain words. Thank you for taking the time.
            </p>
            <Button variant="quiet" size="sm" icon="edit" onClick={() => setSent(null)}>
              Send another reply
            </Button>
          </div>
        ) : (
          <div className="stack gap5" style={{ margin: 'auto 0' }}>
            <p className="eyebrow">Show them this screen</p>
            <h1 className="counter__q balance">{sent}</h1>
            <p className="banner">
              <Icon name="info" size={18} className="banner__ico" />
              <span>
                Turn your phone around so they can read it. Thank you for taking the time.
              </span>
            </p>
            <Button variant="quiet" size="sm" icon="edit" onClick={() => setSent(null)}>
              Change the reply
            </Button>
          </div>
        )}
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
          setSent(text)
        }}
        note={
          sharedTransportAvailable
            ? 'Your reply appears on their screen in large, plain words.'
            : 'Your reply will be shown here in large, plain words to turn around.'
        }
        autoFocus
      />
    </main>
  )
}
