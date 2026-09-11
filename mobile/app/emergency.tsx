import { useEffect, useState } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import { color, radius as R, space, TAP } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { readProfile, writeProfile } from '../lib/store'
import { Button, IconButton } from '../components/Button'
import { Glass } from '../components/Glass'
import { Sheet } from '../components/Sheet'
import { Well } from '../components/Well'
import { T } from '../components/Type'
import { Icon } from '../components/Icon'
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
export default function Emergency() {
  const { announce } = useApp()
  const insets = useSafeAreaInsets()
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
  }, [announce])

  const findPlace = async () => {
    setPlaceState('finding')
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setPlaceState('blocked')
      return
    }
    try {
      const pos = await Location.getCurrentPositionAsync({})
      setPlace(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
      setPlaceState('idle')
    } catch {
      setPlaceState('blocked')
    }
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
    <View style={{ flex: 1, backgroundColor: color.night }}>
      <LinearGradient
        colors={['rgba(242,98,46,0.22)', 'rgba(23,21,15,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          maxWidth: 560,
          width: '100%',
          alignSelf: 'center',
          gap: space[5],
          paddingHorizontal: space[5],
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[6],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Icon name="heart" size={18} color="#F8B697" />
          <T variant="label" style={{ flex: 1, color: '#F8B697' }}>
            Emergency card
          </T>
          <IconButton
            icon="close"
            label="Close emergency card"
            tone="night"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          />
        </View>

        <T variant="display" color="night" style={{ fontFamily: 'Inter_700Bold' }}>
          {profile?.message || BLANK.message}
        </T>

        {rows.length > 0 ? (
          <View
            style={{
              borderRadius: R.card,
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)',
            }}
          >
            {rows.map((r, i) => (
              <View
                key={r.k}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: space[4],
                  padding: space[4],
                  paddingHorizontal: space[5],
                  boxShadow: i > 0 ? 'inset 0 1px 0 rgba(255,255,255,0.14)' : undefined,
                }}
              >
                <T variant="label" color="nightMuted">
                  {r.k}
                </T>
                <T variant="h2" color="night" style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter_600SemiBold' }}>
                  {r.v}
                </T>
              </View>
            ))}
          </View>
        ) : null}

        {!profile && !editing ? (
          <T variant="body" color="nightMuted">
            Nothing is filled in yet. Add your details so anyone helping you knows what to do.
          </T>
        ) : null}

        <View style={{ flex: 1 }} />

        {/* The actions sit on their own pane of dark glass, so they read as a
            fixed control surface rather than as more of the card above. */}
        <Glass radius={R.sheet} tint="dark" style={{ padding: space[4] }}>
          <View style={{ gap: space[3] }}>
          <Button
            variant="accent"
            size="lg"
            block
            icon="phone"
            disabled={!profile?.contactPhone}
            onPress={() => {
              if (profile?.contactPhone) void Linking.openURL(`tel:${profile.contactPhone}`)
            }}
          >
            {profile?.contactPhone ? `Call ${profile.contactName || 'contact'}` : 'Add a number to call'}
          </Button>

          <Button variant="night" size="lg" block icon="location" onPress={() => void findPlace()}>
            {placeState === 'finding' ? 'Finding you…' : 'Share location'}
          </Button>

          {place ? (
            <T variant="body" color="night" center>
              You are near {place}. Show this to the person helping you.
            </T>
          ) : null}
          {placeState === 'blocked' ? (
            <T variant="body" color="nightMuted" center>
              Location is switched off. Everything else on this card still works.
            </T>
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space[3], minHeight: TAP }}>
            <Button variant="night" size="sm" icon="edit" onPress={() => setEditing(true)}>
              Edit card
            </Button>
          </View>
          <T variant="caption" color="nightMuted" center>
            This card stays on this device. It works with no internet.
          </T>
          </View>
        </Glass>
      </ScrollView>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Your emergency card">
        <View style={{ gap: space[4] }}>
          {FIELDS.map((f) => (
            <View key={f.key} style={{ gap: space[2] }}>
              <T variant="label">{f.label}</T>
              <Well
                label={f.label}
                placeholder={f.hint}
                value={form[f.key]}
                onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                minHeight={TAP}
                keyboardType={f.key === 'contactPhone' ? 'phone-pad' : 'default'}
              />
            </View>
          ))}
          <View style={{ gap: space[2] }}>
            <T variant="label">Main message</T>
            <Well
              label="Main message"
              value={form.message}
              onChangeText={(v) => setForm({ ...form, message: v })}
              minHeight={TAP}
            />
          </View>
          <Button
            variant="accent"
            size="lg"
            block
            icon="check"
            onPress={() => {
              void writeProfile(form).then(() => {
                setProfile(form)
                setEditing(false)
                announce('Emergency card saved on this device.')
              })
            }}
          >
            Save card
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
