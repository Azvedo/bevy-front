import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAuthData } from '@/utils/utils';
import { getUserProfile } from '@/services/user';
import Entypo from '@expo/vector-icons/Entypo';

type UserData = {
  nome: string;
  email: string;
  id: string;
  nota?: number;
  telefone?: string;
  dadosPrestadorServico?: {
    descricao: string;
    categoria: string;
    precoHora: number;
  };
  // Adicione outros campos conforme necessário
};

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ nome: '', email: '', id: '' }); // Simulação de dados do usuário

  const fetchUserData = async () => {
    try {
      console.log('Buscando dados do usuário...');
      const data = await getUserProfile();
      setUserData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await clearAuthData(); // Lógica de logout, como limpar tokens, etc.
    router.push('/'); // Redireciona para a página inicial ou de login
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      <View style={styles.section}>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <View style={{ backgroundColor: '#333333', padding: 12, borderRadius: 50, position: 'relative' }}>
              <Entypo name="user" size={50} color="white" />
              {userData.nota !== undefined && (
                <View style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  backgroundColor: '#C7FF00',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Entypo name="star" size={12} color="#121212" />
                  <Text style={{ color: '#121212', fontWeight: '700', fontSize: 12 }}>
                    {userData.nota.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 24 }}>
                {userData.nome}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Entypo name="mail" size={16} color="#C7FF00" />
                <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                  {userData.email}
                </Text>
              </View>

              {userData.telefone && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Entypo name="phone" size={16} color="#C7FF00" />
                  <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                    {userData.telefone}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ width: '100%' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, marginBottom: 16 }}>
              Histórico de Peladas
            </Text>
            <View style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8 }}>
              <Text style={{ color: '#CCCCCC', fontSize: 16 }}>
                Você ainda não participou de nenhuma pelada.
              </Text>
            </View>
          </View>
        </View>



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
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 24,
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