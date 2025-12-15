import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(main)"
          options={{
            headerShown: false,
            gestureEnabled: false // Impede voltar para auth após login
          }}
        />
        <Stack.Screen name="screens/create-session" options={{ title: 'Criar Pelada', headerShown: true, headerStyle: { backgroundColor: '#1E1E1E', }, headerTintColor: '#ffffffff' }} />
        <Stack.Screen name="screens/create-service" options={{ title: 'Criar Serviço', headerShown: true, headerStyle: { backgroundColor: '#1E1E1E', }, headerTintColor: '#ffffffff' }} />
        <Stack.Screen name="screens/search-service" options={{ title: 'Prestador de Serviço', headerShown: true, headerStyle: { backgroundColor: '#1E1E1E', }, headerTintColor: '#ffffffff' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
