import api from './api';

export const searchSessions = async (query: URLSearchParams) => {
    const res = await api.get(`/user/feed?${query.toString()}`);
    return res.data; // array expected
};

export const searchServices = async (query: URLSearchParams) => {
    // Endpoint to search providers/services. Adjust path if your API differs.
    const res = await api.get(`/user/convocation/providers?${query.toString()}`);
    return res.data; // array expected
};

export const searchMySessions = async () => {
    const res = await api.get('/user/subscribed-events');
    return res.data; // array expected
};

export const searchCreatedSessions = async () => {
    const res = await api.get('/user/created-events');
    return res.data; // array expected
};