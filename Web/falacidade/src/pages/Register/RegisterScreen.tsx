import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import UserService from "../../services/userService";
import { useAuth } from "../../context/authContext";
import axios from "axios";

export function RegisterScreen() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos o contexto para já logar o usuário automaticamente após o cadastro

  // Estados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cpf, setCpf] = useState("");
  // Estados de controle da tela
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validação de senhas iguais no frontend
    if (password !== confirmPassword) {
      return setErrorMessage("As senhas não coincidem.");
    }

    if (password.length < 6) {
      return setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
    }

    setIsLoading(true);

    try {
      // 2. Chama a API para criar a conta
      const newUser = await UserService.registerUser({
        name,
        email,
        password,
        cpf,
        role: "Citizen" 
      });
      
      login(newUser);
      
      navigate('/feed'); 
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.error || "Erro ao criar conta. Verifique seus dados.");
      } else {
        setErrorMessage("Não foi possível conectar ao servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
            <p className="text-gray-600 text-center text-sm">
              Junte-se ao FalaCidade e ajude a melhorar seu bairro
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            
            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700 animate-in fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 mt-2 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          {/* Link para voltar ao Login */}
          <div className="mt-8 text-center">
            <span className="text-gray-600 text-sm">Já tem uma conta? </span>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              onClick={() => navigate('/')} // Volta para o login
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}