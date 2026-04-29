/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Search, Mail, Loader2, AlertCircle } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import UserService, { type User } from "../../services/userService";

const UserRole = {
  Citizen: 0,
  Reviewer: 1,
  Admin: 2
} as const;

export function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await UserService.getAll();
        setUsers(data);
      } catch (err) {
        setError("Não foi possível carregar a lista de usuários.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUsers();
  }, []);
    
  const handleRoleChange = async (userId: number, newRole: number) => {
    setUpdatingId(userId);
    try {
      await UserService.updateRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Erro ao atualizar o papel do usuário.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.cpf?.includes(searchTerm)) 
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="text-gray-500">Controle permissões e visualize membros da plataforma</p>
      </header>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="Filtrar por nome, email ou CPF..." 
          className="pl-10 h-12 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex gap-2"><AlertCircle /> {error}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Usuário</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">CPF</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Papel Atual</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      { user.cpf || "---.---.------" }
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        user.role === UserRole.Admin ? 'bg-purple-100 text-purple-700' :
                        user.role === UserRole.Reviewer ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }>
                        {user.role === UserRole.Admin ? 'Admin' : 
                         user.role === UserRole.Reviewer ? 'Analista' : 'Cidadão'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {updatingId === user.id ? (
                          <Loader2 size={16} className="animate-spin text-blue-600 mr-4" />
                        ) : (
                          <select 
                            className="text-xs border rounded-md p-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                          >
                            <option value={UserRole.Citizen}>Cidadão</option>
                            <option value={UserRole.Reviewer}>Analista</option>
                            <option value={UserRole.Admin}>Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">Nenhum usuário encontrado para essa busca.</div>
          )}
        </div>
      )}
    </div>
  );
}