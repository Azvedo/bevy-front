import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from "expo-router";
import React,{ useEffect, useState } from "react";
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



export default function NewPasswordPage() {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [hasAttempted, setHasAttempted] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    // Validação em tempo real
    useEffect(() => {
        if (!hasAttempted && !newPassword && !confirmPassword) return;
        
        setError('');
        
        if (newPassword.length > 0 && newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
    }, [newPassword, confirmPassword, hasAttempted]);

    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        setHasAttempted(true);
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setHasAttempted(true);
    };

    const validatePasswords = () => {
        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return false;
        }
        
        return true;
    };

    const handleSetNewPassword = () => {
        setHasAttempted(true);
        if (validatePasswords()) {
            // aqui você adicionaria validação / chamada de API para enviar o código de recuperação
            router.replace("/(auth)/login");
        }
    };

    const hasPasswordError = hasAttempted && newPassword.length > 0 && newPassword.length < 6;
    const hasConfirmError = hasAttempted && confirmPassword.length > 0 && newPassword !== confirmPassword;
    const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword && newPassword.length > 0;

    return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <Octicons name="shield-check" size={70} color="#C7FF00" />
                    <Text style={styles.title}>{"Crie sua nova senha"}</Text>
                    <Text style={styles.subtitle}>{"Para sua segurança, crie uma senha forte com pelo menos 6 caracteres."}</Text>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={newPassword}
                                onChangeText={handleNewPasswordChange}
                                placeholder="Nova senha"
                                placeholderTextColor="#CCCCCC"
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                style={[
                                    styles.input,
                                    hasPasswordError && styles.inputError
                                ]}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Octicons 
                                    name={showNewPassword ? "eye" : "eye-closed"} 
                                    size={20} 
                                    color="#CCCCCC" 
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={handleConfirmPasswordChange}
                                placeholder="Confirme a nova senha"
                                placeholderTextColor="#CCCCCC"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                style={[
                                    styles.input,
                                    hasConfirmError && styles.inputError
                                ]}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Octicons 
                                    name={showConfirmPassword ? "eye" : "eye-closed"} 
                                    size={20} 
                                    color="#CCCCCC" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity 
                        onPress={handleSetNewPassword} 
                        style={[
                            styles.primaryButton,
                            !isFormValid && styles.primaryButtonDisabled
                        ]} 
                        accessibilityRole="button"
                        disabled={!isFormValid}
                    >
                        <Text style={styles.primaryButtonText}>{"Confirmar Nova Senha"}</Text>
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
        borderWidth: 1,
        borderColor: "transparent",
    },
    eyeButton: {
        position: "absolute",
        right: 15,
        top: 10,
        padding: 5,
    },
    inputError: {
        borderColor: "#FF4444",
        borderWidth: 1,
    },
    errorText: {
        color: "#FF4444",
        marginBottom: 12,
        textAlign: "center",
        fontSize: 14,
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