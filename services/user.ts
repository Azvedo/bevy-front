import api from "./api";

export const getUserProfile = async () => {
  const response = await api.get(`/user/profile`);
  return response.data;
}

export const eventHistory = async () => {
  const response = await api.get(`/user/event-history`);
  return response.data;
}

export const createProvider = async (payload: any) => {
  const response = await api.post(`/user/provider`, payload);
  return response.data;
}

export const getConvocations = async () => {
  const response = await api.get(`/user/provider/convocations`);
  return response.data;
}

export const confirmConvocation = async (idEvento: string,idPrestadorServico: string) => {
  const response = await api.post(`/user/provider/confirm-convocation`, { idEvento, idPrestadorServico });
  return response.data;
}

export const getMyGames = async () => {
  const response = await api.get(`/user/provider/my-games`);
  return response.data;
}