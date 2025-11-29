import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

// URL Da API (@rafa ou quem ler, como ntinha nenhum .env coloquei aqui)
const API_URL = 'http://localhost:8080/eventos'; 
const API_TOKEN = 'SEU_TOKEN_AQUI'; // so de teste, ainda n tem auth 

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
    });

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
       if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
       return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
    };

    const maskTimeInput = (value: string) => {
       const digits = value.replace(/\D/g, '').slice(0, 4);
       if (digits.length <= 2) return digits;
       return `${digits.slice(0,2)}:${digits.slice(2)}`;
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
         // Monta o payload conforme o curl fornecido
            const payload = {
                nome: `${formData.sport} - ${formData.location}`, // Gera um nome automático ou adicione um campo 'Título'
                descricao: formData.description || `Pelada de ${formData.sport}`,
                localizacao: formData.location,
                dataHora: convertToISO(formData.date, formData.time),
                custoPeladeiro: parsePrice(formData.price),
                custoPrestadorServico: 0, // Valor padrão ou adicionar campo no form
                latitude: -8.05428, // TODO: Obter via geocoding ou mapa real
                longitude: -34.8813, // TODO: Obter via geocoding ou mapa real
                intensidade: mapLevelToIntensity(formData.level),
                tipoCampo: "SOCIETY" // Pode ser dinâmico baseado no esporte
            };

            console.log('Enviando payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text(); // Tenta ler o erro como texto
                throw new Error(`Erro na API: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            console.log('Sucesso:', data);

            if (onCreateSession) {
                onCreateSession(data);
            } else {
                // Sucesso
                if (router.canGoBack()) {
                    router.back();
                }
            }
        } catch (error: any) {
            console.error(error);
            setCreateError(error.message || 'Ocorreu um erro ao criar a pelada. Verifique sua conexão.');
        } finally {
            // Finaliza o loading independente de sucesso ou erro
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
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#121212' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={{
                    backgroundColor: '#1E1E1E',
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(204, 204, 204, 0.2)',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16
                }}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={{
                            padding: 8,
                            marginLeft: -8,
                            borderRadius: 9999,
                        }}
                    >
                        <Feather name="arrow-left" size={24} color="#CCCCCC" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            {editingSession ? 'Editar Pelada' : 'Criar Pelada'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#CCCCCC' }}>Preencha as informações</Text>
                    </View>
                </View>

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
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
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