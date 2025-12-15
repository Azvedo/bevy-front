import { searchCreatedSessions, searchMySessions } from '@/services/search';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface Props {
  onBack?: () => void;
  joinedSessions?: string[];
  createdSessions?: Session[];
  onEditSession?: (s: Session) => void;
  onDeleteSession?: (id: string) => void;
}

export default function MySessionsScreen({
  onBack,
  joinedSessions = [],
  createdSessions = [],
  onEditSession,
  onDeleteSession,
}: Props) {
  const router = useRouter();

  const [sessionsCreated, setCreatedSessions] = useState<Session[]>([]);
  const [sessionsJoined, setJoinedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);



  const fetchList = async (
    getter: () => Promise<any>,
    setter: React.Dispatch<React.SetStateAction<Session[]>>
  ) => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await getter();
      if (Array.isArray(data)) setter(data as Session[]);
      else setter([]);
    } catch (err: any) {
      console.error('fetchList error', err);
      setFetchError(err?.message || 'Erro ao buscar partidas');
      setter([]);
    } finally {
      setLoading(false);
    }
  };

  // use the generic helper
  const fetchCreatedSessions = () => fetchList(searchCreatedSessions, setCreatedSessions);
  const fetchJoinedSessions = () => fetchList(searchMySessions, setJoinedSessions);

  const fetchAll = async () => {
    await Promise.all([fetchCreatedSessions(), fetchJoinedSessions()]);
  }
  // 3. Substitua o useEffect antigo por isso:
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, []));

  //const confirmed = mockSessions.filter((s) => joinedSessions.includes(s.id));

  const renderSessionCard = (session: Session, isCreated = false) => {
    return (
      <TouchableOpacity
        key={session.id}
        style={[styles.card, isCreated && styles.cardHighlight]}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/session-details-owner',
            params: { id: session.id, from: 'my-sessions' },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sessionSport}>{session.nome}</Text>
            <Text style={styles.sessionLevel}>{session.intensidade}</Text>
          </View>

          <View style={styles.cardActions}>
            {isCreated && onEditSession && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEditSession(session)}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            )}

            {isCreated && onDeleteSession && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDeleteSession(session.id)}
              >
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.metaText}>{session.localizacao}</Text>
          <Text style={styles.metaText}>
            {new Date(session.dataHora).toLocaleDateString('pt-BR')} às{' '}
            {new Date(session.dataHora).toLocaleTimeString('pt-BR')}
          </Text>

          {!isCreated && (
            <Text style={styles.metaText}>
              {session.peladeirosInscritos.length} confirmados
            </Text>
          )}

          {isCreated && (
            <Text style={styles.metaText}>
              {session.vagas - session.peladeirosInscritos.length} vagas
              disponíveis (de {session.vagas})
            </Text>
          )}

          {!!session.custoPeladeiro && (
            <Text style={styles.metaText}>
              R$ {session.custoPeladeiro} por pessoa
            </Text>
          )}

          {session.descricao && (
            <Text style={styles.description}>{session.descricao}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="box-none">
          <ActivityIndicator size="large" color="#C7FF00" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.container}
          data={[]}
          ListHeaderComponent={
            <View>
              {/* SEÇÃO PELADAS CRIADAS (Agora sempre visível) */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Peladas Criadas</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/screens/create-session')}
                    style={styles.addButton}
                  >
                    <Plus size={20} color="#121212" />
                    <Text style={styles.addButtonText}>Criar</Text>
                  </TouchableOpacity>
                </View>

                {/* Renderiza a lista apenas se houver itens */}
                {sessionsCreated.length > 0 ? (
                  <>
                    <Text style={styles.sectionSubtitle}>
                      Você criou {sessionsCreated.length} {sessionsCreated.length === 1 ? 'pelada' : 'peladas'}
                    </Text>
                    {sessionsCreated.map((s) => renderSessionCard(s, true))}
                  </>
                ) : (
                  // Opcional: Mensagem discreta quando não há criadas, mas o botão já está lá
                  <Text style={{ color: '#666', fontSize: 14, fontStyle: 'italic', marginBottom: 8 }}>
                    Você ainda não criou nenhuma pelada.
                  </Text>
                )}
              </View>
            </View>
          }
          renderItem={null}
          keyExtractor={() => Math.random().toString()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212' },
  header: { backgroundColor: '#1E1E1E', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.2)' },
  backButton: { paddingVertical: 6 },
  backText: { color: '#CCCCCC' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 6 },
  container: { padding: 12, paddingBottom: 48 },
  section: { marginBottom: 18 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  sectionSubtitle: { color: '#CCCCCC', marginBottom: 8 },
  card: { backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(204,204,204,0.08)' },
  cardHighlight: { borderColor: '#C7FF00', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionSport: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sessionLevel: { color: '#C7FF00', marginTop: 2 },
  cardActions: { flexDirection: 'row' },
  actionButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginLeft: 8 },
  editButton: { backgroundColor: '#C7FF00' },
  deleteButton: { backgroundColor: '#E53E3E' },
  actionText: { color: '#121212', fontWeight: '700' },
  cardBody: { marginTop: 4 },
  metaText: { color: '#CCCCCC', marginBottom: 4 },
  description: { color: '#CCCCCC', marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.08)', paddingTop: 8 },
  emptyWrap: { height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 40, color: '#CCCCCC', marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#CCCCCC', textAlign: 'center', paddingHorizontal: 24 },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C7FF00',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4
  },
  addButtonText: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 12
  },
});
