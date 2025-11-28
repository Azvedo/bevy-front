import React, { useState } from "react";
import {
    Image,
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

interface LoginPageProps {
    onLogin?: () => void;
}

const logo = require("../../assets/images/image.png");

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSubmit = () => {
        // aqui você adicionaria validação / chamada de API
        onLogin && onLogin();
        router.push("/(main)/home");

    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <Image source={logo} style={styles.logo} resizeMode="cover" />

                    <Text style={styles.title}>{"Faça login"}</Text>
                    <Text style={styles.subtitle}>{"Entre para continuar"}</Text>

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

                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Senha"
                            placeholderTextColor="#CCCCCC"
                            secureTextEntry
                            style={styles.input}
                        />

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} accessibilityRole="button">
                            <Text style={styles.primaryButtonText}>{"Entrar"}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerWrap}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity onPress={() =>  router.push("/screens/signup")} style={styles.switchRow} accessibilityRole="button">
                            <Text style={styles.switchText}>{"Não tem uma conta? Cadastrar"}</Text>
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
    form: { width: "100%", maxWidth: 420, alignItems: "center" },
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
