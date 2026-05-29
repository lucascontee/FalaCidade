import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity 
} from "react-native";
import { Search, Mail, AlertCircle } from "lucide-react-native";
import UserService, { type User } from "../../services/userService";

const UserRole = {
  Citizen: 0,
  Reviewer: 1,
  Admin: 2
} as const;

function getRoleConfig(role: number) {
  switch (role) {
    case UserRole.Admin:
      return { bg: "bg-purple-100 border-purple-200", text: "text-purple-700", label: "Admin" };
    case UserRole.Reviewer:
      return { bg: "bg-blue-100 border-blue-200", text: "text-blue-700", label: "Analista" };
    default:
      return { bg: "bg-gray-100 border-gray-200", text: "text-gray-600", label: "Cidadão" };
  }
}

export function UserManageScreen() {
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
      Alert.alert("Erro", "Não foi possível atualizar o papel do usuário.");
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
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 z-10 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Gerenciamento</Text>
        <Text className="text-sm text-gray-500 mb-4">Controle permissões de usuários</Text>
        
        <View className="relative w-full h-12 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center px-4">
          <Search size={20} color="#9ca3af" />
          <TextInput 
            placeholder="Filtrar por nome, email ou CPF..." 
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 h-full ml-3 text-gray-900 text-base"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" className="mb-4" />
            <Text className="text-gray-500">Buscando usuários...</Text>
          </View>
        ) : error ? (
          <View className="p-4 rounded-xl bg-red-50 flex-row items-start gap-3 border border-red-200">
            <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
            <Text className="text-sm text-red-700 flex-1">{error}</Text>
          </View>
        ) : (
          <View className="space-y-4">
            
            {filteredUsers.length === 0 && (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-500 text-base text-center">Nenhum usuário encontrado para essa busca.</Text>
              </View>
            )}

            {filteredUsers.map(user => {
              const roleCfg = getRoleConfig(user.role);
              const isUpdating = updatingId === user.id;

              return (
                <View 
                  key={user.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-gray-900 text-base flex-1 pr-2">
                      {user.name}
                    </Text>
                    <View className={`px-2 py-1 rounded-md border ${roleCfg.bg}`}>
                      <Text className={`text-[10px] font-bold uppercase ${roleCfg.text}`}>
                        {roleCfg.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Mail size={14} color="#6b7280" />
                    <Text className="text-sm text-gray-600 truncate flex-1" numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400 font-mono">
                    CPF: {user.cpf || "---.---.------"}
                  </Text>

                  {/* Linha 3: Controles de Papel (Role) */}
                  <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-gray-500 uppercase">Acesso:</Text>
                    
                    {isUpdating ? (
                      <View className="flex-row items-center gap-2 pr-4">
                        <ActivityIndicator size="small" color="#2563eb" />
                        <Text className="text-xs text-gray-500">Atualizando...</Text>
                      </View>
                    ) : (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleRoleChange(user.id, UserRole.Citizen)}
                          disabled={user.role === UserRole.Citizen}
                          className={`px-3 py-1.5 rounded-lg border ${
                            user.role === UserRole.Citizen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${
                            user.role === UserRole.Citizen ? 'text-gray-800' : 'text-gray-500'
                          }`}>Cidadão</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRoleChange(user.id, UserRole.Reviewer)}
                          disabled={user.role === UserRole.Reviewer}
                          className={`px-3 py-1.5 rounded-lg border ${
                            user.role === UserRole.Reviewer ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${
                            user.role === UserRole.Reviewer ? 'text-blue-700' : 'text-gray-500'
                          }`}>Analista</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRoleChange(user.id, UserRole.Admin)}
                          disabled={user.role === UserRole.Admin}
                          className={`px-3 py-1.5 rounded-lg border ${
                            user.role === UserRole.Admin ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${
                            user.role === UserRole.Admin ? 'text-purple-700' : 'text-gray-500'
                          }`}>Admin</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}