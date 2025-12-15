import {
    EventoDTO,
} from '@/services/events';
import { Entypo } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    background: '#121212',
    card: '#1E1E1E',
    accent: '#C7FF00',
    text: '#FFFFFF',
    textMuted: '#CCCCCC',
    borderSoft: 'rgba(204,204,204,0.15)',
};

// Dados mockados para teste
const MOCK_EVENT: EventoDTO = {
    id: '1',
    nome: 'Futebol Quinta à Noite',
    descricao: 'Pelada casual para todos os níveis. Venha se divertir e conhecer novos jogadores!',
    localizacao: 'Estádio Municipal - Rua das Flores, 123',
    dataHora: new Date(2025, 11, 18, 19, 30).toISOString(),
    custoPeladeiro: 25,
    vagas: 10,
    tipoCampo: 'Campo Grande',
    intensidade: 'Intermediário',
    peladeirosInscritos: [
        { id: '1', nome: 'João Silva', avaliacao: 4.8 },
        { id: '2', nome: 'Pedro Santos', avaliacao: 4.5 },
        { id: '3', nome: 'Carlos Oliveira', avaliacao: 4.2 },
        { id: '4', nome: 'Marcus Johnson', avaliacao: 4.9 },
        { id: '5', nome: 'Felipe Costa', avaliacao: 4.3 },
        { id: '6', nome: 'Diego Ferreira', avaliacao: 4.7 },
    ] as any[],
};

export default function SessionDetailsScreen() {
    const router = useRouter();
    const { id, from } = useLocalSearchParams<{ id?: string; from?: string }>();
    console.log('Session ID:', id);
    console.log('Navigated from:', from);

    const [event, setEvent] = useState<EventoDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editData, setEditData] = useState<Partial<EventoDTO> | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);


    useEffect(() => {
        const load = async () => {
            // if (!id) return;
            try {
                setIsLoading(true);
                // Código comentado para usar API real:
                // const evt = await getEventById(String(id));

                // Dados mockados para teste:
                const evt = MOCK_EVENT;

                setEvent(evt);
                setEditData(evt);
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

    const handleEditPress = () => {
        setEditData(event);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editData) return;
        try {
            // Aqui você chamaria a API para atualizar
            // await updateEvent(event?.id, editData);
            setEvent(editData as EventoDTO);
            setShowEditModal(false);
        } catch (err) {
            console.error('Erro ao atualizar evento', err);
            Alert.alert('Erro', 'Não foi possível atualizar a pelada');
        }
    };

    const handleCancelSession = () => {
        Alert.alert(
            'Cancelar Pelada',
            'Tem certeza que deseja cancelar essa pelada? Todos os participantes serão notificados.',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // await cancelEvent(event?.id);
                            Alert.alert('Sucesso', 'Pelada cancelada');
                            router.push('/(main)/home');
                        } catch (err) {
                            console.error('Erro ao cancelar evento', err);
                            Alert.alert('Erro', 'Não foi possível cancelar a pelada');
                        }
                    },
                },
            ]
        );
    };

    const handleRemoveParticipant = (participantId: string, participantName: string) => {
        Alert.alert(
            'Remover Participante',
            `Tem certeza que deseja remover ${participantName} da pelada?`,
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // await removeParticipantFromEvent(event?.id, participantId);
                            const updated = event?.peladeirosInscritos?.filter((p) => p.id !== participantId) ?? [];
                            setEvent({ ...event!, peladeirosInscritos: updated });
                            Alert.alert('Sucesso', 'Participante removido');
                        } catch (err) {
                            console.error('Erro ao remover participante', err);
                            Alert.alert('Erro', 'Não foi possível remover participante');
                        }
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        router.push('/(main)/home');
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

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Informações da Pelada */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Informações da Pelada</Text>

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
                    <Text style={styles.cardTitle}>Participantes ({event.peladeirosInscritos?.length ?? 0})</Text>

                    {(event.peladeirosInscritos ?? []).map((p: any) => {
                        const nome = p?.nome ?? 'Participante';
                        const avaliacao = p?.avaliacao ?? 4.5;
                        const initial = String(nome).trim().charAt(0).toUpperCase();
                        return (
                            <View key={String(p?.id ?? nome)} style={styles.participantRow}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarInitial}>{initial}</Text>
                                </View>
                                <View style={styles.participantInfo}>
                                    <Text style={styles.participantName}>{nome}</Text>
                                    <View style={styles.ratingContainer}>
                                        
                                        <Text style={styles.ratingStars}><Entypo name="star" size={13} color="#C7FF00" /> {avaliacao}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleRemoveParticipant(p.id, nome)}
                                >
                                    <Text style={styles.deleteIcon}><Entypo name="remove-user" size={22} color="red" /></Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                {/* Footer com botões de ação */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleCancelSession}
                    >
                        <Text style={styles.secondaryButtonText}>Cancelar Pelada</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleEditPress}
                    >
                        <Text style={styles.primaryButtonText}>Editar Informações</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Edição */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
            >
                <SafeAreaView style={styles.modalSafe}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowEditModal(false)}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Editar Pelada</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView
                        style={styles.modalContent}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Nome */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Nome</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editData?.nome ?? ''}
                                onChangeText={(text) => setEditData({ ...editData, nome: text })}
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Descrição */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Descrição</Text>
                            <TextInput
                                style={[styles.editInput, { height: 80, textAlignVertical: 'top' }]}
                                value={editData?.descricao ?? ''}
                                onChangeText={(text) => setEditData({ ...editData, descricao: text })}
                                multiline
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Localização */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Localização</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editData?.localizacao ?? ''}
                                onChangeText={(text) => setEditData({ ...editData, localizacao: text })}
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Data e Hora */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Data e Hora</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editData?.dataHora ?? ''}
                                onChangeText={(text) => setEditData({ ...editData, dataHora: text })}
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Intensidade */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Intensidade</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editData?.intensidade ?? ''}
                                onChangeText={(text) => setEditData({ ...editData, intensidade: text })}
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Vagas */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Vagas</Text>
                            <TextInput
                                style={styles.editInput}
                                value={String(editData?.vagas ?? '')}
                                onChangeText={(text) => setEditData({ ...editData, vagas: Number(text) })}
                                keyboardType="number-pad"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        {/* Custo */}
                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Custo por Peladeiro (R$)</Text>
                            <TextInput
                                style={styles.editInput}
                                value={String(editData?.custoPeladeiro ?? '')}
                                onChangeText={(text) => setEditData({ ...editData, custoPeladeiro: Number(text) })}
                                keyboardType="decimal-pad"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => setShowEditModal(false)}
                        >
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleSaveEdit}
                        >
                            <Text style={styles.primaryButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

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
    participantInfo: { flex: 1, marginLeft: 10 },
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
    participantName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
    ratingContainer: { marginTop: 4 },
    ratingStars: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
    deleteButton: { padding: 8 },
    deleteIcon: { fontSize: 18 },

    footer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: COLORS.background,

        borderTopColor: COLORS.borderSoft,
        gap: 10,
    },
    primaryButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
    },
    primaryButtonText: { color: '#121212', fontSize: 16, fontWeight: '700' },
    secondaryButton: {
        backgroundColor: COLORS.card,
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E05555',
    },
    secondaryButtonText: { color: '#E05555', fontSize: 16, fontWeight: '700' },

    modalSafe: { flex: 1, backgroundColor: COLORS.background },
    modalHeader: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderSoft,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalCloseText: { fontSize: 24, color: COLORS.text, fontWeight: '600' },
    modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
    modalContent: { flex: 1 },
    modalFooter: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderSoft,
        gap: 10,
    },

    editField: { marginBottom: 16 },
    editLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    editInput: {
        backgroundColor: COLORS.card,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.borderSoft,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },

    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    loadingText: { color: COLORS.textMuted },
});
