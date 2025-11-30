import { registerUser } from "@/services/auth";
import Octicons from "@expo/vector-icons/Octicons";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

interface SignUpProps {
    onLogin?: () => void;
}

const logo = require("../../assets/images/image.png");

export default function SignUp({ onLogin }: SignUpProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            // Validação básica
            if (!name.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
                return;
            }

            if (password.length < 6) {
                return;
            }

            await registerUser({
                nome: name.trim(),
                email: email.trim().toLowerCase(),
                telefone: phoneNumber.trim(),
                senha: password
            });

            console.log("Usuário registrado com sucesso");
            setEmail("");
            setName("");
            setPhoneNumber("");
            setPassword("");
            router.replace("/(auth)/login");
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                // O servidor respondeu com status 400
                console.log('----------------ERRO 400----------------');
                console.log('Dados que enviei:', { nome: name, email, telefone: phoneNumber, senha: password }); // Confira se está enviando o que acha que está
                console.log('RESPOSTA DO SERVIDOR:', (error as any).response.data); // <--- AQUI ESTÁ A RESPOSTA MÁGICA
                console.log('----------------------------------------');

            } else {
                console.error('Erro genérico:', error);
            }
            setEmail("");
            setName("");
            setPhoneNumber("");
            setPassword("");
            Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <Image source={logo} style={styles.logo} resizeMode="cover" />

                    <Text style={styles.title}>{"Cadastre-se"}</Text>
                    <Text style={styles.subtitle}>{"Entre para continuar"}</Text>

                    <View style={styles.form}>
                        <View style={styles.form_fields}>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Nome"
                                placeholderTextColor="#CCCCCC"
                                keyboardType="default"
                                autoCapitalize="none"
                                style={styles.input}
                            />

                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor="#CCCCCC"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                            />

                            <TextInput
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Numero de telefone"
                                placeholderTextColor="#CCCCCC"
                                keyboardType="phone-pad"
                                style={styles.input}
                            />

                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Senha"
                                    placeholderTextColor="#CCCCCC"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Octicons
                                        name={showPassword ? "eye" : "eye-closed"}
                                        size={20}
                                        color="#CCCCCC"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} accessibilityRole="button">
                            {isLoading? <ActivityIndicator color="#121212" /> : <Text style={styles.primaryButtonText}>{"Criar Conta"}</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.switchRow} accessibilityRole="button">
                            <Text style={styles.switchText}>{"Já tem uma conta? Login"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: "#121212" },
    inner: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
    logo: { width: 96, height: 96, borderRadius: 0, marginBottom: 20 },
    title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginBottom: 6 },
    subtitle: { color: "#CCCCCC", fontSize: 14, marginBottom: 18 },
    form: { width: "100%", maxWidth: 420, alignItems: "center", gap: 8 },
    form_fields: { width: "100%", gap: 4 },
    inputContainer: {
        position: "relative",
        width: "100%",
    },
    input: {
        width: "100%",
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        paddingVertical: 14,
        paddingHorizontal: 12,
        paddingRight: 50,
        borderRadius: 8,
        marginBottom: 12,
    },
    eyeButton: {
        position: "absolute",
        right: 15,
        top: 8,
        padding: 5,
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
    dividerWrap: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 18 },
    divider: { flex: 1, height: 1, backgroundColor: "rgba(204,204,204,0.2)" },
    dividerText: { marginHorizontal: 12, color: "#CCCCCC" },
    outlineButton: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(204,204,204,0.2)",
    },
    outlineButtonText: { color: "#FFFFFF" },
    switchRow: { marginTop: 16 },
    switchText: { color: "#C7FF00" },
});
