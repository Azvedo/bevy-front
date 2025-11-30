import api from './api';

export const searchSessions = async (query: URLSearchParams) => {
    const res = await api.get(`/user/feed?${query.toString()}`);
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