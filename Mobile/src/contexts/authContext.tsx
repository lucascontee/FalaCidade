import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type User } from '../services/userService'; 

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Novo estado muito importante no Mobile
  login: (userData: User) => Promise<void>; // Agora é async
  logout: () => Promise<void>; // Agora é async
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Começa como true para a tela não piscar enquanto busca no AsyncStorage
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    async function loadStorageData() {
      try {
        // Busca os dados da memória nativa do celular
        const storedUser = await AsyncStorage.getItem('@FalaCidade:user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao resgatar usuário do storage:", error);
      } finally {
        // Avisa que terminou de procurar, tendo achado ou não
        setIsLoading(false); 
      }
    }

    loadStorageData();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    // Salva na memória nativa
    await AsyncStorage.setItem('@FalaCidade:user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    // Remove da memória nativa
    await AsyncStorage.removeItem('@FalaCidade:user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}