import { getConvocations, getUserProfile, getMyGames} from '@/services/user';
import { clearAuthData } from '@/utils/utils';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type UserData = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nota: number;
  dadosPrestacaoServicos: [
    {
      idPrestador: string;
      valor: number;
      tipoPrestadorServico: 'GOLEIRO' | 'ARBITRO';
      ativo: boolean;
      disponibilidade: {
        diaDaSemana: string;
        horarios: string[];
      };
    }
  ];
};

type Event = {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  dataHora: string;
  minutos: number;
  vagas: number;
  custoPeladeiro: number;
  intensidade: 'leve' | 'moderada' | 'intensa';
  tipoCampo: 'society' | 'campo' | 'quadra';
  donoEvento: {
    id: string;
    nome: string;
    nota: number;
    status: string | null;
  };
  peladeirosInscritos: any[];
  prestadorsInscritos: any[];
};

type Convocation = {
  evento: Event;
  tipoPrestador: string;
};

export type Session = {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  dataHora: string; // ISO datetime: 2025-11-30T14:56:40.766Z
  custoPeladeiro: number;
  custoPrestadorServico: number;
  vagas: number;
  donoEvento: {
    id: string;
    nome: string;
    nota: number;
  };
  peladeirosInscritos: {
    id: string;
    nome: string;
    nota: number;
  }[];
  tipoCampo: string;
  intensidade: string;
};


export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ nome: '', email: '', id: '', telefone: '', nota: 0, dadosPrestacaoServicos: [{ idPrestador: '', valor: 0, tipoPrestadorServico: 'GOLEIRO', ativo: false, disponibilidade: { diaDaSemana: '', horarios: [] } }] }); // Simulação de dados do usuário
  const [viewMode, setViewMode] = useState<'peladeiro' | 'prestador'>('peladeiro');
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [games, setGames] = useState<Event[]>([]);


  const renderCard = (session: Session, providerType: string) => (
    <TouchableOpacity
      key={session.id}
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/session-details',
          params: { id: session.id, from: 'profile', providerId: userData.dadosPrestacaoServicos.find(ds => ds.tipoPrestadorServico === providerType)?.idPrestador, areadyAccepted: 'true' },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sessionSport}>{session.nome}</Text>
          <Text style={styles.sessionLevel}>{session.intensidade}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.metaText}>{session.localizacao}</Text>
        <Text style={styles.metaText}>
          {formatLocalDate(session.dataHora)} às {formatLocalTime(session.dataHora)}
        </Text>
        <Text style={styles.metaText}>
          {session.peladeirosInscritos.length} confirmados • {session.vagas} vagas
        </Text>
      </View>
    </TouchableOpacity>
  );

  const fetchMyGames = async () => {
    try {
      const games = await getMyGames();
      setGames(games);
      console.log("Meus jogos carregados:", games);
      return games;
    } catch (error) {
      console.error("Erro ao buscar meus jogos:", error);
      return [];
    } 
  };

  const formatLocalDate = (iso: string) => {
    if (!iso) return '';
    // se vier com time (ISO) pega só a parte da data
    const datePart = iso.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return dt.toLocaleDateString('pt-BR');
  };

  const formatLocalTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso); // interpreta o ISO e converte para o horário local
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  const fetchUserData = async () => {
    try {
      const data = await getUserProfile();
      // Mock data for testing
      setUserData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMyGames();
  }, []);

  const hasPrestadorData = userData.dadosPrestacaoServicos.length > 0;

  useEffect(() => {
    if (viewMode === 'prestador') {
      fetchConvocations();
    }
  }, [viewMode]);

  useEffect(() => {
    if (hasPrestadorData) {
      setViewMode('prestador');
    }
  }, [convocations]);

  const fetchConvocations = async () => {
    try {
      const convocationsData = await getConvocations();
      setConvocations(convocationsData);
      console.log('Convocações carregadas:', convocationsData);
    } catch (error) {
      console.error('Erro ao buscar convocações:', error);
    }
  }

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
                      onPress={() => router.push('/screens/create-service?role=arbitro')}
                    >
                      <MaterialCommunityIcons name="whistle" size={32} color="#C7FF00" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 8 }}>
                        Cadastre-se como <Text style={{ fontWeight: '900', color: '#C7FF00' }}>Árbitro</Text>
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      onPress={() => router.push('/screens/create-service?role=goleiro')}
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
                <>
                  {userData.dadosPrestacaoServicos.length > 0 ? (
                    userData.dadosPrestacaoServicos.map((servico) => (
                      <View key={servico.idPrestador} style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8, gap: 8, marginBottom: 16 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                          {servico.tipoPrestadorServico || 'Categoria não informada'}
                        </Text>
                        <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                          {servico.ativo || 'Sem descrição cadastrada.'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#C7FF00', fontWeight: '700', fontSize: 16 }}>
                            R$ {servico.valor?.toFixed(2) || '0,00'}/h
                          </Text>
                          <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#C7FF00', borderRadius: 8 }}>
                            <Text style={{ color: '#121212', fontWeight: '700' }}>Editar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={{ backgroundColor: '#2A2A2A', padding: 16, borderRadius: 8 }}>
                      <Text style={{ color: '#CCCCCC', fontSize: 14 }}>
                        Nenhum dado de prestador cadastrado.
                      </Text>
                    </View>
                  )}

                  <View style={{ width: '100%', marginTop: 24 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, marginBottom: 16 }}>
                      Convocações
                    </Text>
                    {convocations.length > 0 ? (
                      convocations.map((convocation) => (
                        renderCard({
                          nome: convocation.evento.nome,
                          id: convocation.evento.id,
                          descricao: convocation.evento.descricao,
                          localizacao: convocation.evento.localizacao,
                          dataHora: convocation.evento.dataHora,
                          custoPeladeiro: convocation.evento.custoPeladeiro,
                          custoPrestadorServico: 0,
                          vagas: convocation.evento.vagas,
                          donoEvento: {
                            id: convocation.evento.donoEvento.id,
                            nome: convocation.evento.donoEvento.nome,
                            nota: convocation.evento.donoEvento.nota,
                          },
                          peladeirosInscritos: [],
                          tipoCampo: convocation.evento.tipoCampo,
                          intensidade: convocation.evento.intensidade
                        }, convocation.tipoPrestador)
                      ))
                    ) : (
                      <View style={{ backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderColor: 'rgba(199,255,0,0.2)', borderWidth: 1 }}>
                        <Text style={{ color: '#CCCCCC', fontSize: 16 }}>
                          Você ainda não foi convocado para nenhum serviço.
                        </Text>
                      </View>
                    )}
                  </View>
                </>
                <View style={{ width: '100%' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, marginBottom: 16, marginTop: 24 }}>
                    Serviços Recentes
                  </Text>
                  {games.length > 0 ? (
                      games.map((game) => (
                        renderCard({
                          nome: game.nome,
                          id: game.id,
                          descricao: game.descricao,
                          localizacao: game.localizacao,
                          dataHora: game.dataHora,
                          custoPeladeiro: game.custoPeladeiro,
                          custoPrestadorServico: 0,
                          vagas: game.vagas,
                          donoEvento: {
                            id: game.donoEvento.id,
                            nome: game.donoEvento.nome,
                            nota: game.donoEvento.nota,
                          },
                          peladeirosInscritos: [],
                          tipoCampo: game.tipoCampo,
                          intensidade: game.intensidade
                        }, "accepted")
                      ))
                    ) : (
                      <View style={{ backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderColor: 'rgba(199,255,0,0.2)', borderWidth: 1 }}>
                        <Text style={{ color: '#CCCCCC', fontSize: 16 }}>
                          Você não possui serviços recentes.
                        </Text>
                      </View>
                    )}
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
  // Estilos faltantes para renderCard
  card: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSport: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionLevel: {
    color: '#C7FF00',
    marginTop: 2,
  },
  cardBody: {
    marginTop: 4,
  },
  metaText: {
    color: '#CCCCCC',
    marginBottom: 4,
  },
});