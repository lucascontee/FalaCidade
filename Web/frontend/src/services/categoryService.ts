import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/category');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/api/category/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/api/category', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/category/${id}`);
  }
};

export default CategoryService;