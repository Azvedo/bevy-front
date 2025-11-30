import * as SecureStore from 'expo-secure-store'; // Ou outra lib de criptografia
import api from '../services/api';

// Função para salvar logo após o login
export const saveAuthData = async (accessToken: string, refreshToken: string) => {
    try {
        await SecureStore.setItemAsync('user_token', accessToken);
        await SecureStore.setItemAsync('user_refresh_token', refreshToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
        console.error("Erro ao salvar tokens", error);
    }
};

export const clearAuthData = async () => {
    try {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_refresh_token');
        api.defaults.headers.Authorization = '';
    } catch (error) {
        console.error("Erro ao limpar tokens", error);
    }
};

// Função para checar se o usuário já está logado ao abrir o App
export const checkLoginStatus = async () => {
    try {
        const token = await SecureStore.getItemAsync('user_token');
        const refresh = await SecureStore.getItemAsync('user_refresh_token');

        if (token && refresh) {
            // Configura o axios com o token recuperado
            api.defaults.headers.Authorization = `Bearer ${token}`;
            return true; // Usuário está logado
        }
    } catch (error) {
        return false;
    }
    return false;
};