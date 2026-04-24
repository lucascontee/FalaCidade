import api from './api';


export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string; 
  role: 'Citizen' | 'Reviewer' | 'Admin'; 
  createdAt: string; 
}

export interface LoginRequest {
  email: string;
  password?: string; 
}

export interface RegisterCitizenRequest {
  name: string;
  email: string;
  password?: string;
}


const UserService = {

  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await api.post<User>('/api/user/login', credentials);
    return response.data;
  },


  registerCitizen: async (data: RegisterCitizenRequest): Promise<User> => {
    const response = await api.post<User>('/api/user/register/citizen', data);
    return response.data;
  },


  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/user/${id}`);
    return response.data;
  }
};

export default UserService;