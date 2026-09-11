import { useEffect, useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'
import { readProfile, writeProfile } from '../lib/db'
import { useApp } from '../state/AppState'
import type { EmergencyProfile } from '../lib/types'

const BLANK: EmergencyProfile = {
  name: '',
  bloodGroup: '',
  condition: '',
  allergies: '',
  contactName: '',
  contactPhone: '',
  message: 'I cannot speak. Please call this number.',
}

const FIELDS: Array<{ key: keyof EmergencyProfile; label: string; hint: string }> = [
  { key: 'name', label: 'Name', hint: 'Your full name' },
  { key: 'bloodGroup', label: 'Blood group', hint: 'For example, O+' },
  { key: 'condition', label: 'Condition', hint: 'What someone helping should know' },
  { key: 'allergies', label: 'Allergies', hint: 'Or write “None”' },
  { key: 'contactName', label: 'Emergency contact', hint: 'Who to call' },
  { key: 'contactPhone', label: 'Their number', hint: 'Phone number' },
]

/**
 * The card someone else reads when there is no time to explain.
 * Maximum contrast, no red, and it never leaves the device.
 */
export function Emergency({ onClose }: { onClose: () => void }) {
  const { announce } = useApp()
  const [profile, setProfile] = useState<EmergencyProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EmergencyProfile>(BLANK)
  const [place, setPlace] = useState<string | null>(null)
  const [placeState, setPlaceState] = useState<'idle' | 'finding' | 'blocked'>('idle')

  useEffect(() => {
    void readProfile().then((p) => {
      setProfile(p)
      setForm(p ?? BLANK)
      if (!p) setEditing(true)
    })
    announce('Emergency card open.')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    await writeProfile(form)
    setProfile(form)
    setEditing(false)
    announce('Emergency card saved on this device.')
  }

  const findPlace = () => {
    if (!navigator.geolocation) {
      setPlaceState('blocked')
      return
    }
    setPlaceState('finding')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPlace(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setPlaceState('idle')
      },
      () => setPlaceState('blocked'),
      { timeout: 8000 },
    )
  }

  const rows = profile
    ? [
        { k: 'Name', v: profile.name },
        { k: 'Blood group', v: profile.bloodGroup },
        { k: 'Condition', v: profile.condition },
        { k: 'Allergies', v: profile.allergies },
        { k: 'Call', v: profile.contactName ? `${profile.contactName} · ${profile.contactPhone}` : '' },
      ].filter((r) => r.v)
    : []

  return (
    <div className="emergency" role="dialog" aria-modal="true" aria-label="Emergency card" data-surface="dark">
      <div className="emergency__inner">
        <div className="row between">
          <span className="row gap2 label" style={{ color: '#f8b697' }}>
            <Icon name="heart" size={18} /> Emergency card
          </span>
          <IconButton icon="close" label="Close emergency card" onClick={onClose} />
        </div>

        <p className="emergency__msg balance">
          {profile?.message || BLANK.message}
        </p>

        {rows.length > 0 && (
          <div className="emergency__card">
            {rows.map((r) => (
              <div className="emergency__row" key={r.k}>
                <span className="emergency__k">{r.k}</span>
                <span className="emergency__v">{r.v}</span>
              </div>
            ))}
          </div>
        )}

        {!profile && !editing && (
          <p className="body" style={{ color: '#d6cec3' }}>
            Nothing is filled in yet. Add your details so anyone helping you knows what to do.
          </p>
        )}

        <div className="stack gap3" style={{ marginTop: 'auto', paddingTop: 'var(--s5)' }}>
          <Button
            variant="accent"
            size="lg"
            block
            icon="phone"
            disabled={!profile?.contactPhone}
            onClick={() => {
              if (profile?.contactPhone) location.href = `tel:${profile.contactPhone}`
            }}
          >
            {profile?.contactPhone ? `Call ${profile.contactName || 'contact'}` : 'Add a number to call'}
          </Button>

          <Button variant="ghost" size="lg" block icon="location" onClick={findPlace}>
            {placeState === 'finding' ? 'Finding you…' : 'Share location'}
          </Button>

          {place && (
            <p className="body" style={{ textAlign: 'center' }}>
              You are near <strong>{place}</strong>. Show this to the person helping you.
            </p>
          )}
          {placeState === 'blocked' && (
            <p className="body" style={{ textAlign: 'center', color: '#d6cec3' }}>
              Location is switched off. Everything else on this card still works.
            </p>
          )}

          <div className="row gap3" style={{ justifyContent: 'center', marginTop: 'var(--s2)' }}>
            <Button variant="quiet" size="sm" icon="edit" className="emergency__exit" onClick={() => setEditing(true)}>
              Edit card
            </Button>
            <Button variant="quiet" size="sm" className="emergency__exit" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="caption" style={{ textAlign: 'center', color: '#9c948a' }}>
            This card stays on this device. It works with no internet.
          </p>
        </div>
      </div>

      <BottomSheet open={editing} onClose={() => setEditing(false)} title="Your emergency card">
        <div className="stack gap4">
          {FIELDS.map((f) => (
            <div key={f.key} className="stack gap2">
              <label className="label" htmlFor={`em-${f.key}`}>
                {f.label}
              </label>
              <input
                id={`em-${f.key}`}
                className="field"
                value={form[f.key]}
                placeholder={f.hint}
                inputMode={f.key === 'contactPhone' ? 'tel' : 'text'}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="stack gap2">
            <label className="label" htmlFor="em-message">
              Main message
            </label>
            <input
              id="em-message"
              className="field"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button variant="accent" size="lg" block icon="check" onClick={() => void save()}>
            Save card
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
