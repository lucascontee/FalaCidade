import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image 
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { 
  ArrowLeft, MapPin, Clock, CheckCircle2, 
  XCircle, AlertTriangle, User as UserIcon, Calendar
} from "lucide-react-native";
import OccurrenceService, { type Occurrence, type OccurrenceHistory, OccurrenceStatus } from "../../services/ocurrenceService";
import UserService from "../../services/userService";

function getStatusConfig(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: 
      return { bg: "bg-amber-100", text: "text-amber-800", hex: "#92400e", label: "Em Análise", icon: Clock };
    case OccurrenceStatus.InProgress: 
      return { bg: "bg-blue-100", text: "text-blue-800", hex: "#1e40af", label: "Em Andamento", icon: AlertTriangle };
    case OccurrenceStatus.Resolved: 
      return { bg: "bg-green-100", text: "text-green-800", hex: "#166534", label: "Resolvido", icon: CheckCircle2 };
    case OccurrenceStatus.Rejected: 
      return { bg: "bg-red-100", text: "text-red-800", hex: "#991b1b", label: "Reprovado", icon: XCircle };
    default: 
      return { bg: "bg-gray-100", text: "text-gray-800", hex: "#1f2937", label: "Desconhecido", icon: Clock };
  }
}

export function OccurrenceDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  
  const { id } = route.params || {}; 
  
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [histories, setHistories] = useState<OccurrenceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [citizenName, setCitizenName] = useState("");

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  async function loadData(occurrenceId: number) {
    try {
      const [occurrenceData, historyData] = await Promise.all([
        OccurrenceService.getById(occurrenceId),
        OccurrenceService.getHistory(occurrenceId)
      ]);
      setOccurrence(occurrenceData);
      setHistories(historyData);
      
      const user = await UserService.getUserById(occurrenceData.citizenId || 0);
      setCitizenName(user.name);
    } catch (error) {
      console.error("Erro ao carregar detalhes", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" className="mb-4" />
        <Text className="text-gray-500 font-medium">Carregando detalhes...</Text>
      </View>
    );
  }

  if (!occurrence) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8">
        <AlertTriangle size={64} color="#f59e0b" className="mb-4" />
        <Text className="text-xl font-bold text-gray-900 mb-4">Ocorrência não encontrada</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 font-bold text-base">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = getStatusConfig(occurrence.status);

  return (
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center justify-between z-10 shadow-sm">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2 -ml-2 rounded-full active:bg-gray-100"
          >
            <ArrowLeft size={24} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Detalhes</Text>
        </View>
        
        <View className={`px-3 py-1 rounded-full ${statusCfg.bg}`}>
          <Text className={`text-xs font-bold uppercase ${statusCfg.text}`}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        
        <View className="mb-8">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-black text-gray-900 leading-tight flex-1 pr-4">
              {occurrence.title}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Calendar size={14} color="#9ca3af" />
              <Text className="text-xs text-gray-400">
                {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 leading-relaxed text-base mb-6">
            {occurrence.description}
          </Text>

          <View className="flex-row items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-4">
            <UserIcon size={18} color="#3b82f6" />
            <Text className="text-sm text-gray-600 font-medium">
              Solicitante: <Text className="text-gray-900">{citizenName || "Cidadão"}</Text>
            </Text>
          </View>

          <View className="flex-row items-start gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <MapPin size={18} color="#6b7280" className="mt-0.5" />
            <Text className="text-sm text-gray-600 flex-1 leading-relaxed">
              {occurrence.street}{occurrence.neighborhood ? `, ${occurrence.neighborhood}` : ''} - {occurrence.city}
            </Text>
          </View>
        </View>

        <View className="items-center mb-8">
          <View className="aspect-[4/5] w-full max-w-sm rounded-2xl overflow-hidden bg-gray-200 border border-gray-100 shadow-sm">
            <Image 
              source={{ uri: occurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto" }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        <View className="pt-6 border-t border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-6">Histórico de Atualizações</Text>
          
          {histories.length === 0 ? (
            <View className="bg-gray-200/50 p-4 rounded-xl items-center">
              <Text className="text-sm text-gray-500 italic text-center">
                Aguardando primeira análise da equipe técnica.
              </Text>
            </View>
          ) : (
            <View className="space-y-6 relative">
              <View className="absolute top-0 bottom-0 left-5 w-0.5 bg-gray-200" />
              
              {histories.map((step, idx) => {
                const stepCfg = getStatusConfig(step.newStatus);
                const Icon = stepCfg.icon;

                return (
                  <View key={idx} className="flex-row items-start gap-4">
                    <View className={`w-10 h-10 rounded-full border-4 border-gray-50 items-center justify-center z-10 ${stepCfg.bg}`}>
                      <Icon size={16} color={stepCfg.hex} />
                    </View>

                    <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-xs font-bold text-gray-900">
                          {step.userName || "Equipe FalaCidade"}
                        </Text>
                        <Text className="text-[10px] text-gray-400">
                          {new Date(step.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      
                      <Text className="text-sm text-gray-600 leading-relaxed mb-3">
                        {step.notes}
                      </Text>
                      
                      <View className="self-start">
                        <View className={`px-2 py-1 rounded-md ${stepCfg.bg}`}>
                          <Text className={`text-[10px] font-bold uppercase ${stepCfg.text}`}>
                            {stepCfg.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}