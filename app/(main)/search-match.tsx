import { useRouter } from 'expo-router';
import { ArrowLeftIcon, Filter } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


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

export default function SearchMatchScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  
  // máscara simples para DD/MM/AAAA enquanto digita
  const maskDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
    return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
  };

  // máscara simples para HH:MM enquanto digita
  const maskTimeInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0,2)}:${digits.slice(2)}`;
  };
  const [queryLocation, setQueryLocation] = useState('');
  const [queryDate, setQueryDate] = useState(''); // accept YYYY-MM-DD or DD/MM/YYYY
  const [queryTime, setQueryTime] = useState(''); // HH:mm
  const [queryLevel, setQueryLevel] = useState('');
  const [querySport, setQuerySport] = useState('');
  const [searchName, setSearchName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const results = useMemo(() => {
    const qLoc = queryLocation.trim().toLowerCase();
    const qLevel = queryLevel.trim().toLowerCase();
    const qSport = querySport.trim().toLowerCase();
    const qName = searchName.trim().toLowerCase();
    const qDate = queryDate.trim();
    const qTime = queryTime.trim();

    return mockSessions.filter((s) => {
      if (qName && !s.name.toLowerCase().includes(qName)) return false;
      if (qSport && !s.sport.toLowerCase().includes(qSport)) return false;
      if (qLoc && !s.location.toLowerCase().includes(qLoc)) return false;
      if (qLevel && !s.level.toLowerCase().includes(qLevel)) return false;
      if (qDate) {
        const normalized = qDate.includes('/') ? qDate.split('/').reverse().join('-') : qDate;
        if (!s.date.includes(normalized)) return false;
      }
      if (qTime && !s.time.includes(qTime)) return false;
      return true;
    });
  }, [queryLocation, queryDate, queryTime, queryLevel, querySport, searchName]);

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack ? onBack : () => router.back()}
          style={styles.backButton}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowLeftIcon color="#CCCCCC" size={20} />
            <Text style={styles.backText}>Voltar</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Partidas</Text>
      </View>
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
                <TextInput
                  placeholder="Esporte"
                  placeholderTextColor="rgba(204,204,204,0.5)"
                  value={querySport}
                  onChangeText={setQuerySport}
                  style={{ ...styles.input, marginBottom: 8 }}
                />
                <TextInput
                  placeholder="Local"
                  placeholderTextColor="rgba(204,204,204,0.5)"
                  value={queryLocation}
                  onChangeText={setQueryLocation}
                  style={{ ...styles.input, marginBottom: 8 }}
                />
                {Platform.OS === 'web' ? (
                  <TextInput
                    placeholder="Data (DD/MM/AAAA)"
                    placeholderTextColor="rgba(204,204,204,0.5)"
                    value={queryDate}
                    onChangeText={(text) => setQueryDate(maskDateInput(text))}
                    keyboardType="number-pad"
                    style={{ ...styles.input, marginBottom: 8 }}
                  />
                ) : (
                  <>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisible(true)}
                    style={{ ...styles.input, justifyContent: 'center', height: 44, marginBottom: 8 }}
                  >
                    <Text style={{ color: queryDate ? 'white' : 'rgba(204,204,204,0.5)' }}>
                      {queryDate || 'DD/MM/AAAA'}
                    </Text>
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={(date) => {
                      setQueryDate(formatDate(date));
                      setDatePickerVisible(false);
                    }}
                    onCancel={() => setDatePickerVisible(false)}
                  />
                  </>
                )}

                {Platform.OS === 'web' ? (
                  <TextInput
                    placeholder="Hora (HH:MM)"
                    placeholderTextColor="rgba(204,204,204,0.5)"
                    value={queryTime}
                    onChangeText={(text) => setQueryTime(maskTimeInput(text))}
                    keyboardType="number-pad"
                    style={{ ...styles.input, marginBottom: 12 }}
                  />
                ) : (
                  <>
                  <TouchableOpacity
                    onPress={() => setTimePickerVisible(true)}
                    style={{ ...styles.input, justifyContent: 'center', height: 44, marginBottom: 12 }}
                  >
                    <Text style={{ color: queryTime ? 'white' : 'rgba(204,204,204,0.5)' }}>
                      {queryTime || 'HH:MM'}
                    </Text>
                  </TouchableOpacity>

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
                  </>
                )}

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => { setQuerySport(''); setQueryLocation(''); setQueryDate(''); setQueryTime(''); setQueryLevel(''); setSearchName(''); setModalVisible(false); }}
                    style={[styles.modalButton, { backgroundColor: '#2A2A2A' }]}
                  >
                    <Text style={{ color: 'white' }}>Limpar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
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
        data={results}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>Nenhuma partida encontrada</Text>
            <Text style={styles.emptyText}>Ajuste os filtros para encontrar partidas próximas.</Text>
          </View>
        )}
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
});

