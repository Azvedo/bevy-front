import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from "react";


export default function ForgotPasswordPage() {

    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleSendCode = () => {
        // aqui você adicionaria validação / chamada de API para enviar o código de recuperação
        router.replace("/(auth)/verify-code");
    }


    return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <MaterialCommunityIcons name="email-fast" size={70} color="#C7FF00" />
                    <Text style={styles.title}>{"Vamos resolver isso"}</Text>
                    <Text style={styles.subtitle}>{"Informe o e-mail da sua conta e receba seu código de confirmação agora mesmo."}</Text>
                    <View style={styles.form}>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="#CCCCCC"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity onPress={handleSendCode} style={styles.primaryButton} accessibilityRole="button">
                        <Text style={styles.primaryButtonText}>{"Enviar código de recuperação"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: "#121212", height: "100%", justifyContent: "space-around" },
    inner: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
    logo: { width: 60, height: 60, borderRadius: 0, marginBottom: 20 },
    title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginBottom: 6 },
    subtitle: { color: "#CCCCCC", fontSize: 16, marginBottom: 18, textAlign: "center" },
    form: { width: "100%", maxWidth: 420, alignItems: "center", gap: 8 },
    input: {
        width: "100%",
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    primaryButton: {
        width: "100%",
        backgroundColor: "#C7FF00",
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 6,
    },
    primaryButtonText: { color: "#121212", fontWeight: "700", fontSize: 16 },
    
});