import { createProvider } from '@/services/user';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { default as React, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DayTime = 'manha' | 'tarde' | 'noite';
type WeekDay = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
type DisponibilidadeLocal = { dias: WeekDay[]; periodos: DayTime[] };

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

const DAY_TIMES: DayTime[] = ['manha', 'tarde', 'noite'];
const DAY_TIME_LABELS: Record<DayTime, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

export default function CreateServiceScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<'ARBITRO' | 'GOLEIRO'>(roleParam === 'goleiro' ? 'GOLEIRO' : 'ARBITRO');
  const [precoHora, setPrecoHora] = useState('');
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeLocal[]>([{ dias: [], periodos: [] }]);
  const [isLoading, setIsLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

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
            return;
          }
  
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const nativeLat = pos.coords.latitude;
          const nativeLon = pos.coords.longitude;
          setLat(nativeLat);
          setLon(nativeLon);
        } catch (e) {
          console.warn('requestAndGetLocation error', e);
        }
      };
  
      requestAndGetLocation();
    }, []);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  const validate = () => {
    if (!precoHora.trim()) {
      Alert.alert('Atenção', 'Informe o preço por hora.');
      return false;
    }
    if (disponibilidades.length === 0) {
      Alert.alert('Atenção', 'Adicione ao menos uma disponibilidade.');
      return false;
    }
    for (const d of disponibilidades) {
      if (!d.dias || d.dias.length === 0) {
        Alert.alert('Atenção', 'Selecione ao menos um dia em cada disponibilidade.');
        return false;
      }
      if (!d.periodos || d.periodos.length === 0) {
        Alert.alert('Atenção', 'Selecione ao menos um período em cada disponibilidade.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const latitude = lat ? lat : 200;
      const longitude = lon ? lon : 200;
      const disponibilidadePayload: Array<{ diaDaSemana: string; horarios: string[] }> = [];
      disponibilidades.forEach(d => {
        d.dias.forEach(day => {
          disponibilidadePayload.push({ diaDaSemana: day, horarios: d.periodos.map(p => p) });
        });
      });

      const payload = {
        tipoPrestador: role,
        valor: parseFloat(precoHora.replace(',', '.')) || 0,
        latitude: latitude,
        longitude: longitude,
        disponibilidade: disponibilidadePayload,
      } as any;

      await createProvider(payload);

      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error?.message || 'Não foi possível cadastrar o serviço.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Serviço *</Text>
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={[styles.selectorOption, role === 'ARBITRO' && styles.selectorActive]}
              onPress={() => setRole('ARBITRO')}
            >
              <MaterialCommunityIcons name="whistle" size={28} color={role === 'ARBITRO' ? '#121212' : '#C7FF00'} />
              <Text style={[styles.selectorText, role === 'ARBITRO' && styles.selectorTextActive]}>Árbitro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectorOption, role === 'GOLEIRO' && styles.selectorActive]}
              onPress={() => setRole('GOLEIRO')}
            >
              <MaterialCommunityIcons name="handball" size={28} color={role === 'GOLEIRO' ? '#121212' : '#C7FF00'} />
              <Text style={[styles.selectorText, role === 'GOLEIRO' && styles.selectorTextActive]}>Goleiro</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Preço por hora (R$) *</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="rgba(204,204,204,0.5)"
            keyboardType="numeric"
            value={precoHora}
            onChangeText={(t) => setPrecoHora(t.replace(/[^0-9.,]/g, ''))}
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Disponibilidade *</Text>
          {disponibilidades.map((d, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Dias</Text>
                <TouchableOpacity onPress={() => setDisponibilidades(prev => prev.filter((_, i) => i !== idx))}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C7FF00" />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {WEEK_DAYS.map(day => {
                  const selected = d.dias.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        const copy = [...disponibilidades];
                        const has = copy[idx].dias.includes(day);
                        copy[idx].dias = has ? copy[idx].dias.filter(x => x !== day) : [...copy[idx].dias, day];
                        setDisponibilidades(copy);
                      }}
                      style={[styles.levelChip, selected && styles.levelChipActive]}
                    >
                      <Text style={[styles.levelChipText, selected && styles.levelChipTextActive]}>{WEEK_DAY_LABELS[day]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}>Períodos</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DAY_TIMES.map(p => {
                  const selected = d.periodos.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => {
                        const copy = [...disponibilidades];
                        const has = copy[idx].periodos.includes(p);
                        copy[idx].periodos = has ? copy[idx].periodos.filter(x => x !== p) : [...copy[idx].periodos, p];
                        setDisponibilidades(copy);
                      }}
                      style={[styles.levelChip, selected && styles.levelChipActive]}
                    >
                      <Text style={[styles.levelChipText, selected && styles.levelChipTextActive]}>{DAY_TIME_LABELS[p]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setDisponibilidades(prev => [...prev, { dias: [], periodos: [] }])}
            style={{ marginTop: 8, backgroundColor: '#2A2A2A', padding: 10, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#C7FF00', fontWeight: '700' }}>Adicionar Disponibilidade</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleSubmit}
          style={styles.submitBtn}
        >
          <Text style={styles.submitText}>{isLoading ? 'Enviando...' : 'Cadastrar Serviço'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.08)' },
  backBtn: { padding: 8, marginRight: 12 },
  title: { color: 'white', fontWeight: '700', fontSize: 18 },
  content: { padding: 16, paddingBottom: 48 },
  card: { backgroundColor: '#1E1E1E', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(204,204,204,0.06)' },
  label: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { width: '100%', padding: 12, backgroundColor: '#2A2A2A', borderRadius: 8, color: 'white', borderWidth: 1, borderColor: 'rgba(204,204,204,0.08)' },
  selectorRow: { flexDirection: 'row', gap: 12 },
  selectorOption: { flex: 1, backgroundColor: '#2A2A2A', padding: 12, borderRadius: 10, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(199,255,0,0.08)' },
  selectorActive: { backgroundColor: 'rgba(199,255,0,0.9)' },
  selectorText: { color: '#CCCCCC', marginTop: 6, fontWeight: '700' },
  selectorTextActive: { color: '#121212' },
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
  submitBtn: { width: '100%', backgroundColor: '#C7FF00', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#121212', fontWeight: '700', fontSize: 16 },
});