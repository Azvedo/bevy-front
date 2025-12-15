import { searchServices } from '@/services/search';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Filter, Radar } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// type and labels
// Prestador types available for filtering
type PrestadorType = 'ARBITRO' | 'GOLEIRO';
const PRESTADOR_TYPES: PrestadorType[] = ['ARBITRO', 'GOLEIRO'];
const PRESTADOR_LABELS: Record<PrestadorType, string> = { ARBITRO: 'Árbitro', GOLEIRO: 'Goleiro' };

type DayTime = 'manha' | 'tarde' | 'noite';
const DAY_TIMES: DayTime[] = ['manha', 'tarde', 'noite'];
const DAY_TIME_LABELS: Record<DayTime, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

type WeekDay = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
const WEEK_DAYS: WeekDay[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

type FetchOverrides = {
  queryTipoPrestador?: PrestadorType[];
  queryDayTime?: DayTime[];
  queryWeekDay?: WeekDay[];
  searchName?: string;
  [k: string]: any;
};

export type Service = {
  id: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  tipoPrestador?: string;
  custoPrestadorServico?: number;
  disponibilidade?: { diaDaSemana: string; horarios: string[] }[];
  prestador?: { id: string; nome: string; nota?: number };
};

type PrestadorServico = [
  {
    prestadorId: string;
    peladeiroId: string;
    nome: string;
    nota: number;
    valor: number;
    tipoPrestadorServico: 'GOLEIRO' | 'ARBITRO';
    statusPrestador: 'A_CONFIRMAR' | 'CONFIRMADO' | 'CANCELADO';
    disponibilidade: {
      diaDaSemana: string;
      horarios: string[];
    }[];
  }
];

const DEFAULT_DISTANCE = 20000; // default distance
const MAX_DISTANCE = 50000; // max slider distance 
const DISTANCE_STEP = 1000; // 1 step

interface SearchServiceScreenProps {
  onBack?: () => void;
  latitude?: number;
  longitude?: number;
  day?: string;
  period?: string;
}


export default function SearchServiceScreen({ onBack, latitude, longitude, day, period }: SearchServiceScreenProps) {
  const router = useRouter();

  const [queryDayTime, setQueryDayTime] = useState<DayTime[]>([]);
  const [queryWeekDay, setQueryWeekDay] = useState<WeekDay[]>([]);
  const [queryTipoPrestador, setQueryTipoPrestador] = useState<PrestadorType[]>([]);
  const [searchName, setSearchName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [services, setServices] = useState<PrestadorServico[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchName);
  const [distancia, setDistancia] = useState<number>(DEFAULT_DISTANCE);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [tempDist, setTempDist] = useState<number>(DEFAULT_DISTANCE);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 200); // debounce delay in ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchName]);

  const filteredServices = useMemo(() => {
    const nameLower = (debouncedSearch || '').trim().toLowerCase();
    if (!nameLower) return services;
    return services.filter(s => s.nome.toLowerCase().includes(nameLower));
  }, [services, debouncedSearch]);

  // Fetch services/providers from backend using available filters
  const fetchServices = async (overrides?: FetchOverrides & { lat?: number | null; lon?: number | null }) => {
    setLoading(true);
    setFetchError(null);
    try {
      const name = overrides?.searchName !== undefined ? overrides.searchName : searchName;
      const tiposPrestador = overrides?.queryTipoPrestador ?? queryTipoPrestador;
      const weekDays = overrides?.queryWeekDay ?? queryWeekDay;
      const dayTimes = overrides?.queryDayTime ?? queryDayTime;
      const params = new URLSearchParams();
      const usedDistance = overrides?.distancia ?? distancia ?? DEFAULT_DISTANCE;
      params.append('distancia', String(usedDistance));
      const usedLat = overrides?.lat ?? (latitude ?? 200);
      const usedLon = overrides?.lon ?? (longitude ?? 200);
      if (usedLat != null) params.append('lat', String(usedLat));
      if (usedLon != null) params.append('lon', String(usedLon));
      console.log('Fetching services with lat/lon:', usedLat, usedLon);

      if (name) params.append('nome', name.trim());
      if (weekDays && weekDays.length) weekDays.forEach(d => params.append('diasDaSemana', d));
      if (dayTimes && dayTimes.length) dayTimes.forEach(dt => params.append('horarios', dt));
      if (tiposPrestador && tiposPrestador.length) tiposPrestador.forEach(t => params.append('tipoPrestador', t));

      const data = await searchServices(params);

      // Expecting an array of services/providers from API; fall back gracefully
      if (Array.isArray(data)) setServices(data as PrestadorServico[]);
      else setServices([]);
    } catch (err: any) {
      console.error('fetchServices error', err);
      setFetchError(err?.message || 'Erro ao buscar serviços');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial services on mount
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCard = (service: PrestadorServico[0]) => (
    <TouchableOpacity
      key={service.prestadorId}
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/session-details',
          params: { id: service.prestadorId, from: 'search' },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sessionSport}>{service.nome}</Text>
          <Text style={styles.sessionLevel}>{PRESTADOR_LABELS[service.tipoPrestadorServico] ?? service.tipoPrestadorServico ?? ''}</Text>
        </View>
        {service.nota != null && service.nota >= 0 && (
          <Text style={{ color: '#C7FF00', fontSize: 16, fontWeight: '600' }}>
            ⭐ {service.nota.toFixed(1)}
          </Text>
        )}
      </View>

      <View style={styles.cardBody}>
        {service.valor != null && service.valor > 0 && (
          <Text style={styles.metaText}>
            💰 R$ {Number(service.valor).toFixed(2).replace('.', ',')}
          </Text>
        )}
        {service.disponibilidade && service.disponibilidade.length > 0 && (
          <Text style={styles.metaText}>
            📅 {service.disponibilidade.map(d => WEEK_DAY_LABELS[d.diaDaSemana as WeekDay] ?? d.diaDaSemana).join(', ')}
          </Text>
        )}
        {service.statusPrestador && (
          <Text style={styles.metaText}>
            📊 Status: {service.statusPrestador.replace(/_/g, ' ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );


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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar pelo nome do prestador ou serviço"
          placeholderTextColor="rgba(204,204,204,0.5)"
          value={searchName}
          onChangeText={setSearchName}
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={() => {
            setTempDist(distancia);
            setDistanceModalVisible(true);
          }}
          style={[styles.filterButton, { marginHorizontal: 6 }]}
          accessibilityLabel="Ajustar distância"
        >
          <Radar color="#C7FF00" width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.filterButton}
          accessibilityLabel="Abrir filtros"
        >
          <Filter color="#C7FF00" width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Modal de distância */}
      <Modal visible={distanceModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setDistanceModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={[styles.modalCard, { maxWidth: 420, width: '100%' }]}>
                <Text style={styles.modalTitle}>Distância</Text>
                <View style={{ marginBottom: 12 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Distância (km)</Text>
                    <Text style={{ color: 'white', marginBottom: 8 }}>{(tempDist / 1000).toFixed(0)} km</Text>
                    <Slider
                      minimumValue={0}
                      maximumValue={MAX_DISTANCE}
                      step={DISTANCE_STEP}
                      value={tempDist}
                      onValueChange={(v) => setTempDist(Math.round(v / DISTANCE_STEP) * DISTANCE_STEP)}
                      minimumTrackTintColor="#C7FF00"
                      maximumTrackTintColor="#2A2A2A"
                      thumbTintColor="#C7FF00"
                      style={{ width: '100%', height: 40 }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setDistanceModalVisible(false)}
                    style={[styles.modalButton, { backgroundColor: '#2A2A2A', minWidth: 100 }]}
                  >
                    <Text style={{ color: 'white' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      setDistancia(tempDist);
                      await fetchServices({ distancia: tempDist });
                      setDistanceModalVisible(false);
                    }}
                    style={[styles.modalButton, { backgroundColor: '#C7FF00', minWidth: 100 }]}
                  >
                    <Text style={{ color: '#121212', fontWeight: '700' }}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de filtros */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Filtros</Text>

                {/* Dia da semana */}
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Dia da Semana</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {WEEK_DAYS.map((weekDay) => {
                        const active = queryWeekDay.includes(weekDay);
                        return (
                          <TouchableOpacity
                            key={weekDay}
                            onPress={() =>
                              setQueryWeekDay(prev => prev.includes(weekDay) ? prev.filter(p => p !== weekDay) : [...prev, weekDay])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{WEEK_DAY_LABELS[weekDay]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Periodo do Dia */}
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Período do Dia</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {DAY_TIMES.map((dayTime) => {
                        const active = queryDayTime.includes(dayTime);
                        return (
                          <TouchableOpacity
                            key={dayTime}
                            onPress={() =>
                              setQueryDayTime(prev => prev.includes(dayTime) ? prev.filter(p => p !== dayTime) : [...prev, dayTime])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{DAY_TIME_LABELS[dayTime]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Tipo do Campo */}
                {/* Tipo do Prestador */}
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Tipo do Prestador</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {PRESTADOR_TYPES.map((pt) => {
                        const active = queryTipoPrestador.includes(pt);
                        return (
                          <TouchableOpacity
                            key={pt}
                            onPress={() =>
                              setQueryTipoPrestador(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{PRESTADOR_LABELS[pt]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={async () => {
                      setQueryDayTime([]); setQueryTipoPrestador([]); setQueryWeekDay([]); setSearchName('');
                      await fetchServices({
                        queryDayTime: [],
                        queryTipoPrestador: [],
                        queryWeekDay: [],
                        searchName: '',
                      });
                      setModalVisible(false);
                    }}
                    style={[styles.modalButton, { backgroundColor: '#2A2A2A' }]}
                  >
                    <Text style={{ color: 'white' }}>Limpar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await fetchServices();
                      setModalVisible(false);
                    }}
                    style={[styles.modalButton, { backgroundColor: '#C7FF00' }]}
                  >
                    <Text style={{ color: '#121212', fontWeight: '700' }}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        contentContainerStyle={styles.container}
        data={filteredServices}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.prestadorId}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            {loading ? (
              <View style={styles.loadingOverlay} pointerEvents="box-none">
                <ActivityIndicator size="large" color="#C7FF00" />
              </View>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🔎</Text>
                <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
                <Text style={styles.emptyText}>Ajuste os filtros para encontrar prestadores próximos.</Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212' },
  container: { padding: 12, paddingBottom: 48 },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(204, 204, 204, 0.2)',
    borderRadius: 8,
    color: 'white',
  },
  card: { backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(204,204,204,0.08)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionSport: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sessionLevel: { color: '#C7FF00', marginTop: 2 },
  cardBody: { marginTop: 4 },
  metaText: { color: '#CCCCCC', marginBottom: 4 },
  emptyWrap: { height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 40, color: '#CCCCCC', marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#CCCCCC', textAlign: 'center', paddingHorizontal: 24 },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#121212', alignItems: 'center' },
  searchInput: { flex: 1, padding: 10, backgroundColor: '#2A2A2A', borderRadius: 8, color: 'white', borderWidth: 1, borderColor: 'rgba(204,204,204,0.2)' },
  filterButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(199,255,0,0.08)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  levelChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.08)'
  },
  levelChipActive: {
    backgroundColor: '#C7FF00',
    borderColor: '#C7FF00'
  },
  levelChipText: { color: 'white' },
  levelChipTextActive: { color: '#121212', fontWeight: '700' },
  filterCard: {
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.2)',
    borderRadius: 12,
  },
  filterLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
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
  distButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(204,204,204,0.12)'
  },
  distButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  distTrackWrap: { flex: 1, alignItems: 'center' },
  distTrack: { width: '100%', height: 8, backgroundColor: '#2A2A2A', borderRadius: 8, overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: '#C7FF00' },
  distValue: { color: 'white', marginTop: 6, fontSize: 12, textAlign: 'center' },
});

