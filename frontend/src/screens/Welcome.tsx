import { Button } from '../components/Button'
import { LanguageSelector } from '../components/LanguageSelector'
import { LogoMark, WelcomeArt, Wordmark } from '../components/Logo'
import { useApp } from '../state/AppState'
import { useNavigator } from '../state/router'

/** The door into the app. Short enough to read in one breath. */
export function Welcome() {
  const { settings, update } = useApp()
  const { go } = useNavigator()

  return (
    <main className="welcome page-anim">
      <header className="mark rise">
        <LogoMark size={44} />
        <Wordmark />
      </header>

      <div className="welcome__art rise d2" aria-hidden="true">
        <WelcomeArt />
      </div>

      <div className="stack gap6 rise d3">
        <div className="stack gap3">
          <h1 className="display balance">
            Ask what you need.
            <br />
            We’ll help you be understood.
          </h1>
          <p className="body muted balance" style={{ maxWidth: '32ch' }}>
            Type, speak or tap pictures. Your phone shows the question in big words — and turns
            their reply into something clear.
          </p>
        </div>

        <div className="stack gap3">
          <p className="label muted">Choose a language</p>
          <LanguageSelector
            value={settings.language}
            onChange={(code) => update({ language: code })}
          />
        </div>

        <div className="stack gap3">
          <Button
            variant="accent"
            size="lg"
            block
            icon="forward"
            onClick={() => go('method')}
          >
            Start
          </Button>
          <Button variant="quiet" size="sm" block onClick={() => { update({ onboarded: true }); go('home') }}>
            Skip setup
          </Button>
          <p className="caption dim" style={{ textAlign: 'center' }}>
            No account. Nothing leaves your phone unless you show it.
          </p>
        </div>
      </div>
    </main>
  )
}
