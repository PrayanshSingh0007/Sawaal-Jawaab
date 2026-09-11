import { TopBar } from '../components/TopBar'
import { Card } from '../components/Surfaces'
import { LinkRow, SettingGroup } from '../components/SettingRow'
import { LogoMark, Wordmark } from '../components/Logo'
import { useNavigator } from '../state/router'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { companionLink } from '../lib/handoff'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { useState } from 'react'

/** The fourth tab: everything that isn't the ask journey itself. */
export function More({ onEmergency }: { onEmergency: () => void }) {
  const { go } = useNavigator()
  const { online, showToast } = useApp()
  const { question, handoff, openHandoff } = useFlow()
  const [link, setLink] = useState<string | null>(null)

  const inviteHelper = () => {
    const h = handoff ?? openHandoff(question || 'I want to ask something.')
    const url = companionLink(h)
    setLink(url)
    navigator.clipboard
      ?.writeText(url)
      .then(() => showToast('Link copied. It works for 60 minutes.'))
      .catch(() => showToast('Link ready below. It works for 60 minutes.'))
  }

  return (
    <div className="page page-anim">
      <TopBar title="More" onBack={() => go('home')} backLabel="Back to Ask" />

      <div className="stack gap5">
        <SettingGroup title="Get ready">
          <LinkRow
            icon="ask"
            title="Practice a conversation"
            subtitle="Rehearse the bank, the doctor or a ticket counter."
            onClick={() => go('practice')}
          />
          <LinkRow
            icon="heart"
            title="Emergency card"
            subtitle="Your details, ready for someone helping you."
            onClick={onEmergency}
          />
          <LinkRow
            icon="user"
            title="Ask family to help"
            subtitle="Send a link so someone you trust can suggest words."
            onClick={inviteHelper}
          />
        </SettingGroup>

        {link && (
          <Card variant="tile" className="stack gap3">
            <p className="label row gap2">
              <Icon name="user" size={16} /> Helper link
            </p>
            <p className="caption muted" style={{ wordBreak: 'break-all' }}>
              {link}
            </p>
            <div className="row gap3 wrap">
              <Button variant="dark" size="sm" icon="forward" onClick={() => go('companion', link.split('/companion/')[1] ?? '')}>
                Open it here
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setLink(null)}>
                Hide
              </Button>
            </div>
            <p className="caption dim">Expires in 60 minutes. Nothing else is shared.</p>
          </Card>
        )}

        <SettingGroup title="This app">
          <LinkRow
            icon="settings"
            title="Settings"
            subtitle="Text size, contrast, reading aloud, language."
            onClick={() => go('settings')}
          />
          <LinkRow
            icon="packs"
            title="Situation packs"
            subtitle="Ready-made phrases that work offline."
            onClick={() => go('packs')}
          />
          <LinkRow
            icon="history"
            title="History"
            subtitle="Questions you asked and the replies you got."
            onClick={() => go('history')}
          />
        </SettingGroup>

        <Card className="stack gap4 center" style={{ textAlign: 'center' }}>
          <LogoMark size={40} />
          <Wordmark />
          <p className="body muted balance" style={{ maxWidth: '30ch' }}>
            When speaking is difficult, communication shouldn’t stop.
          </p>
          <p className="caption dim">
            {online ? 'Online — replies can come from other phones.' : 'Offline — everything on this page still works.'}
          </p>
        </Card>

        <p className="caption dim" style={{ textAlign: 'center' }}>
          Press and hold anywhere on the app to open your emergency card.
        </p>
      </div>
    </div>
  )
}
