import { View } from 'react-native'
import { Slot } from 'expo-router'
import { TabBar } from '../../components/TabBar'

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <TabBar />
    </View>
  )
}
