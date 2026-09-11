import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Card } from '../components/Surfaces'
import { LinkRow, SettingGroup, ToggleRow } from '../components/SettingRow'
import { TextSizeControl, TEXT_SIZE_OPTIONS } from '../components/TextSizeControl'
import { LanguageSelector } from '../components/LanguageSelector'
import { SegmentedControl } from '../components/SegmentedControl'
import { BottomSheet } from '../components/BottomSheet'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { eraseEverything } from '../lib/db'
import { LANGUAGES } from '../data/languages'

export function Settings() {
  const { settings, update, resetSettings, showToast, announce, canSpeak, say } = useApp()
  const { refresh, clearDraft } = useFlow()
  const { go } = useNavigator()
  const [confirmErase, setConfirmErase] = useState(false)

  const scaleLabel = TEXT_SIZE_OPTIONS.find((o) => o.value === settings.textScale)?.label ?? 'Normal'
  const langLabel = LANGUAGES.find((l) => l.code === settings.language)?.native ?? 'English'

  const erase = async () => {
    await eraseEverything()
    clearDraft()
    resetSettings()
    await refresh()
    setConfirmErase(false)
    showToast('Everything on this device is deleted.')
    announce('All your data has been deleted from this device.')
    go('home')
  }

  return (
    <div className="page page-anim">
      <TopBar title="Settings" onBack={() => go('more')} backLabel="Back to More" />

      <div className="stack gap5">
        <SettingGroup title="Reading">
          <div style={{ padding: '0 var(--s5) var(--s5)' }}>
            <div className="between" style={{ marginBottom: 'var(--s4)' }}>
              <span className="setting__title">Text size</span>
              <span className="label muted">{scaleLabel}</span>
            </div>
            <TextSizeControl value={settings.textScale} onChange={(v) => update({ textScale: v })} />
            <p className="caption dim" style={{ marginTop: 'var(--s3)' }}>
              Everything grows together, so nothing gets cut off.
            </p>
          </div>

          <ToggleRow
            icon="contrast"
            title="High contrast"
            subtitle="Stronger edges and pure black text."
            checked={settings.highContrast}
            onChange={(v) => update({ highContrast: v })}
          />
          <ToggleRow
            icon="font"
            title="Dyslexia-friendly font"
            subtitle="Wider letters with more space between them."
            checked={settings.hyperlegible}
            onChange={(v) => update({ hyperlegible: v })}
          />
          <ToggleRow
            icon="motion"
            title="Reduce motion"
            subtitle="Turn off movement between screens."
            checked={settings.reduceMotion === true}
            onChange={(v) => update({ reduceMotion: v ? true : null })}
          />
        </SettingGroup>

        <SettingGroup title="Sound">
          <ToggleRow
            icon="speaker"
            title="Read everything aloud"
            subtitle={
              canSpeak
                ? 'Speak headings and choices as you move around.'
                : 'This browser has no voice. Big text still works.'
            }
            checked={settings.readAloudAll}
            onChange={(v) => {
              update({ readAloudAll: v })
              if (v) say('Reading aloud is on.')
            }}
          />
          <div style={{ padding: '0 var(--s5) var(--s5)' }}>
            <div className="between" style={{ margin: 'var(--s2) 0 var(--s3)' }}>
              <span className="setting__title">Reading speed</span>
            </div>
            <SegmentedControl
              label="Reading speed"
              options={[
                { value: '0.7', label: 'Slow' },
                { value: '1', label: 'Normal' },
                { value: '1.25', label: 'Fast' },
              ]}
              value={String(settings.speechRate)}
              onChange={(v) => {
                update({ speechRate: Number(v) })
                say('This is how fast I will read.', Number(v))
              }}
            />
          </div>
        </SettingGroup>

        <SettingGroup title="Words and pictures">
          <div style={{ padding: '0 var(--s5) var(--s5)' }}>
            <div className="between" style={{ marginBottom: 'var(--s3)' }}>
              <span className="setting__title">Language</span>
              <span className="label muted">{langLabel}</span>
            </div>
            <LanguageSelector value={settings.language} onChange={(code) => update({ language: code })} />
          </div>
          <div style={{ padding: '0 var(--s5) var(--s5)' }}>
            <div className="between" style={{ margin: 'var(--s2) 0 var(--s3)' }}>
              <span className="setting__title">Symbol set</span>
            </div>
            <SegmentedControl
              label="Symbol set"
              options={[
                { value: 'line', label: 'Outline' },
                { value: 'solid', label: 'Bold' },
              ]}
              value={settings.symbolSet}
              onChange={(v) => update({ symbolSet: v })}
            />
          </div>
        </SettingGroup>

        <SettingGroup title="Your data">
          <LinkRow
            icon="trash"
            title="Delete all data"
            subtitle="Removes your history, phrases and emergency card from this device."
            onClick={() => setConfirmErase(true)}
            danger
          />
        </SettingGroup>

        <Card variant="tile">
          <p className="caption muted" style={{ lineHeight: 1.6 }}>
            Everything you write stays on this device. Nothing is sent anywhere unless you show a
            question or open a helper link. Your emergency card never leaves this phone.
          </p>
        </Card>
      </div>

      <BottomSheet
        open={confirmErase}
        onClose={() => setConfirmErase(false)}
        title="Delete everything on this device?"
      >
        <div className="stack gap5">
          <p className="body muted">
            Your history, saved phrases and emergency card will be removed from this device. This
            cannot be undone.
          </p>
          <Button variant="accent" size="lg" block icon="trash" onClick={() => void erase()}>
            Yes, delete everything
          </Button>
          <Button variant="quiet" size="lg" block onClick={() => setConfirmErase(false)}>
            Keep my data
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
