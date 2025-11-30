import { useRouter } from 'expo-router';
import { Filter } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

export type Session = {
  id: string;
  name: string;
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

const mockSessions: Session[] = [
  {
    id: '1',
    name: "Futebol no Ibirapuera",
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
    name: "Futebol no Pacaembu",
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
    name: "Futebol no Villa-Lobos",
    sport: 'Futebol',
    location: 'Parque Villa-Lobos',
    date: '2025-11-09',
    time: '09:00',
    level: 'Casual',
    participants: ['Fernanda', 'Lucas', 'Beatriz', 'Marcos', 'Camila'],
    totalSpots: 12,
  },
];

// Mock API URL and params 
const distance = 50; // example distance in km
const lat = 20; // example latitude
const lon = 50; // example longitude
const API_URL = process.env.API_URL || 'https://bevy-api.onrender.com';

const API_SEARCH_URL = `${API_URL}/user/feed?distancia=${distance}&lat=${lat}&lon=${lon}`;

export default function SearchMatchScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  
  const [queryLocation, setQueryLocation] = useState('');
  const [queryDate, setQueryDate] = useState(''); // accept YYYY-MM-DD or DD/MM/YYYY
  const [queryTime, setQueryTime] = useState(''); // HH:mm
  const [queryLevel, setQueryLevel] = useState<Level[]>([]);
  const [queryPrice, setQueryPrice] = useState<Price[]>([]);
  const [queryFieldType, setQueryFieldType] = useState<FieldType[]>([]);
  const [queryDayTime, setQueryDayTime] = useState<DayTime[]>([]);
  const [queryWeekDay, setQueryWeekDay] = useState<WeekDay[]>([]);
  const [querySport, setQuerySport] = useState('');
  const [searchName, setSearchName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const results = useMemo(() => {
    const qLoc = queryLocation.trim().toLowerCase();
    //const qLevel = queryLevel.trim().toLowerCase();
    const qSport = querySport.trim().toLowerCase();
    const qName = searchName.trim().toLowerCase();
    const qDate = queryDate.trim();
    const qTime = queryTime.trim();

    return mockSessions.filter((s) => {
      if (qName && !s.name.toLowerCase().includes(qName)) return false;
      if (qSport && !s.sport.toLowerCase().includes(qSport)) return false;
      if (qLoc && !s.location.toLowerCase().includes(qLoc)) return false;
      //if (qLevel && !s.level.toLowerCase().includes(qLevel)) return false;
      if (qDate) {
        const normalized = qDate.includes('/') ? qDate.split('/').reverse().join('-') : qDate;
        if (!s.date.includes(normalized)) return false;
      }
      if (qTime && !s.time.includes(qTime)) return false;
      return true;
    });
  }, [queryLocation, queryDate, queryTime, queryLevel, querySport, searchName]);


  // Fetch sessions from backend using available filters
  const fetchSessions = async (extraParams?: Record<string, string | number | undefined>) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('nome', searchName.trim());
      if (queryFieldType && queryFieldType.length){
        queryFieldType.forEach(ft => params.append('tipoCampo', ft));
      }
      if (queryPrice && queryPrice.length){
        queryPrice.forEach(p => params.append('faixaPreco', p));
      }
      if (queryLevel && queryLevel.length){
        queryLevel.forEach(l => params.append('intensidade', l));
      }
      if (queryWeekDay && queryWeekDay.length){
        queryWeekDay.forEach(d => params.append('diaDaSemana', d));
      }
      if (queryDayTime && queryDayTime.length){
        queryDayTime.forEach(dt => params.append('periodoDoDia', dt));
      }
      // include any additional params provided by caller
      if (extraParams) {
        Object.entries(extraParams).forEach(([k, v]) => {
          if (v !== undefined && v !== null && String(v).length) params.append(k, String(v));
        });
      }

      const url = `${API_SEARCH_URL}&${params.toString()}`;

      //const token = await SecureStore.getItemAsync('accessToken');

      const res = await fetch(url);

      //if (res.status === 401) {
        // token inválido/expirado — trate aqui (logout/refresh)
      //  throw new Error('Não autorizado (401)');
      //}

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

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

  const renderCard = (session: Session) => (
    <View key={session.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sessionSport}>{session.sport}</Text>
          <Text style={styles.sessionLevel}>{session.level}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.metaText}>{session.location}</Text>
        <Text style={styles.metaText}>{formatLocalDate(session.date)} às {session.time}</Text>
        <Text style={styles.metaText}>{session.participants.length} confirmados • {session.totalSpots} vagas</Text>
      </View>
    </View>
  );

  // formata uma data ISO (YYYY-MM-DD) para o timezone local sem deslocamento
  const formatLocalDate = (iso: string) => {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return dt.toLocaleDateString('pt-BR');
  };

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

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
                    onPress={() => {
                      setQuerySport(''); setQueryLocation(''); setQueryDate(''); setQueryTime(''); setQueryLevel([]); setSearchName('');
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

      {/* Native pickers for non-web */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setQueryDate(formatDate(date));
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        is24Hour={true}
        onConfirm={(date) => {
          setQueryTime(formatTime(date));
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />

      <FlatList
        contentContainerStyle={styles.container}
        data={sessions.length ? sessions : results}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            {loading ? (
              <Text style={styles.emptyTitle}>Carregando partidas...</Text>
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
});

