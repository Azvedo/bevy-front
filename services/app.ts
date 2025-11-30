import api from "./api";

export interface CreateEventDTO {
  nome: string;
  descricao: string;
  localizacao: string;
  latitude: number;
  longitude: number;
  dataHora: string;
  intensidade: string;
  tipoCampo: string;
  vagas: number; // Novo campo adicionado
  custoPeladeiro: number;
  custoPrestadorServico: number;
}

export const createEvent = async (eventData: CreateEventDTO) => {
  const response = await api.post("/eventos", eventData);
  return response.data;
};
