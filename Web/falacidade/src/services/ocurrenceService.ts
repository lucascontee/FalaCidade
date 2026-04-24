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
  category?: Category; // Vem junto por causa do .Include(o => o.Category) no C#
}

const OccurrenceService = {

  getAll: async (): Promise<Occurrence[]> => {
    const response = await api.get<Occurrence[]>('/api/occurrence');
    return response.data;
  }
};

export default OccurrenceService;