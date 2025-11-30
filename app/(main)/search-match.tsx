import { searchSessions } from '@/services/search';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Filter } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// type and labels
type Level = 'leve' | 'moderado' | 'disputado';
const LEVELS: Level[] = ['leve', 'moderado', 'disputado'];
const LEVEL_LABELS: Record<Level, string> = { leve: 'Leve', moderado: 'Moderado', disputado: 'Disputado' };

type Price = 'gratis' | '1-10' | '11-20' | '21+';
const PRICE: Price[] = ['gratis', '1-10', '11-20', '21+'];
const PRICE_LABELS: Record<Price, string> = {
  gratis: 'Grátis',
  '1-10': 'R$1 - R$10',
  '11-20': 'R$11 - R$20',
  '21+': 'R$21+',
}; 

type FieldType = 'society' | 'grama' | 'salao' | 'areia' | 'terra' | 'rua' | 'outros';
const FIELD_TYPES: FieldType[] = ['society', 'grama', 'salao', 'areia', 'terra', 'rua', 'outros'];
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  society: 'Society',
  grama: 'Grama',
  salao: 'Salão',
  areia: 'Areia',
  terra: 'Terra',
  rua: 'Rua',
  outros: 'Outros',
};

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
  queryLevel?: Level[];
  queryPrice?: Price[];
  queryFieldType?: FieldType[];
  queryDayTime?: DayTime[];
  queryWeekDay?: WeekDay[];
  searchName?: string;
  [k: string]: any;
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

// Mock API URL and params 
const distance = 20000; // example distance in km


export default function SearchMatchScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  
  const [queryLevel, setQueryLevel] = useState<Level[]>([]);
  const [queryPrice, setQueryPrice] = useState<Price[]>([]);
  const [queryFieldType, setQueryFieldType] = useState<FieldType[]>([]);
  const [queryDayTime, setQueryDayTime] = useState<DayTime[]>([]);
  const [queryWeekDay, setQueryWeekDay] = useState<WeekDay[]>([]);
  const [searchName, setSearchName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchName);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 200); // debounce delay in ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchName]);

  const filteredSessions = useMemo(() => {
    const nameLower = (debouncedSearch || '').trim().toLowerCase();
    if(!nameLower) return sessions;
    return sessions.filter(session => 
      session.nome.toLowerCase().includes(nameLower)
    );
  }, [sessions, debouncedSearch]);

  // Fetch sessions from backend using available filters
  const fetchSessions = async (overrides?: FetchOverrides & { lat?: number | null; lon?: number | null }) => {
    setLoading(true);
    setFetchError(null);
    try {
      const name = overrides?.searchName !== undefined ? overrides.searchName : searchName;
      const fieldTypes = overrides?.queryFieldType ?? queryFieldType;
      const prices = overrides?.queryPrice ?? queryPrice;
      const levels = overrides?.queryLevel ?? queryLevel;
      const weekDays = overrides?.queryWeekDay ?? queryWeekDay;
      const dayTimes = overrides?.queryDayTime ?? queryDayTime;
      const params = new URLSearchParams();
      params.append('distancia', String(distance));
      // Prefer explicit overrides (passed when location is just obtained),
      // otherwise use component state `lat`/`lon`. Do NOT fall back to a
      // placeholder like 200 — only send coords when available.
      const usedLat = overrides?.lat ?? (lat ?? 200);
      const usedLon = overrides?.lon ?? (lon ?? 200);
      if (usedLat != null) params.append('lat', String(usedLat));
      if (usedLon != null) params.append('lon', String(usedLon));
      console.log('Fetching sessions with lat/lon:', usedLat, usedLon);

      if (name) params.append('nome', name.trim());
      if (fieldTypes && fieldTypes.length) fieldTypes.forEach(ft => params.append('tipoCampo', ft));
      if (prices && prices.length) prices.forEach(p => params.append('faixaPreco', p));
      if (levels && levels.length) levels.forEach(l => params.append('intensidade', l));
      if (weekDays && weekDays.length) weekDays.forEach(d => params.append('diaDaSemana', d));
      if (dayTimes && dayTimes.length) dayTimes.forEach(dt => params.append('periodoDoDia', dt));


      const data = await searchSessions(params);

      // Expecting an array of sessions from API; fall back gracefully
      if (Array.isArray(data)) setSessions(data as Session[]);
      else setSessions([]);
    } catch (err: any) {
      console.error('fetchSessions error', err);
      setFetchError(err?.message || 'Erro ao buscar partidas');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial sessions on mount
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // request location once on mount (sets lat/lon)
  useEffect(() => {
    const requestAndGetLocation = async () => {
      try {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const platLat = pos.coords.latitude;
              const platLon = pos.coords.longitude;
              setLat(platLat);
              setLon(platLon);
              console.log('Got web geolocation', platLat, platLon);
              // Trigger a re-fetch using the real coordinates we just obtained
              fetchSessions({ lat: platLat, lon: platLon });
            },
            (err) => {
              console.warn('geolocation error', err);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 }
          );
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
          fetchSessions({ lat: 200, lon: 200 }); // use placeholder coords if permission denied
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const nativeLat = pos.coords.latitude;
        const nativeLon = pos.coords.longitude;
        setLat(nativeLat);
        setLon(nativeLon);
        // Trigger a re-fetch using the real coordinates we just obtained
        fetchSessions({ lat: nativeLat, lon: nativeLon });
      } catch (e) {
        console.warn('requestAndGetLocation error', e);
      }
    };

    requestAndGetLocation();
  }, []);

  const renderCard = (session: Session) => (
    <View key={session.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sessionSport}>{session.nome}</Text>
          <Text style={styles.sessionLevel}>{session.intensidade}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.metaText}>{session.localizacao}</Text>
        <Text style={styles.metaText}>{formatLocalDate(session.dataHora)} às {formatLocalTime(session.dataHora)}</Text>
        <Text style={styles.metaText}>{session.peladeirosInscritos.length} confirmados • {session.vagas} vagas</Text>
      </View>
    </View>
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
          placeholder="Buscar pelo nome da pelada"
          placeholderTextColor="rgba(204,204,204,0.5)"
          value={searchName}
          onChangeText={setSearchName}
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.filterButton}
          accessibilityLabel="Abrir filtros"
        >
          <Filter color="#C7FF00" width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Modal de filtros */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Tipo do Campo</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {FIELD_TYPES.map((fieldType) => {
                        const active = queryFieldType.includes(fieldType);
                        return (
                          <TouchableOpacity
                            key={fieldType}
                            onPress={() => 
                              setQueryFieldType(prev => prev.includes(fieldType) ? prev.filter(p => p !== fieldType) : [...prev, fieldType])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{FIELD_TYPE_LABELS[fieldType]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Faixa de Preço */}
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Faixa de Preço</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {PRICE.map((price) => {
                        const active = queryPrice.includes(price);
                        return (
                          <TouchableOpacity
                            key={price}
                            onPress={() => 
                              setQueryPrice(prev => prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{PRICE_LABELS[price]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Intensidade */}
                <View style={{ marginBottom: 8 }}>
                  <View style={styles.filterCard}>
                    <Text style={styles.filterLabel}>Intensidade</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {LEVELS.map((lvl) => {
                        const active = queryLevel.includes(lvl);
                        return (
                          <TouchableOpacity
                            key={lvl}
                            onPress={() => 
                              setQueryLevel(prev => prev.includes(lvl) ? prev.filter(p => p !== lvl) : [...prev, lvl])
                            }
                            style={[
                              styles.levelChip,
                              active && styles.levelChipActive,
                            ]}
                          >
                            <Text style={active ? styles.levelChipTextActive : styles.levelChipText}>{LEVEL_LABELS[lvl]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={async () => {
                      setQueryDayTime([]); setQueryFieldType([]); setQueryPrice([]); setQueryWeekDay([]); setQueryLevel([]); setSearchName('');
                      await fetchSessions({
                        queryDayTime: [],
                        queryFieldType: [],
                        queryPrice: [],
                        queryWeekDay: [],
                        queryLevel: [],
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
                      await fetchSessions();
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
        data={filteredSessions}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            {loading ? (
              <View style={styles.loadingOverlay} pointerEvents="box-none">
                <ActivityIndicator size="large" color="#C7FF00" />
              </View>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🔎</Text>
                <Text style={styles.emptyTitle}>Nenhuma partida encontrada</Text>
                <Text style={styles.emptyText}>Ajuste os filtros para encontrar partidas próximas.</Text>
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
});

