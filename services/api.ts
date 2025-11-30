import axios from 'axios';

const api = axios.create({
    baseURL: 'https://bevy-api.onrender.com', // Substitua pela URL base da sua API
    timeout: 10000, // Tempo limite de 10 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para printar o Authorization header
api.interceptors.request.use(
    (config) => {
        console.log('Authorization:', config.headers.Authorization);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;