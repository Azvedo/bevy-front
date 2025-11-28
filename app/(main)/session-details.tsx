import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { mockSessions, Session } from './my-sessions';

const COLORS = {
  background: '#121212',
  card: '#1E1E1E',
  accent: '#C7FF00',
  text: '#FFFFFF',
  textMuted: '#CCCCCC',
  borderSoft: 'rgba(204,204,204,0.15)',
};

const CURRENT_USER_NAME = 'Visi'; // depois você troca para o nome do usuário logado

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const session: Session | undefined = useMemo(
    () => mockSessions.find((s) => s.id === String(id)),
    [id]
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>{'< Voltar'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Sessão não encontrada</Text>
          <Text style={styles.notFoundText}>
            Não foi possível localizar essa pelada.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const spotsLeft = session.totalSpots - session.participants.length;
  const isJoined = session.participants.includes(CURRENT_USER_NAME);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Voltar'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{session.sport}</Text>
      </View>

      {/* Hero com gradiente e local */}
      <LinearGradient
        colors={['#3F4B1F', COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.locationPill}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{session.location}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Informações da Sessão */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Sessão</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>🕒</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data e Hora</Text>
              <Text style={styles.infoValue}>
                {new Date(session.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.infoSubValue}>{session.time}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>🏆</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nível</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{session.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>👥</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vagas</Text>
              <Text style={styles.infoValue}>
                {spotsLeft} vagas disponíveis (de {session.totalSpots})
              </Text>
            </View>
          </View>

          {session.price && (
            <>
              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Text style={styles.infoIcon}>💲</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Valor</Text>
                  <Text style={styles.infoValue}>
                    R$ {Number(session.price).toFixed(2).replace('.', ',')} por pessoa
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Card Participantes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Participantes</Text>

          {session.participants.map((name) => (
            <View key={name} style={styles.participantRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {name.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.participantName}>{name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão Participar (só aparece se ainda não estiver na pelada) */}
      {!isJoined && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => {
              // aqui depois você chama a API para entrar na pelada
              console.log('Participar da sessão', session.id);
            }}
          >
            <Text style={styles.primaryButtonText}>Participar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  hero: {
    height: 140,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.text,
  },
  locationText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 32,
    alignItems: 'center',
    marginTop: 2,
  },
  infoIcon: {
    color: COLORS.accent,
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSubValue: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderSoft,
    marginVertical: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  tagText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '700',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: '#121212',
    fontWeight: '700',
  },
  participantName: {
    color: COLORS.text,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  notFoundTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  notFoundText: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
