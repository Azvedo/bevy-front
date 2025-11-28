import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type Session = {
  id: string;
  sport: string;
  location: string;
  date: string; // ISO date
  time: string; // hh:mm
  level: string;
  participants: string[];
  totalSpots: number;
  price?: string | number;
  description?: string;
};

export const mockSessions: Session[] = [
  {
    id: '1',
    sport: 'Futebol',
    location: 'Parque Ibirapuera',
    date: '2025-11-10',
    time: '18:00',
    level: 'Casual',
    participants: ['João', 'Maria', 'Pedro', 'Ana'],
    totalSpots: 10,
  },
  {
    id: '2',
    sport: 'Futebol',
    location: 'Campo do Pacaembu',
    date: '2025-11-11',
    time: '16:00',
    level: 'Intermediário',
    participants: ['Carlos', 'Julia', 'Rafael'],
    totalSpots: 14,
  },
  {
    id: '3',
    sport: 'Futebol',
    location: 'Parque Villa-Lobos',
    date: '2025-11-09',
    time: '09:00',
    level: 'Casual',
    participants: ['Fernanda', 'Lucas', 'Beatriz', 'Marcos', 'Camila'],
    totalSpots: 12,
  },
  {
    id: '4',
    sport: 'Futebol',
    location: 'Arena Morumbi',
    date: '2025-11-12',
    time: '14:00',
    level: 'Avançado',
    participants: ['Roberto', 'Sandra'],
    totalSpots: 16,
  },
];

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

 const confirmed = mockSessions;

  const renderSessionCard = (session: Session, isCreated = false) => {
    return (
      <TouchableOpacity
        key={session.id}
        style={[styles.card, isCreated && styles.cardHighlight]}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/(main)/session-details',
            params: { id: session.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sessionSport}>{session.sport}</Text>
            <Text style={styles.sessionLevel}>{session.level}</Text>
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
          <Text style={styles.metaText}>{session.location}</Text>
          <Text style={styles.metaText}>
            {new Date(session.date).toLocaleDateString('pt-BR')} às {session.time}
          </Text>
          {!isCreated && (
            <Text style={styles.metaText}>{session.participants.length} confirmados</Text>
          )}
          {isCreated && (
            <Text style={styles.metaText}>
              {session.totalSpots - session.participants.length} vagas disponíveis (de {session.totalSpots})
            </Text>
          )}
          {session.price && <Text style={styles.metaText}>{session.price} por pessoa</Text>}
          {session.description && <Text style={styles.description}>{session.description}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack ? onBack : () => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Sessões</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.container}
        data={[]}
        ListHeaderComponent={
          <View>
            {createdSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Peladas Criadas</Text>
                <Text style={styles.sectionSubtitle}>
                  Você criou {createdSessions.length} {createdSessions.length === 1 ? 'pelada' : 'peladas'}
                </Text>
                {createdSessions.map((s) => renderSessionCard(s, true))}
              </View>
            )}

            {confirmed.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sessões Confirmadas</Text>
                <Text style={styles.sectionSubtitle}>
                  Você tem {confirmed.length} {confirmed.length === 1 ? 'sessão confirmada' : 'sessões confirmadas'}
                </Text>
                {confirmed.map((s) => renderSessionCard(s, false))}
              </View>
            ) : createdSessions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyTitle}>Nenhuma sessão ainda</Text>
                <Text style={styles.emptyText}>Encontre sessões para participar ou crie a sua própria!</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={null}
        keyExtractor={() => Math.random().toString()}
      />
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
});
