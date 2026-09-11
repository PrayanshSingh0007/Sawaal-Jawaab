import { Pressable, ScrollView } from 'react-native'
import { LANGUAGES } from '../data/languages'
import type { LanguageCode } from '../lib/types'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { T } from './Type'

export function LanguagePicker({
  value,
  onChange,
}: {
  value: LanguageCode
  onChange: (code: LanguageCode) => void
}) {
  const { elevation, tap } = useApp()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space[2], paddingVertical: 4 }}
    >
      {LANGUAGES.map((lang) => {
        const active = lang.code === value
        return (
          <Pressable
            key={lang.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={lang.label}
            onPress={() => {
              tap('select')
              onChange(lang.code)
            }}
            style={{
              minHeight: 48,
              justifyContent: 'center',
              paddingHorizontal: space[5],
              borderRadius: R.pill,
              backgroundColor: active ? color.pillDark : color.surface,
              boxShadow: active ? elevation.dark : `${elevation.e1}, ${elevation.rim}`,
            }}
          >
            <T variant="label" style={{ color: active ? '#F7F4F0' : color.ink2 }}>
              {lang.native}
            </T>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
