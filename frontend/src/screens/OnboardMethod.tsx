import { ChoiceCard } from '../components/ChoiceCard'
import { Button } from '../components/Button'
import { TopBar } from '../components/TopBar'
import { useApp } from '../state/AppState'
import { useNavigator } from '../state/router'
import type { InputMethod } from '../lib/types'

const OPTIONS: Array<{ value: InputMethod; icon: string; title: string; subtitle: string }> = [
  { value: 'type', icon: 'keyboard', title: 'Type', subtitle: 'Write what you want to say.' },
  { value: 'speak', icon: 'mic', title: 'Speak', subtitle: 'Say it in your own way.' },
  { value: 'symbols', icon: 'symbols', title: 'Tap pictures', subtitle: 'Build a question with symbols.' },
]

export function OnboardMethod() {
  const { settings, update } = useApp()
  const { go } = useNavigator()

  return (
    <div className="page page-anim" data-nav="false">
      <TopBar onBack={() => go('welcome')} backLabel="Back to start" />

      <div className="stack gap6">
        <div className="stack gap3 rise">
          <p className="eyebrow">Step 1 of 2</p>
          <h1 className="display balance">How do you talk?</h1>
          <p className="body muted balance" style={{ maxWidth: '34ch' }}>
            Pick what feels easiest. You can use any of them, any time.
          </p>
        </div>

        <div className="stack gap4">
          {OPTIONS.map((opt, i) => (
            <div key={opt.value} className={`rise d${i + 1}`}>
              <ChoiceCard
                icon={opt.icon}
                title={opt.title}
                subtitle={opt.subtitle}
                selected={settings.preferredMethod === opt.value}
                onSelect={() => update({ preferredMethod: opt.value })}
              />
            </div>
          ))}
        </div>

        <Button variant="accent" size="lg" block icon="forward" onClick={() => go('size')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
