import { getUserProfile } from '@/services/user';
import { clearAuthData } from '@/utils/utils';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [viewMode, setViewMode] = useState<'peladeiro' | 'prestador'>('peladeiro');
  const fetchUserData = async () => {
    try {
      const data = await getUserProfile();
      // Mock data for testing
      const data2 = {
        nome: 'João Silva',
        email: 'joao.silva@example.com',
        id: '123456',
        nota: 4.5,
        telefone: '(11) 98765-4321',
        dadosPrestadorServico: {
          descricao: 'Árbitro profissional com 5 anos de experiência',
          categoria: 'Árbitro',
          precoHora: 50.00
        }
      };
      setUserData(data2);
      // console.log('Dados do usuário carregados:', data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const hasPrestadorData = Boolean(userData?.dadosPrestadorServico);

  const handleSelectMode = (mode: 'peladeiro' | 'prestador') => {
    if (mode === 'prestador' && !hasPrestadorData) return;
    setViewMode(mode);
  };

  const handleLogout = async () => {
    await clearAuthData(); // Lógica de logout, como limpar tokens, etc.
    router.push('/'); // Redireciona para a página inicial ou de login
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}

      >
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

            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  viewMode === 'peladeiro' && styles.selectorOptionActive
                ]}
                onPress={() => handleSelectMode('peladeiro')}
              >
                <Text style={[
                  styles.selectorLabel,
                  viewMode === 'peladeiro' && styles.selectorLabelActive
                ]}>Peladeiro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  viewMode === 'prestador' && styles.selectorOptionActive,
                  !hasPrestadorData && styles.selectorOptionDisabled
                ]}
                disabled={!hasPrestadorData}
                onPress={() => handleSelectMode('prestador')}
              >
                <Text style={[
                  styles.selectorLabel,
                  viewMode === 'prestador' && styles.selectorLabelActive,
                  !hasPrestadorData && styles.selectorLabelDisabled
                ]}>Prestador</Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'peladeiro' ? (
              <>
                <View style={{ width: '100%' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, marginBottom: 16 }}>
                    Histórico de Peladas
                  </Text>
                  <View style={{ backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderColor: 'rgba(199,255,0,0.2)', borderWidth: 1 }}>
                    <Text style={{ color: '#CCCCCC', fontSize: 16 }}>
                      Você ainda não participou de nenhuma pelada.
                    </Text>
                  </View>
                </View>

                <View style={{ width: '100%', marginTop: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FontAwesome name="money" size={24} color="#C7FF00" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20 }}>
                      Oportunidades de Renda Extra
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}
                    >
                      <MaterialCommunityIcons name="whistle" size={32} color="#C7FF00" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 8 }}>
                        Cadastre-se como <Text style={{ fontWeight: '900', color: '#C7FF00' }}>Árbitro</Text>
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                    >
                      <MaterialCommunityIcons name="handball" size={32} color="#C7FF00" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 8, }}>
                        Cadastre-se como <Text style={{ fontWeight: '900', color: '#C7FF00' }}>Goleiro</Text>
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </>
            ) : (
              <View style={{ width: '100%' }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, marginBottom: 16 }}>
                  Dados de Prestador
                </Text>
                <View style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, gap: 12 }}>
                  {userData.dadosPrestadorServico ? (
                    <>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                        {userData.dadosPrestadorServico.categoria || 'Categoria não informada'}
                      </Text>
                      <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                        {userData.dadosPrestadorServico.descricao || 'Sem descrição cadastrada.'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#C7FF00', fontWeight: '700', fontSize: 16 }}>
                          R$ {userData.dadosPrestadorServico.precoHora?.toFixed(2) || '0,00'}/h
                        </Text>
                        <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#C7FF00', borderRadius: 8 }}>
                          <Text style={{ color: '#121212', fontWeight: '700' }}>Editar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                      Nenhum dado de prestador cadastrado.
                    </Text>
                  )}
                </View>

                <View style={{ marginTop: 16, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderColor: 'rgba(199,255,0,0.2)', borderWidth: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
                    Serviços recentes
                  </Text>
                  <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                    Nenhum serviço realizado ainda. Divulgue seu trabalho para receber pedidos.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={{ marginTop: 8 }}>
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  selectorOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.2)',
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
  },
  selectorOptionActive: {
    borderColor: '#C7FF00',
    backgroundColor: 'rgba(199,255,0,0.08)',
  },
  selectorOptionDisabled: {
    opacity: 0.5,
  },
  selectorLabel: {
    color: '#CCCCCC',
    fontWeight: '600',
    fontSize: 16,
  },
  selectorLabelActive: {
    color: '#C7FF00',
  },
  selectorLabelDisabled: {
    color: '#888888',
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