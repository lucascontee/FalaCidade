import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MapPin, AlertCircle, Inbox, Plus } from "lucide-react-native";
import OccurrenceService, { type Occurrence, OccurrenceStatus } from "../../services/ocurrenceService";
import { useAuth } from "../../contexts/authContext"; // Reative após arrumar o contexto mobile

function getStatusConfig(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: 
      return { bg: "bg-amber-100 border-amber-200", text: "text-amber-800", label: "Em Análise" };
    case OccurrenceStatus.InProgress: 
      return { bg: "bg-blue-100 border-blue-200", text: "text-blue-800", label: "Em Andamento" };
    case OccurrenceStatus.Resolved: 
      return { bg: "bg-green-100 border-green-200", text: "text-green-800", label: "Resolvido" };
    default: 
      return { bg: "bg-gray-100 border-gray-200", text: "text-gray-800", label: "Desconhecido" };
  }
}

export function MyOccurrencesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyOccurrences() {
      try {
        const data = await OccurrenceService.getByUserId(user?.id || 0);
        setOccurrences(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar suas ocorrências.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMyOccurrences();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 shadow-sm z-10">
        <Text className="text-xl font-bold text-gray-900">Minhas Ocorrências</Text>
        <Text className="text-xs text-gray-500 mt-1">Acompanhe o status dos seus relatos</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" className="mb-4" />
            <Text className="text-gray-500">Buscando seus registros...</Text>
          </View>
        )}

        {error !== "" && (
          <View className="p-4 rounded-lg bg-red-50 flex-row items-start gap-3 border border-red-200 mb-4">
            <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
            <Text className="text-red-700 flex-1">{error}</Text>
          </View>
        )}

        {!isLoading && occurrences.length === 0 && !error && (
          <View className="items-center justify-center py-20">
            <Inbox size={64} color="#9ca3af" className="mb-4 opacity-50" />
            <Text className="text-lg font-semibold text-gray-900 text-center">Nenhum relato ainda</Text>
            <Text className="text-sm px-8 mt-2 text-gray-500 text-center">
              Você ainda não enviou nenhuma ocorrência para a prefeitura.
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Report')}
              className="mt-6"
            >
              <Text className="text-blue-600 font-bold text-base">Criar minha primeira ocorrência</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="space-y-6">
          {occurrences.map((occurrence) => {
            const statusConfig = getStatusConfig(occurrence.status);
            
            return (
              <TouchableOpacity
                key={occurrence.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('OccurrenceDetails', { id: occurrence.id })}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
              >
                <View className="w-full aspect-[4/5] bg-gray-200 relative">
                  <Image
                    source={{ uri: occurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto" }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  
                  <View className={`absolute top-4 right-4 px-3 py-1 rounded-full border shadow-sm ${statusConfig.bg}`}>
                    <Text className={`text-[10px] font-bold uppercase ${statusConfig.text}`}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {occurrence.category?.name || "Geral"}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  
                  <Text className="font-bold text-gray-900 mb-2 text-base leading-tight" numberOfLines={2}>
                    {occurrence.title}
                  </Text>

                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color="#6b7280" />
                    <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                      {occurrence.street}{occurrence.neighborhood ? `, ${occurrence.neighborhood}` : ''} - {occurrence.city}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Report")}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg items-center justify-center"
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
      
    </View>
  );
}