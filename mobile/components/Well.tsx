import { TextInput, View } from 'react-native'
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native'
import { forwardRef, useState } from 'react'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'

/** `style` targets the well itself, not the input inside it. */
export interface WellProps extends Omit<TextInputProps, 'style'> {
  label: string
  /** Uses the larger question type rather than body type. */
  big?: boolean
  minHeight?: number
  style?: StyleProp<ViewStyle>
}

/** A pressed-in well. Text sits inside the surface rather than on top of it. */
export const Well = forwardRef<TextInput, WellProps>(function Well(
  { label, big, minHeight = 120, style, ...rest },
  ref,
) {
  const { elevation, t } = useApp()
  const [focused, setFocused] = useState(false)
  const size = big ? t.h2 : t.body

  return (
    <View
      style={[
        {
          borderRadius: R.tile,
          backgroundColor: color.surfaceSunk,
          paddingHorizontal: space[5],
          paddingVertical: space[4],
          minHeight,
          boxShadow: focused ? `${elevation.sunk}, 0 0 0 3px rgba(242,98,46,0.28)` : elevation.sunk,
        },
        style,
      ]}
    >
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        multiline
        placeholderTextColor={color.ink2}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          fontFamily: 'Inter_500Medium',
          fontSize: size,
          lineHeight: Math.round(size * 1.4),
          color: color.ink,
          textAlignVertical: 'top',
        }}
        {...rest}
      />
    </View>
  )
})
