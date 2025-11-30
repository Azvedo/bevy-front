import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAuthData } from '@/utils/utils';
type UserData = {
  name: string;
  email: string;
  // Adicione outros campos conforme necessário
};

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' }); // Simulação de dados do usuário
  
  const handleLogout = async () => {
    await clearAuthData(); // Lógica de logout, como limpar tokens, etc.
    router.push('/'); // Redireciona para a página inicial ou de login
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#C7FF00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 16,
  },
});