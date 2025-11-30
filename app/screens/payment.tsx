import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Session {
    id: string;
    sport: string;
    location: string;
    date: string;
    time: string;
    price?: string;
}

interface PaymentScreenProps {
    visible: boolean;
    session: Session;
    onClose: () => void;
    onPaymentSuccess?: () => void;
}

type PaymentMethod = 'pix' | 'credit' | null;

export default function PaymentScreen({
    visible,
    session = {
        id: '1',
        sport: 'Futebol',
        location: 'Parque Ibirapuera',
        date: '2025-12-01',
        time: '18:00',
        price: 'R$ 25,00'
    },
    onClose,
    onPaymentSuccess
}: PaymentScreenProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Formulário do cartão
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // Calcular preço com markup de 5%
    const calculatePrice = () => {
        if (!session.price) return 'R$ 0,00';
        const numericPrice = parseFloat(session.price.replace('R$', '').replace(',', '.').trim());
        const priceWithMarkup = numericPrice * 1.05;
        return `R$ ${priceWithMarkup.toFixed(2).replace('.', ',')}`;
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19);
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const handlePayment = () => {
        setIsProcessing(true);

        // Simular processamento de pagamento
        setTimeout(() => {
            setIsProcessing(false);
            setShowSuccess(true);

            // Após 3 segundos, chamar o callback de sucesso
            setTimeout(() => {
                if (onPaymentSuccess) {
                    onPaymentSuccess();
                } else {
                    onClose();
                }
            }, 3000);
        }, 2000);
    };

    const validateCreditForm = () => {
        if (!cardNumber || !cardName || !expiry || !cvv) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return false;
        }
        if (cardNumber.replace(/\s/g, '').length < 16) {
            Alert.alert('Erro', 'Número do cartão inválido.');
            return false;
        }
        if (cvv.length < 3) {
            Alert.alert('Erro', 'CVV inválido.');
            return false;
        }
        return true;
    };

    const handleCreditSubmit = () => {
        if (validateCreditForm()) {
            handlePayment();
        }
    };

    // Tela de sucesso
    if (showSuccess) {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                    <View style={styles.successContainer}>
                        <View style={styles.successIcon}>
                            <Feather name="check" size={48} color="#121212" />
                        </View>

                        <Text style={styles.successTitle}>Pagamento Realizado!</Text>

                        <View style={styles.successCard}>
                            <View style={styles.successInfo}>
                                <Feather name="clock" size={24} color="#C7FF00" />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.successInfoTitle}>Aguardando aprovação</Text>
                                    <Text style={styles.successInfoText}>
                                        Assim que o organizador aceitar sua participação, você receberá uma confirmação.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.successDivider} />

                            <Text style={styles.successWarning}>
                                <Text style={styles.successWarningBold}>Importante:</Text> Se o organizador não aceitar sua participação,
                                o valor será estornado automaticamente em até 5 dias úteis.
                            </Text>
                        </View>

                        <Text style={styles.redirectText}>Redirecionando...</Text>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    // Tela PIX
    if (selectedMethod === 'pix') {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => setSelectedMethod(null)}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={20} color="#CCCCCC" />
                            <Text style={styles.backText}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Feather name="x" size={24} color="#CCCCCC" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Pagamento via PIX</Text>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                        <View style={styles.card}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>Valor a pagar</Text>
                                <Text style={styles.priceValue}>{calculatePrice()}</Text>
                            </View>

                            {/* QR Code Mockado */}
                            <View style={styles.qrContainer}>
                                <View style={styles.qrCode}>
                                    <Feather name="smartphone" size={80} color="white" />
                                    <Text style={styles.qrText}>QR CODE</Text>
                                </View>
                            </View>

                            <View style={styles.pixCodeContainer}>
                                <Text style={styles.pixCodeLabel}>Código PIX Copia e Cola</Text>
                                <View style={styles.pixCodeBox}>
                                    <Text style={styles.pixCodeText}>
                                        00020126580014br.gov.bcb.pix0136mockpix-bevynow-{session.id}520400005303986540{calculatePrice().replace('R$ ', '').replace(',', '.')}5802BR5913BEVY NOW6009SAO PAULO
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.pixInstructions}>
                                Abra o app do seu banco e escaneie o QR Code ou copie o código acima
                            </Text>

                            <TouchableOpacity
                                style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                                onPress={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#121212" />
                                ) : (
                                    <Text style={styles.payButtonText}>Já realizei o pagamento</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    }

    // Tela Cartão de Crédito
    if (selectedMethod === 'credit') {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => setSelectedMethod(null)}
                                style={styles.backButton}
                            >
                                <Feather name="arrow-left" size={20} color="#CCCCCC" />
                                <Text style={styles.backText}>Voltar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <Feather name="x" size={24} color="#CCCCCC" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Pagamento no Crédito</Text>
                        </View>

                        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                            <View style={styles.card}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Valor a pagar</Text>
                                    <Text style={styles.priceValue}>{calculatePrice()}</Text>
                                </View>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Número do Cartão</Text>
                                    <TextInput
                                        value={cardNumber}
                                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                                        placeholder="0000 0000 0000 0000"
                                        placeholderTextColor="#CCCCCC"
                                        keyboardType="numeric"
                                        maxLength={19}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nome no Cartão</Text>
                                    <TextInput
                                        value={cardName}
                                        onChangeText={setCardName}
                                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                                        placeholderTextColor="#CCCCCC"
                                        autoCapitalize="characters"
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.label}>Validade</Text>
                                        <TextInput
                                            value={expiry}
                                            onChangeText={(text) => setExpiry(formatExpiry(text))}
                                            placeholder="MM/AA"
                                            placeholderTextColor="#CCCCCC"
                                            keyboardType="numeric"
                                            maxLength={5}
                                            style={styles.input}
                                        />
                                    </View>

                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>CVV</Text>
                                        <TextInput
                                            value={cvv}
                                            onChangeText={setCvv}
                                            placeholder="000"
                                            placeholderTextColor="#CCCCCC"
                                            keyboardType="numeric"
                                            maxLength={3}
                                            secureTextEntry
                                            style={styles.input}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                                    onPress={handleCreditSubmit}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator size="small" color="#121212" />
                                    ) : (
                                        <Text style={styles.payButtonText}>Pagar {calculatePrice()}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        );
    }

    // Tela de seleção de método
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color="#CCCCCC" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Pagamento</Text>
                    <Text style={styles.headerSubtitle}>Escolha a forma de pagamento</Text>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    {/* Resumo */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Resumo</Text>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>{session.sport}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>{session.location}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>
                                {new Date(session.date).toLocaleDateString('pt-BR')} às {session.time}
                            </Text>
                        </View>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{calculatePrice()}</Text>
                        </View>
                    </View>

                    {/* Métodos de Pagamento */}
                    <TouchableOpacity
                        style={styles.paymentMethod}
                        onPress={() => setSelectedMethod('pix')}
                    >
                        <View style={styles.paymentIcon}>
                            <Feather name="smartphone" size={24} color="#121212" />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentMethodTitle}>PIX</Text>
                            <Text style={styles.paymentMethodDesc}>Pagamento instantâneo</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCCCCC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.paymentMethod}
                        onPress={() => setSelectedMethod('credit')}
                    >
                        <View style={styles.paymentIcon}>
                            <Feather name="credit-card" size={24} color="#121212" />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentMethodTitle}>Cartão de Crédito</Text>
                            <Text style={styles.paymentMethodDesc}>Visa, Mastercard, Elo</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCCCCC" />
                    </TouchableOpacity>

                    {/* Aviso */}
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>
                            <Text style={styles.warningBold}>Importante:</Text> O pagamento ficará pendente até que o organizador
                            confirme sua participação. Se não for aceito, você será estornado automaticamente.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(204,204,204,0.2)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(204,204,204,0.1)',
    },
    headerTitleContainer: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(204,204,204,0.2)',
    },
    backText: {
        color: '#CCCCCC',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    headerSubtitle: {
        color: '#CCCCCC',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#1E1E1E',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
        marginBottom: 16,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    summaryItem: {
        marginBottom: 8,
    },
    summaryText: {
        color: '#CCCCCC',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(204,204,204,0.2)',
    },
    totalLabel: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    totalValue: {
        fontSize: 24,
        color: '#C7FF00',
        fontWeight: '700',
    },
    paymentMethod: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#C7FF00',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentMethodTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    paymentMethodDesc: {
        color: '#CCCCCC',
        fontSize: 14,
        marginTop: 2,
    },
    warningContainer: {
        backgroundColor: 'rgba(199,255,0,0.1)',
        borderColor: 'rgba(199,255,0,0.3)',
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    warningText: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
    },
    warningBold: {
        color: '#C7FF00',
        fontWeight: '700',
    },
    // PIX styles
    priceContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    priceLabel: {
        color: '#CCCCCC',
        marginBottom: 8,
    },
    priceValue: {
        fontSize: 32,
        color: '#C7FF00',
        fontWeight: '700',
    },
    qrContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCode: {
        width: 192,
        height: 192,
        backgroundColor: '#121212',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrText: {
        color: 'white',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    pixCodeContainer: {
        marginBottom: 24,
    },
    pixCodeLabel: {
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '600',
    },
    pixCodeBox: {
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
    },
    pixCodeText: {
        color: '#CCCCCC',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: 14,
    },
    pixInstructions: {
        color: '#CCCCCC',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    payButton: {
        backgroundColor: '#C7FF00',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    payButtonDisabled: {
        opacity: 0.6,
    },
    payButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '700',
    },
    // Credit form styles
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
    },
    label: {
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    // Success styles
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    successIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#C7FF00',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
    },
    successCard: {
        backgroundColor: '#1E1E1E',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(204,204,204,0.2)',
        maxWidth: 400,
        width: '100%',
    },
    successInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    successInfoTitle: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    successInfoText: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
    },
    successDivider: {
        height: 1,
        backgroundColor: 'rgba(204,204,204,0.2)',
        marginVertical: 16,
    },
    successWarning: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
    },
    successWarningBold: {
        color: '#C7FF00',
        fontWeight: '700',
    },
    redirectText: {
        color: '#CCCCCC',
        fontSize: 14,
        marginTop: 24,
    },
});