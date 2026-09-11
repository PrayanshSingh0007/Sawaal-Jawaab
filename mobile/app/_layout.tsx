import { useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import { AppProvider, useApp } from '../state/AppState'
import { FlowProvider } from '../state/FlowState'
import { Ground } from '../components/Ground'
import { Toast } from '../components/Toast'
import { Recover } from '../components/Recover'
import '../global.css'

void SplashScreen.preventAutoHideAsync()

/**
 * expo-router renders this instead of a blank screen when a route throws.
 * A communication aid that shows nothing is worse than one that admits it
 * broke and offers a way back.
 */
export function ErrorBoundary({ retry }: { error: Error; retry: () => Promise<void> }) {
  // No providers: this renders in place of the tree that just failed, so it
  // must not depend on anything inside it.
  return <Recover onRetry={() => void retry()} />
}

function Shell() {
  const { ready, toast } = useApp()

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#EDEAE5' }} />

  return (
    <View style={{ flex: 1 }}>
      <Ground />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="show" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen
          name="emergency"
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
      </Stack>
      {toast ? <Toast message={toast} /> : null}
      <StatusBar style="dark" />
    </View>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#EDEAE5' }} />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <FlowProvider>
            <Shell />
          </FlowProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
