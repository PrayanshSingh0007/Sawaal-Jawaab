import { Modal, Pressable, ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { radius as R, space } from '../theme/tokens'
import { Glass } from './Glass'
import { IconButton } from './Button'
import { T } from './Type'
import { useApp } from '../state/AppState'

/**
 * A bottom sheet. The system modal handles focus and the back gesture, so the
 * only thing left to get right is the surface — dense liquid glass over a
 * blurred, dimmed page.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  const { settings } = useApp()

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Close"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(26,23,20,0.34)' }}
      >
        {!settings.highContrast ? (
          <BlurView intensity={14} tint="dark" style={{ flex: 1 }} />
        ) : null}
      </Pressable>

      <Glass
        dense
        radius={R.sheet}
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          maxHeight: '88%',
        }}
      >
        <View style={{ padding: space[5], paddingBottom: insets.bottom + space[6] }}>
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: 'rgba(163,156,147,0.5)',
              alignSelf: 'center',
              marginBottom: space[5],
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[3],
              marginBottom: space[5],
            }}
          >
            <T variant="h1" style={{ flex: 1 }}>
              {title}
            </T>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </Glass>
    </Modal>
  )
}
