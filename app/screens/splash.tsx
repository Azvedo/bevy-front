import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Ajuste o caminho/nome do logo conforme seu projeto
const logo = require("../../assets/images/image.png");

export default function SplashPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const onContinue = () => {
        router.replace("/screens/login");
    }

    return (
        <LinearGradient
            colors={["#121212", "#121212"]}
            start={[0, 0]}
            end={[0, 0.9]}
            style={[styles.safe, { paddingTop: insets.top }]}
        >
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Image source={logo} style={styles.logo} resizeMode="cover" />

                    <View style={styles.textWrap}>
                        <Text style={styles.title}>Bevy Now</Text>
                        <Text style={styles.subtitle}>Conecte-se para praticar esportes</Text>
                    </View>

                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Começar"
                        onPress={onContinue}
                        style={styles.button}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Começar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#121212" },
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    inner: {
        width: "100%",
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: { width: 160, height: 160, borderRadius: 0, marginBottom: 24 },
    textWrap: { alignItems: "center" },
    title: { color: "#FFFFFF", fontSize: 36, fontWeight: "700", marginBottom: 8 },
    subtitle: { color: "#CCCCCC", fontSize: 16 },
    button: {
        marginTop: 32,
        backgroundColor: "#C7FF00",
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 12,
    },
    buttonText: { color: "#121212", fontWeight: "700", fontSize: 16 },
});

// Grafite ou Azul-Petróleo (Fundo): Um fundo escuro, mas não preto puro. (Ex: #121212 ou #0A2239)

// Verde-Limão ou "Volt" (Destaque/CTA): A cor de destaque absoluta. Usada para botões, ícones ativos e links. É elétrica e tem tudo a ver com esporte. (Ex: #C7FF00)

// Branco (Texto Principal): Alto contraste contra o fundo escuro. (Ex: #FFFFFF)

// Cinza-Médio (Texto Secundário/Ícones): Para informações menos importantes ou ícones inativos. (Ex: #888888)