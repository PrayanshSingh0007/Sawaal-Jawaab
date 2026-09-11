import { Icon } from './Icon'

export interface MicButtonProps {
  recording: boolean
  onToggle: () => void
  disabled?: boolean
}

/** 72px, always paired with a written label beside it. */
export function MicButton({ recording, onToggle, disabled }: MicButtonProps) {
  return (
    <button
      type="button"
      className="mic"
      data-recording={recording}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={recording}
      aria-label={recording ? 'Stop listening' : 'Speak your question'}
    >
      <span className="mic__ring" aria-hidden="true" />
      <Icon name={recording ? 'pause' : 'mic'} size={30} strokeWidth={1.9} />
    </button>
  )
}
