import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PaymentScreen from '../screens/payment';

export default function HomePage() {
  const [showPayment, setShowPayment] = useState(false);

  // Dados mockados para teste da tela de pagamento
  const mockSession = {
    id: '1',
    sport: 'Futebol',
    location: 'Parque Ibirapuera',
    date: '2025-12-01',
    time: '18:00',
    price: 'R$ 25,00'
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    console.log('Pagamento realizado com sucesso!');
  };

  // Se showPayment for true, mostra a tela de pagamento
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo ao Bevy Now!</Text>
        <Text style={styles.subtitle}>Conecte-se para praticar esportes</Text>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => setShowPayment(true)}
        >
          <Text style={styles.testButtonText}>Testar Tela de Pagamento</Text>
        </TouchableOpacity>
      </View>

      <PaymentScreen
        visible={showPayment}
        session={mockSession}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  testButton: {
    backgroundColor: '#C7FF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 16,
  },
});