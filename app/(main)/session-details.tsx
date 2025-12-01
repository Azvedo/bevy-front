import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentScreen from '../screens/payment';
import {
  EventoDTO,
  getEventById,
  getSubscribedEvents,
  participateInEvent,
} from '@/services/events';

const COLORS = {
  background: '#121212',
  card: '#1E1E1E',
  accent: '#C7FF00',
  text: '#FFFFFF',
  textMuted: '#CCCCCC',
  borderSoft: 'rgba(204,204,204,0.15)',
};

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id?: string; from?: string }>();

  const [event, setEvent] = useState<EventoDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [showPayment, setShowPayment] = useState(false);


  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // Busca detalhes e verifica se este evento está na lista de inscritos
        const [evt, subscribed] = await Promise.all([
          getEventById(String(id)),
          getSubscribedEvents().catch(() => [] as EventoDTO[]),
        ]);
        setEvent(evt);
        const joined = Array.isArray(subscribed)
          ? subscribed.some((e) => String(e.id) === String(id))
          : false;
        setIsJoined(joined);
      } catch (err) {
        console.error('Erro ao buscar evento', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const spotsInfo = useMemo(() => {
    if (!event) return null;
    const current = event.peladeirosInscritos?.length ?? 0;
    const vagas = event.vagas ?? 0;
    return {
      current,
      vagas,
      left: Math.max(vagas - current, 0),
    };
  }, [event]);
  const paymentSession = useMemo(() => {
  if (!event) return null;

  const d = new Date(event.dataHora);
  const date = d.toISOString().slice(0, 10); // '2025-12-01'
  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const price = `R$ ${Number(event.custoPeladeiro)
    .toFixed(2)
    .replace('.', ',')}`;

  return {
    id: event.id,
    sport: event.nome,
    location: event.localizacao,
    date,
    time,
    price,
  };
}, [event]);


  const handleParticipate = () => {
  if (!event) return;
  setShowPayment(true);
};
const handleBack = () => {
  if (from === 'search') {
    router.push('/search-match');
    return;
  }
  if (from === 'my-sessions') {
    router.push('/my-sessions');
    return;
  }
  // fallback: histórico normal
  router.back();
};

const handlePaymentSuccess = async () => {
  if (!id) return;
  try {
    setIsJoining(true);
    await participateInEvent(String(id)); // chama o endpoint real
    setIsJoined(true);
    const refreshed = await getEventById(String(id));
    setEvent(refreshed);
  } catch (err) {
    console.error('Erro ao confirmar participação após pagamento', err);
  } finally {
    setIsJoining(false);
    setShowPayment(false);
  }
};


  if (isLoading || !event) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.loadingText}>Carregando pelada...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dateObj = new Date(event.dataHora);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']} >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeftIcon color={COLORS.textMuted} size={18} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>


        <Text style={styles.headerTitle}>{event.nome}</Text>
      </View>

      {/* Hero com gradiente + local */}
      <LinearGradient
        colors={['#3F4B1F', COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.locationPill}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{event.localizacao}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações da Sessão */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Sessão</Text>

          {/* Data e Hora */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>🕒</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data e Hora</Text>
              <Text style={styles.infoValue}>
                {dateObj.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.infoSubValue}>
                {dateObj.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Nível / Intensidade */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>🏆</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nível</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{event.intensidade}</Text>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Vagas */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Text style={styles.infoIcon}>👥</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vagas</Text>
              {spotsInfo && (
                <Text style={styles.infoValue}>
                  {spotsInfo.left} vagas disponíveis (de {spotsInfo.vagas})
                </Text>
              )}
            </View>
          </View>

          {/* Valor por pessoa */}
          {'custoPeladeiro' in event && event.custoPeladeiro != null && (
            <>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Text style={styles.infoIcon}>💲</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Valor</Text>
                  <Text style={styles.infoValue}>
                    R$ {Number(event.custoPeladeiro).toFixed(2).replace('.', ',')}{' '}
                    por pessoa
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Participantes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Participantes</Text>

          {(event.peladeirosInscritos ?? []).map((p: any) => {
            const nome = p?.nome ?? 'Participante';
            const initial = String(nome).trim().charAt(0).toUpperCase();
            return (
              <View key={String(p?.id ?? nome)} style={styles.participantRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
                <Text style={styles.participantName}>{nome}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Botão Participar (só mostra se ainda não estiver inscrito) */}
      {!isJoined && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            disabled={isJoining}
            onPress={handleParticipate}
          >
            <Text style={styles.primaryButtonText}>
              {isJoining ? 'Inscrevendo...' : 'Participar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {paymentSession && (
        <PaymentScreen
          visible={showPayment}
          session={paymentSession}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: COLORS.textMuted, fontSize: 14 },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginTop: 6 },

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
  locationIcon: { fontSize: 16, marginRight: 8, color: COLORS.text },
  locationText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },

  scroll: { flex: 1 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoIconWrap: { width: 32, alignItems: 'center', marginTop: 2 },
  infoIcon: { color: COLORS.accent, fontSize: 18 },
  infoContent: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
  infoValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  infoSubValue: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  separator: { height: 1, backgroundColor: COLORS.borderSoft, marginVertical: 12 },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  tagText: { color: '#121212', fontSize: 12, fontWeight: '700' },

  participantRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: { color: '#121212', fontWeight: '700' },
  participantName: { color: COLORS.text, fontSize: 14 },

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
  primaryButtonText: { color: '#121212', fontSize: 16, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: COLORS.textMuted },
});
