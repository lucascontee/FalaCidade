/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../services/userService'; 

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('@FalaCidade:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Função para salvar o usuário quando ele faz login
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('@FalaCidade:user', JSON.stringify(userData));
  };

  // Função para limpar tudo quando ele clica em Sair
  const logout = () => {
    setUser(null);
    localStorage.removeItem('@FalaCidade:user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}