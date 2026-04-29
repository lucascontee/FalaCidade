import api from './api';
import type { User } from './userService';

export const OccurrenceStatus = {
  UnderReview: 0,
  InProgress: 1,
  Resolved: 2,
  Rejected: 3
} as const;

export type OccurrenceStatus = typeof OccurrenceStatus[keyof typeof OccurrenceStatus];

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Occurrence {
  id: number;
  title: string;
  description: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  city: string;
  neighborhood: string;
  street: string;
  status: OccurrenceStatus;
  createdAt: string;
  category?: Category; 
  histories?: OccurrenceHistory[];
}

export interface CreateOccurrencePayload {
  citizenId: number;
  categoryId: number;
  title: string;
  description: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
}

export interface OccurrenceHistory {
  id: number;
  occurrenceId: number;
  responsibleUserId: number; 
  responsibleUser?: User; 
  userName?: string; 
  notes: string;
  previousStatus: OccurrenceStatus;
  newStatus: OccurrenceStatus;
  createdAt: string;
}

const OccurrenceService = {

  getAll: async (): Promise<Occurrence[]> => {
    const response = await api.get<Occurrence[]>('/api/occurrence');
    return response.data;
  },

  getAllForFeed: async (): Promise<Occurrence[]> => {
    const response = await api.get<Occurrence[]>('/api/occurrence/getAllForFeed');
    return response.data;
  },

  create: async (data: CreateOccurrencePayload): Promise<Occurrence> => {
    const response = await api.post<Occurrence>('/api/occurrence', data);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/category');
    return response.data;
  },
  
  getByUserId: async (userId: number): Promise<Occurrence[]> => {
    const response = await api.get<Occurrence[]>(`/api/occurrence/user/${userId}`);
    return response.data;
  },

  updateStatus: async (
    occurrenceId: number, 
    payload: { newStatus: OccurrenceStatus; message: string; userId: number }
  ): Promise<void> => {
    await api.post(`/api/occurrence/${occurrenceId}/history`, payload);
  },

  getHistory: async (occurrenceId: number): Promise<OccurrenceHistory[]> => {
    const response = await api.get<OccurrenceHistory[]>(`/api/occurrence/${occurrenceId}/history`);
    return response.data;
  },

  getAddressFromCoords: async (lat: number, lng: number): Promise<string> => {
    try {
      // Fazemos uma requisição GET para a API do Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      const data = await response.json();

      if (data && data.address) {
        const street = data.address.road || "Rua desconhecida";
        const neighborhood = data.address.suburb || data.address.neighbourhood || "";
        const city = data.address.city || data.address.town || data.address.village || "";
        
        return `${street}${neighborhood ? `, ${neighborhood}` : ''} - ${city}`;
      }
      
      return "Endereço não encontrado";
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      return "Erro ao carregar endereço";
    }
  }
};


export default OccurrenceService;