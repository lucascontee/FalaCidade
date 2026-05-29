import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  RefreshControl
} from "react-native";
import { useNavigation } from "@react-navigation/native";
  import { User, Plus, MapPin, AlertCircle, Menu } from "lucide-react-native";
import { Sidebar } from "../../layouts/sidebar";
import OccurrenceService, { type Occurrence, OccurrenceStatus } from "../../services/ocurrenceService";
import { useAuth } from "../../contexts/authContext"; 

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

export function OccurrencesFeedScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const onRefresh = async () => {
    setRefreshing(true); 
    
    try {
      const data = await OccurrenceService.getAllForFeed();
      setOccurrences(data);
      setError(""); 
    } catch (err) {
      console.error(err);
      setError("Não foi possível recarregar as ocorrências.");
    } finally {
      setRefreshing(false); 
    }
  };

  useEffect(() => {
    async function loadOccurrences() {
      try {
        const data = await OccurrenceService.getAllForFeed();
        setOccurrences(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as ocorrências.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOccurrences();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        
        <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center justify-between z-10 shadow-sm">    
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => setIsMenuOpen(true)} 
              className="p-2 -ml-2 rounded-full active:bg-gray-100"
            >
              <Menu size={28} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">FalaCidade</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="text-sm font-medium text-gray-500">
              {user?.name}
            </Text>
            <View className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={20} color="#374151" />
            </View>
          </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"  
          />
        }
      >
        
        <Text className="text-lg font-bold text-gray-900 mb-6">
          Ocorrências Reportadas
        </Text>

        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#2563eb" className="mb-4" />
            <Text className="text-gray-500">Carregando ocorrências...</Text>
          </View>
        )}

        {error !== "" && !isLoading && (
          <View className="p-4 rounded-xl bg-red-50 flex-row items-start gap-3 border border-red-200 mb-4">
            <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
            <Text className="text-sm text-red-700 flex-1 leading-relaxed">{error}</Text>
          </View>
        )}

        {!isLoading && !error && occurrences.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-base">Nenhuma ocorrência reportada ainda.</Text>
            <Text className="text-sm text-gray-400 mt-1">Seja o primeiro a reportar um problema!</Text>
          </View>
        )}

        {!isLoading && !error && (
          <View className="space-y-6">
            {occurrences.map((occurrence) => {
              const statusCfg = getStatusConfig(occurrence.status);

              return (
                <TouchableOpacity
                  key={occurrence.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("OccurrenceDetails", { id: occurrence.id })}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6"
                >
                  <View className="aspect-[4/5] w-full bg-gray-200">
                    <Image
                      source={{ uri: occurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto" }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="p-4">
                    <Text className="font-bold text-gray-900 mb-3 text-base leading-tight">
                      {occurrence.title}
                    </Text>

                    <View className="flex-row flex-wrap gap-2 mb-4">
                      <View className="px-2 py-1 rounded-md bg-gray-100 border border-gray-300">
                        <Text className="text-[10px] text-gray-700 font-bold uppercase">
                          {occurrence.category?.name || "Sem Categoria"}
                        </Text>
                      </View>
                      <View className={`px-2 py-1 rounded-md border ${statusCfg.bg}`}>
                        <Text className={`text-[10px] font-bold uppercase ${statusCfg.text}`}>
                          {statusCfg.label}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-1.5 border-t border-gray-50 pt-3">
                      <MapPin size={16} color="#9ca3af" />
                      <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                        {occurrence.street}{occurrence.neighborhood ? `, ${occurrence.neighborhood}` : ''} - {occurrence.city}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate("OccurrenceEditor")}
        className="absolute bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-lg items-center justify-center z-50"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>

    </View>
  );
}