import { useRouter } from "expo-router";
import React, {useRef, useState} from "react";
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function VerifyCodePage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const router = useRouter();

    const handleCodeChange = (value: string, index: number) => {
        // Remove non-numeric characters
        const numericValue = value.replace(/[^0-9]/g, '');
        
        if (numericValue.length <= 1) {
            const newCode = [...code];
            newCode[index] = numericValue;
            setCode(newCode);

            // Auto-focus next input
            if (numericValue && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCode = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            // aqui você adicionaria validação / chamada de API para verificar o código
            router.replace("/(auth)/new-password");
        }
    };

    const isCodeComplete = code.every(digit => digit !== '') && code.join('').length === 6;


    return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <MaterialCommunityIcons name="shield-key-outline" size={70} color="#C7FF00" />

                    <Text style={styles.title}>Verificar código</Text>
                    <Text style={styles.subtitle}>Digite o código de 6 dígitos enviado para seu email</Text>

                    <View style={styles.codeContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.codeInput,
                                    digit ? styles.codeInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(value) => handleCodeChange(value, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                    
                    <TouchableOpacity>
                        <Text style={{ color: "#C7FF00", marginBottom: 24 }}>Reenviar código</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleVerifyCode} 
                        style={[
                            styles.primaryButton,
                            !isCodeComplete && styles.primaryButtonDisabled
                        ]} 
                        accessibilityRole="button"
                        disabled={!isCodeComplete}
                    >
                        <Text style={styles.primaryButtonText}>Confirmar código</Text>
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
    subtitle: { color: "#CCCCCC", fontSize: 14, marginBottom: 18, textAlign: "center" },
    codeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 300,
        marginBottom: 32,
        gap: 8,
    },
    codeInput: {
        width: 45,
        height: 55,
        backgroundColor: "#2A2A2A",
        borderRadius: 8,
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        borderWidth: 1,
        borderColor: "rgba(204,204,204,0.2)",
    },
    codeInputFilled: {
        borderColor: "#C7FF00",
        backgroundColor: "#2A2A2A",
    },
    form: { width: "100%", maxWidth: 420, alignItems: "center", gap: 8 },
    form_fields: { width: "100%", gap: 4},
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
    primaryButtonDisabled: {
        backgroundColor: "#666666",
        opacity: 0.6,
    },
    primaryButtonText: { color: "#121212", fontWeight: "700", fontSize: 16 },
});