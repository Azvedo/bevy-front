import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Ou outra lib de criptografia

const api = axios.create({
    baseURL: 'https://bevy-api.onrender.com', // Substitua pela URL base da sua API
    timeout: 10000, // Tempo limite de 10 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Verifica se o erro é 403 (Forbidden) e se ainda não tentou refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
        
            try {
                // Faz refresh do token
                const refreshToken = await SecureStore.getItemAsync('user_refresh_token');
                console.log('Refresh token obtido:', refreshToken);
                const { data } = await axios.get('https://bevy-api.onrender.com/auth/refresh-token', {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });
                console.log('Novo token obtido via refresh:', data);
                // Salva o novo token
                await SecureStore.setItemAsync('user_token', data);            
                // Atualiza o header da requisição original
                api.defaults.headers.Authorization = `Bearer ${data}`;
                originalRequest.headers['Authorization'] = `Bearer ${data}`;
                
                // Retenta a requisição original
                return api(originalRequest);
            } catch (refreshError) {
                // Se falhar o refresh, redireciona para login ou limpa tokens
                await SecureStore.deleteItemAsync('user_token');
                await SecureStore.deleteItemAsync('user_refresh_token');
                // window.location.href = '/login'; // Descomente se quiser redirecionar
                return Promise.reject(refreshError);
            }
        }

        // Manipulação global de erros
        if (error.response) {
            console.error('Erro na resposta da API:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Erro na requisição da API:', error.request);
        } else {
            console.error('Erro ao configurar a requisição da API:', error.message);
        } 
        return Promise.reject(error);
    }
);

export default api;