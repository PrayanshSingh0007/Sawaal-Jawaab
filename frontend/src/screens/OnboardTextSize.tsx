import { Button } from '../components/Button'
import { TopBar } from '../components/TopBar'
import { TextSizeControl, TEXT_SIZE_OPTIONS } from '../components/TextSizeControl'
import { useApp } from '../state/AppState'
import { useNavigator } from '../state/router'

/** The sample really resizes — what you pick is what you get everywhere. */
export function OnboardTextSize() {
  const { settings, update } = useApp()
  const { go } = useNavigator()
  const current = TEXT_SIZE_OPTIONS.find((o) => o.value === settings.textScale)

  return (
    <div className="page page-anim" data-nav="false">
      <TopBar onBack={() => go('method')} backLabel="Back" />

      <div className="stack gap6">
        <div className="stack gap3 rise">
          <p className="eyebrow">Step 2 of 2</p>
          <h1 className="display balance">Pick your text size</h1>
          <p className="body muted balance" style={{ maxWidth: '34ch' }}>
            Everything in the app grows with it. You can change this any time.
          </p>
        </div>

        <div className="sizepreview rise d1">
          <p
            className="sizepreview__text balance"
            style={{ fontSize: `calc(1.25rem * ${settings.textScale})` }}
          >
            Where do I submit this form?
          </p>
        </div>

        <div className="stack gap3">
          <TextSizeControl
            value={settings.textScale}
            onChange={(value) => update({ textScale: value })}
          />
          <p className="caption dim" style={{ textAlign: 'center' }} aria-live="polite">
            {current?.label} text
          </p>
        </div>

        <Button
          variant="accent"
          size="lg"
          block
          icon="check"
          onClick={() => {
            update({ onboarded: true })
            go('home')
          }}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
