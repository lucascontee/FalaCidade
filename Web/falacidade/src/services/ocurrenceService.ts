import api from './api';

export const OccurrenceStatus = {
  UnderReview: 0,
  InProgress: 1,
  Resolved: 2
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
  status: OccurrenceStatus;
  createdAt: string;
  category?: Category; 
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
  }
};

export default OccurrenceService;