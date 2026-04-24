
import { useState } from "react";
import { useNavigate } from "react-router";
import { MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import UserService from "../../services/userService"; 
import axios from "axios";
import { useAuth } from "../../context/authContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);

    try {
      const user = await UserService.login({ email, password });
      login(user);

      console.log('Bem-vindo, ', user.name);
      console.log('Papel: ', user.role);
      
      navigate('/feed'); 
      
      } catch (error){
      if (axios.isAxiosError(error)) {
        const mensagemServidor = error.response?.data?.error;
        if (mensagemServidor) {
          alert(mensagemServidor);
        } else {
          alert('Erro ao conectar com o servidor.');
        }     
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FalaCidade</h1>
            <p className="text-gray-600 text-center">
              Conectando cidadãos e governo
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12 bg-white border-gray-300 text-base"
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-white border-gray-300 text-base"
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading} 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-semibold rounded-lg shadow-sm"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium text-base"
              onClick={() => navigate('/register')} // Manda para a tela de cadastro
            >
              Criar uma conta
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 text-center text-sm text-gray-500">
        <p>Uma plataforma de participação cidadã</p>
      </div>
    </div>
  );
}