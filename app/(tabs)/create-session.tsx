import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            if (router.canGoBack()) {
                router.back();
            }
        }
    };

    const handleSubmit = () => {
        if (onCreateSession) {
            onCreateSession(formData);
        } else {
            console.log('Session created:', formData);
            // Implement API call here
            if (router.canGoBack()) {
                router.back();
            }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
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
                            <TextInput
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                value={formData.date}
                                onChangeText={(text) => setFormData({ ...formData, date: text })}
                                style={inputStyles}
                            />
                        </View>

                        <View style={{ flex: 1, ...cardStyles }}>
                            <View style={labelStyles}>
                                <Feather name="clock" size={16} color="#C7FF00" />
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>Hora *</Text>
                            </View>
                            <TextInput
                                placeholder="HH:MM"
                                placeholderTextColor="rgba(204, 204, 204, 0.5)"
                                value={formData.time}
                                onChangeText={(text) => setFormData({ ...formData, time: text })}
                                style={inputStyles}
                            />
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
                                keyboardType="numeric"
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

                    {/* Submit Button */}
                    <TouchableOpacity
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
                        <Text style={{ color: '#121212', fontWeight: 'bold', fontSize: 18 }}>
                            {editingSession ? 'Atualizar Pelada' : 'Criar Pelada'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}