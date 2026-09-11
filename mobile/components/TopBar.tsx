import { View } from 'react-native'
import type { ReactNode } from 'react'
import { router } from 'expo-router'
import { space } from '../theme/tokens'
import { IconButton } from './Button'
import { T } from './Type'

export function TopBar({
  title,
  onBack,
  backLabel = 'Go back',
  right,
}: {
  title?: string
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        minHeight: 68,
        marginBottom: space[3],
      }}
    >
      <IconButton
        icon="back"
        label={backLabel}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))}
      />
      {title ? (
        <T variant="h2" style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
          {title}
        </T>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  )
}
