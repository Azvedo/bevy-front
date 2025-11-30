import api from './api';

type RegisteUserPayload = {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
};

export const registerUser = async (payload: RegisteUserPayload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
}

export const loginUser = async (email: string, senha: string) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
}

export const sendEmailForPasswordReset = async (email: string) => {
    const response = await api.post(`/forgot-password/send-code/${encodeURIComponent(email)}`);
    return response.data;
}

export const verifyResetCode = async (email: string, code: string) => {
    const response = await api.post('/forgot-password/confirm-code', { email, code });
    return response.data;
}