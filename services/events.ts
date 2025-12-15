import api from './api';

export type EventoDTO = {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  dataHora: string;
  custoPeladeiro: number;
  vagas: number;
  tipoCampo: string;
  intensidade: string;
  peladeirosInscritos: { id: string; nome: string; nota: string }[];
  prestadorsInscritos: { id: string; nome: string; tipoPrestadorServico: string; nota: string }[];
};

export const getSubscribedEvents = async (): Promise<EventoDTO[]> => {
  const response = await api.get('/user/subscribed-events');
  return response.data;
};

export const getEventById = async (eventId: string): Promise<EventoDTO> => {
  const response = await api.get(`/event/${eventId}`);
  return response.data;
};

export const participateInEvent = async (eventId: string): Promise<void> => {
  await api.post(`/user/participate/${eventId}`);
};

export const quitEvent = async (eventId: string): Promise<void> => {
  await api.post(`/user/quit-event/${eventId}`);
};