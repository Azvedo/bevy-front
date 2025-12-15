import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import SessionMap from '../../components/session-map';
import { createEvent, CreateEventDTO } from '../../services/app'; // Importação adicionada

interface Session {
    id: string;
    sport: string;
    location: string;
    date: string;
    time: string;
    level: string;
    participants: string[];
    totalSpots: number;
    price?: string;
    description?: string;
    lat: number;
    lng: number;
    createdByUser?: boolean;
}

interface CreateSessionScreenProps {
    onBack: () => void;
    onCreateSession: (session: any) => void;
    editingSession?: Session | null;
}

const availableSports = [
    'Futebol',
];

const availableLevels = [
    'Casual',
    'Amador',
    'Semiprofissional',
];

export default function CreateSessionScreen({ onBack, onCreateSession, editingSession }: CreateSessionScreenProps) {
    const router = useRouter();
    // estado para saber se está enviando uma requisição de criação
    const [isLoading, setIsLoading] = useState(false);
    // estado para armazenar erros de criação e exibi-los na interface
    const [createError, setCreateError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        sport: editingSession?.sport || availableSports[0],
        location: editingSession?.location || '',
        date: editingSession?.date || '',
        time: editingSession?.time || '',
        spots: editingSession?.totalSpots?.toString() || '',
        price: editingSession?.price || '',
        description: editingSession?.description || '',
        level: editingSession?.level || '',
        // Novos campos de coordenadas
        latitude: editingSession?.lat || -8.05428,
        longitude: editingSession?.lng || -34.8813,
    });

    // Estado para controlar a região do mapa
    const [mapRegion, setMapRegion] = useState({
        latitude: -8.05428,
        longitude: -34.8813,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // Efeito para pegar a localização atual do usuário ao abrir
    useEffect(() => {
        (async () => {
            if (editingSession) return; // Se for edição, mantém a localização salva

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da sua localização para mostrar o mapa.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setFormData(prev => ({ ...prev, latitude, longitude }));
            setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        })();
    }, []);

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
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

    const maskDateInput = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    };

    const maskTimeInput = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    };

    // Função auxiliar para converter Data (DD/MM/AAAA) e Hora (HH:MM) para ISO String
    const convertToISO = (dateStr: string, timeStr: string) => {
        try {
            const [day, month, year] = dateStr.split('/');
            // Retorna no formato: 2025-12-01T19:00:00
            return `${year}-${month}-${day}T${timeStr}:00`;
        } catch (e) {
            return new Date().toISOString();
        }
    };

    // Função auxiliar para converter preço string em number
    const parsePrice = (priceStr: string) => {
        if (!priceStr) return 0;
        // Remove tudo que não é dígito, ponto ou vírgula
        const clean = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
        return parseFloat(clean) || 0;
    };

    // Nova função para formatar o input enquanto digita
    const formatCurrencyInput = (value: string) => {
        // Remove tudo que não é dígito
        const cleanValue = value.replace(/\D/g, '');

        if (!cleanValue) return '';

        // Converte para número (considerando que são centavos)
        const numberValue = parseInt(cleanValue, 10) / 100;

        // Formata para BRL
        return numberValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Mapeia o nível visual para a intensidade da API
    const mapLevelToIntensity = (level: string) => {
        switch (level) {
            case 'Casual': return 'LEVE';
            case 'Amador': return 'MODERADO';
            case 'Semiprofissional': return 'ALTA'; // ou INTENSO, dependendo do backend
            default: return 'MODERADO';
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            if (router.canGoBack()) {
                router.back();
            }
        }
    };

    const handleSubmit = async () => {

        setCreateError(null);

        // Validação simples
        if (!formData.sport || !formData.location || !formData.date || !formData.time || !formData.spots || !formData.level) {
            setCreateError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsLoading(true);

        try {
            // Monta o payload tipado com o novo campo
            const payload: CreateEventDTO = {
                nome: `${formData.sport} - ${formData.location}`,
                descricao: formData.description || `Pelada de ${formData.sport}`,
                localizacao: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude,
                dataHora: convertToISO(formData.date, formData.time),
                intensidade: mapLevelToIntensity(formData.level),
                tipoCampo: "SOCIETY",
                vagas: parseInt(formData.spots) || 0, // Adicionado mapeamento de vagas
                minutos: 90,
                custoPeladeiro: parsePrice(formData.price),
                custoPrestadorServico: 0
            };

            console.log('Enviando payload:', JSON.stringify(payload, null, 2));

            const data = await createEvent(payload);

            console.log('Sucesso:', data);

            if (onCreateSession) {
                onCreateSession(data);
            } else {
                if (router.canGoBack()) {
                    router.back();
                }
            }
        } catch (error: any) {
            console.error(error);
            setCreateError(error.message || 'Ocorreu um erro ao criar a pelada. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    // Estilos comuns convertidos para objetos
    const inputStyles = {
        width: '100%' as const,
        padding: 12,
        backgroundColor: '#2A2A2A',
        borderWidth: 1,
        borderColor: 'rgba(204, 204, 204, 0.2)', // #CCCCCC/20
        borderRadius: 8,
        color: 'white',
    };

    const labelStyles = {
        color: 'white',
        fontSize: 14,
        fontWeight: '500' as const,
        marginBottom: 8,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 8,
    };

    const cardStyles = {
        padding: 16,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: 'rgba(204, 204, 204, 0.2)', // #CCCCCC/20
        borderRadius: 12,
        marginBottom: 16,
    };

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#121212' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                

                <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Esporte */}
                    <View style={cardStyles}>
                        <Text style={labelStyles}>
                            Esporte *
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {availableSports.map((sport) => (
                                <TouchableOpacity
                                    key={sport}
                                    onPress={() => setFormData({ ...formData, sport })}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 9999,
                                        borderWidth: 1,
                                        backgroundColor: formData.sport === sport ? '#C7FF00' : '#2A2A2A',
                                        borderColor: formData.sport === sport ? '#C7FF00' : 'rgba(204, 204, 204, 0.2)'
                                    }}
                                >
                                    <Text style={{
                                        color: formData.sport === sport ? '#121212' : 'white',
                                        fontWeight: formData.sport === sport ? 'bold' : 'normal'
                                    }}>
                                        {sport}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Nível */}
                    <View style={cardStyles}>
                        <Text style={labelStyles}>
                            Nível *
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {availableLevels.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => setFormData({ ...formData, level })}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 9999,
                                        borderWidth: 1,
                                        backgroundColor: formData.level === level ? '#C7FF00' : '#2A2A2A',
                                        borderColor: formData.level === level ? '#C7FF00' : 'rgba(204, 204, 204, 0.2)'
                                    }}
                                >
                                    <Text style={{
                                        color: formData.level === level ? '#121212' : 'white',
                                        fontWeight: formData.level === level ? 'bold' : 'normal'
                                    }}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Localização */}
                    <View style={cardStyles}>
                        <View style={labelStyles}>
                            <Feather name="map-pin" size={16} color="#C7FF00" />
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Localização *</Text>
                        </View>
                        <TextInput
                            placeholder="Ex: Parque Ibirapuera"
                            placeholderTextColor="rgba(204, 204, 204, 0.5)"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            style={inputStyles}
                        />
                    </View>

                    <View style={cardStyles}>
                        <Text style={labelStyles}>
                            <Feather name="map-pin" size={16} color="#C7FF00" />
                            Marcar no Mapa
                        </Text>
                        <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
                            Toque no mapa para definir a localização exata.
                        </Text>

                        <SessionMap
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationSelect={(lat, lng) => {
                                setFormData(prev => ({
                                    ...prev,
                                    latitude: lat,
                                    longitude: lng
                                }));
                            }}
                        />

                        {/* Exibição das coordenadas (Opcional, para debug ou confirmação) */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                            <Text style={{ color: '#666', fontSize: 10 }}>Lat: {formData.latitude.toFixed(5)}</Text>
                            <Text style={{ color: '#666', fontSize: 10 }}>Long: {formData.longitude.toFixed(5)}</Text>
                        </View>
                    </View>

                    {/* Data e Hora */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1, ...cardStyles }}>
                            <View style={labelStyles}>
                                <Feather name="calendar" size={16} color="#C7FF00" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Data *</Text>
                            </View>
                            {Platform.OS === 'web' ? (
                                <TextInput
                                    keyboardType="numeric"
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                    value={formData.date}
                                    onChangeText={(text) => setFormData({ ...formData, date: maskDateInput(text) })}
                                    style={inputStyles}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setDatePickerVisible(true)}
                                        style={{ ...inputStyles, justifyContent: 'center', height: 48 }}
                                    >
                                        <Text style={{ color: formData.date ? 'white' : 'rgba(204,204,204,0.5)' }}>
                                            {formData.date || 'DD/MM/AAAA'}
                                        </Text>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isDatePickerVisible}
                                        mode="date"
                                        onConfirm={(date) => {
                                            setFormData({ ...formData, date: formatDate(date) });
                                            setDatePickerVisible(false);
                                        }}
                                        onCancel={() => setDatePickerVisible(false)}
                                    />
                                </>
                            )}
                        </View>

                        <View style={{ flex: 1, ...cardStyles }}>
                            <View style={labelStyles}>
                                <Feather name="clock" size={16} color="#C7FF00" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Hora *</Text>
                            </View>
                            {Platform.OS === 'web' ? (
                                <TextInput
                                    keyboardType="numeric"
                                    placeholder="HH:MM"
                                    placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                    value={formData.time}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, time: maskTimeInput(text) });
                                    }}
                                    style={inputStyles}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setTimePickerVisible(true)}
                                        style={{ ...inputStyles, justifyContent: 'center', height: 48 }}
                                    >
                                        <Text style={{ color: formData.time ? 'white' : 'rgba(204,204,204,0.5)' }}>
                                            {formData.time || 'HH:MM'}
                                        </Text>
                                    </TouchableOpacity>

                                    <DateTimePickerModal
                                        isVisible={isTimePickerVisible}
                                        mode="time"
                                        is24Hour={true}
                                        onConfirm={(date) => {
                                            setFormData({ ...formData, time: formatTime(date) });
                                            setTimePickerVisible(false);
                                        }}
                                        onCancel={() => setTimePickerVisible(false)}
                                    />
                                </>
                            )}
                        </View>
                    </View>

                    {/* Vagas e Valor */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1, ...cardStyles }}>
                            <View style={labelStyles}>
                                <Feather name="users" size={16} color="#C7FF00" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Vagas *</Text>
                            </View>
                            <TextInput
                                keyboardType="number-pad"
                                placeholder="Ex: 10"
                                placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                value={formData.spots}
                                onChangeText={(text) => setFormData({ ...formData, spots: text })}
                                style={inputStyles}
                            />
                        </View>

                        <View style={{ flex: 1, ...cardStyles }}>
                            <View style={labelStyles}>
                                <Feather name="dollar-sign" size={16} color="#C7FF00" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Valor</Text>
                            </View>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="R$ 20,00"
                                placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                value={formData.price}
                                // Ao digitar, aplicamos a máscara e salvamos no estado
                                onChangeText={(text) => {
                                    const formatted = formatCurrencyInput(text);
                                    setFormData({ ...formData, price: formatted });
                                }}
                                style={inputStyles}
                            />
                        </View>
                    </View>

                    {/* Descrição */}
                    <View style={cardStyles}>
                        <Text style={labelStyles}>
                            Descrição (Opcional)
                        </Text>
                        <TextInput
                            placeholder="Adicione detalhes sobre a pelada..."
                            placeholderTextColor="rgba(204, 204, 204, 0.5)"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            style={{ ...inputStyles, height: 128 }}
                        />
                    </View>

                    {/* Mensagem de Erro */}
                    {createError && (
                        <View style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(255, 82, 82, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: '#FF5252' }}>
                            <Text style={{ color: '#FF5252', textAlign: 'center' }}>
                                {createError}
                            </Text>
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={handleSubmit}
                        style={{
                            width: '100%',
                            backgroundColor: '#C7FF00',
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginTop: 16,
                            shadowColor: '#C7FF00',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#121212" />
                        ) : (
                            <Text style={{ color: '#121212', fontWeight: 'bold', fontSize: 18 }}>
                                {editingSession ? 'Atualizar Pelada' : 'Criar Pelada'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}