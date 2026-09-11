import { useState } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

export interface ReplyComposerProps {
  onSend: (text: string) => void
  placeholder?: string
  sendLabel?: string
  autoFocus?: boolean
  /** What happens to the reply. Differs when handing the phone over versus
   *  replying on your own phone after scanning. */
  note?: string
}

/**
 * The other person's half of the conversation. Used both on the phone that is
 * handed over and on the page opened by scanning the code — the same words,
 * the same shape, so it is learned once.
 */
export function ReplyComposer({
  onSend,
  placeholder = 'Type your reply here',
  sendLabel = 'Send reply',
  autoFocus,
  note = 'Your reply appears on their screen in large, plain words.',
}: ReplyComposerProps) {
  const [text, setText] = useState('')
  const ready = text.trim().length > 0

  return (
    <form
      className="stack gap4"
      onSubmit={(e) => {
        e.preventDefault()
        if (ready) onSend(text.trim())
      }}
    >
      <div className="well counter__well">
        <label className="sr-only" htmlFor="reply-text">
          Your reply
        </label>
        <textarea
          id="reply-text"
          className="well__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          autoFocus={autoFocus}
          autoCapitalize="sentences"
        />
      </div>
      <Button type="submit" variant="accent" size="lg" block icon="send" disabled={!ready}>
        {sendLabel}
      </Button>
      <p className="caption dim row gap2" style={{ justifyContent: 'center' }}>
        <Icon name="info" size={14} />
        {note}
      </p>
    </form>
  )
}
