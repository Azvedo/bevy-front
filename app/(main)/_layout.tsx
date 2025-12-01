import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function MainLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: true,
        headerStyle:{backgroundColor: '#1E1E1E', borderBottomWidth: 2, borderBottomColor: 'rgba(204,204,204,0.2)'},
        headerTitleStyle:{color: '#FFFFFF'},
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: '#1E1E1E' },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search-match"
        options={{
          title: 'Buscar Partidas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-sessions"
        options={{
          title: 'Minhas Sessões',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="soccerball" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="session-details"
        options={{
          title: 'Detalhes da Pelada',
          href: null, // esconde do menu inferior
        }}
      />
    </Tabs>
  );
}