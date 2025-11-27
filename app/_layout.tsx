import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';


// No explicit anchor so the router uses the Stack order to determine
// the initial screen (the first Stack.Screen entry).

export default function RootLayout() {
  const colorScheme = useColorScheme();


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="screens/splash" options={{headerShown: false}}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="screens/login" options={{ headerShown: false }} />
        <Stack.Screen name="sreens/my-sessions" options={{ title: 'Minhas Sessões' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
