import api from './api';


export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string; 
  role: number; 
  createdAt: string; 
}

export interface LoginRequest {
  email: string;
  password?: string; 
}


export interface RegisterUserRequest {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  role: string;
}


const UserService = {

  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await api.post<User>('/api/user/login', credentials);
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/user');
    return response.data;
  },

  registerUser: async (data: RegisterUserRequest): Promise<User> => {
    const response = await api.post<User>(`/api/user/register/${data.role.toLowerCase()}`, data);
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/user/${id}`);
    return response.data;
  },

  updateRole: async (userId: number, newRole: number): Promise<void> => {
    await api.patch(`/api/user/${userId}/role`, { role: newRole });
  }
};

export default UserService;