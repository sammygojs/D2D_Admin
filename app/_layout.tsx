import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import 'react-native-reanimated';
import PasscodeScreen from '../components/PasscodeScreen'; // adjust path if needed

export default function RootLayout() {
  const [unlocked, setUnlocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // When app comes back to foreground, relock it
        setUnlocked(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) return null;

  if (!unlocked) {
    return (
      <View style={{ flex: 1 }}>
        <PasscodeScreen onSuccess={() => setUnlocked(true)} />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* <StatusBar style="dark" backgroundColor="#ffffff" /> */}
    </ThemeProvider>
  );
}
