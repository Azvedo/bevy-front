import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Impede swipe para voltar
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Impede swipe para voltar
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          headerShown: false,
          gestureEnabled: false // Impede swipe para voltar
        }} 
      />
      <Stack.Screen
        name="verify-code"
        options={{
          headerShown: false,
          gestureEnabled: false // Impede swipe para voltar
        }}      
      />
      <Stack.Screen
        name="new-password"
        options={{
          headerShown: false,
          gestureEnabled: false // Impede swipe para voltar
        }}      
      />
    </Stack>
  );
}