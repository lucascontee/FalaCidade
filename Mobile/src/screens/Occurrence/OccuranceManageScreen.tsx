import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { 
  Search, 
  MapPin, 
  AlertCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User as UserIcon,
  ArrowLeft
} from "lucide-react-native";
import OccurrenceService, { type Occurrence, type OccurrenceHistory, OccurrenceStatus } from "../../services/ocurrenceService";
import { useAuth } from "../../contexts/authContext";
import UserService from "../../services/userService";
import axios from "axios";

// Adaptado para o NativeWind v2 e separando a cor do ícone
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
      return { bg: "bg-gray-100", text: "text-gray-800", hex: "#1f2937", label: "Desconhecido", icon: AlertCircle };
  }
}

const STATUS_OPTIONS = [
  { value: OccurrenceStatus.UnderReview, label: "Em Análise" },
  { value: OccurrenceStatus.InProgress, label: "Em Andamento" },
  { value: OccurrenceStatus.Resolved, label: "Resolvido" },
  { value: OccurrenceStatus.Rejected, label: "Reprovado" }
];

export function OccurrenceManageScreen() {
  const { user } = useAuth();
  
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  
  const [histories, setHistories] = useState<OccurrenceHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState("");
  
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState<OccurrenceStatus | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOccurrences();
  }, []);

  async function loadOccurrences() {
    try {
      const data = await OccurrenceService.getAll();
      setOccurrences(data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar as ocorrências.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelect = async (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence);
    setNewStatus(occurrence.status);
    setNewMessage("");
    
    setIsLoadingHistory(true);
    try {
      const historyData = await OccurrenceService.getHistory(occurrence.id);
      setHistories(historyData);
      const citizen = await UserService.getUserById(occurrence.citizenId || 0);
      setCreatedByName(citizen.name);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar o histórico desta ocorrência.");
      setHistories([]); 
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOccurrence || !user || newStatus === "") return;

    setIsSubmitting(true);
    try {
      await OccurrenceService.updateStatus(selectedOccurrence.id, {
        newStatus: Number(newStatus) as OccurrenceStatus,
        message: newMessage,
        userId: user.id
      });

      await loadOccurrences(); 
      setSelectedOccurrence(prev => prev ? { ...prev, status: Number(newStatus) as OccurrenceStatus } : null);
      
      const updatedHistory = await OccurrenceService.getHistory(selectedOccurrence.id);
      setHistories(updatedHistory);
      
      setNewMessage("");
      Alert.alert("Sucesso", "Status atualizado com sucesso!");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        Alert.alert("Erro", err.response?.data?.error || "Erro ao atualizar a ocorrência.");
      } else {
        Alert.alert("Erro", "Erro ao atualizar a ocorrência.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = occurrences.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedOccurrence) {
    const currentStatusCfg = getStatusConfig(selectedOccurrence.status);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
        
        <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center gap-3 z-10 shadow-sm">
          <TouchableOpacity 
            onPress={() => setSelectedOccurrence(null)}
            className="p-2 rounded-full active:bg-gray-100 -ml-2"
          >
            <ArrowLeft size={24} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Gerenciar Protocolo</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-gray-900 leading-tight">{selectedOccurrence.title}</Text>
              </View>
              <View className={`px-2 py-1 rounded-md ${currentStatusCfg.bg}`}>
                <Text className={`text-[10px] font-bold uppercase ${currentStatusCfg.text}`}>
                  {currentStatusCfg.label}
                </Text>
              </View>
            </View>

            <Text className="text-gray-700 leading-relaxed mb-4">{selectedOccurrence.description}</Text>
            
            <View className="flex-row items-center gap-2 mb-6 bg-gray-50 p-3 rounded-xl">
              <UserIcon size={16} color="#3b82f6" />
              <Text className="text-sm text-gray-600 font-medium">
                Solicitante: <Text className="text-gray-900">{createdByName || "Cidadão"}</Text>
              </Text>
            </View>

            <View className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-200 mb-4 border border-gray-100">
              <Image 
                source={{ uri: selectedOccurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto" }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <View className="flex-row items-center gap-2 mt-2 pt-4 border-t border-gray-50">
              <MapPin size={16} color="#6b7280" />
              <Text className="text-xs text-gray-500 flex-1">
                {selectedOccurrence.street}{selectedOccurrence.neighborhood ? `, ${selectedOccurrence.neighborhood}` : ''} - {selectedOccurrence.city}
              </Text>
            </View>
          </View>

          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <Text className="font-bold text-gray-900 mb-4 text-base">Nova Atualização</Text>
            
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2 pr-4">
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setNewStatus(opt.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      newStatus === opt.value 
                        ? 'bg-blue-50 border-blue-600' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      newStatus === opt.value ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Nota Técnica</Text>
            <TextInput
              placeholder="Descreva a ação tomada..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[100px] text-gray-900 mb-4"
            />

            <TouchableOpacity 
              onPress={handleUpdate}
              disabled={isSubmitting || !newMessage}
              className={`h-12 rounded-xl flex-row items-center justify-center ${
                isSubmitting || !newMessage ? 'bg-blue-300' : 'bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Send size={18} color="white" />
                  <Text className="text-white font-bold ml-2 text-base">Salvar Atualização</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="font-bold text-gray-900 mb-6 text-base">Linha do Tempo</Text>
            
            {isLoadingHistory ? (
              <ActivityIndicator size="large" color="#2563eb" className="py-8" />
            ) : histories.length === 0 ? (
              <Text className="text-sm text-gray-400 italic text-center py-8">Nenhuma ação registrada ainda.</Text>
            ) : (
              <View className="space-y-6 relative">
                <View className="absolute top-0 bottom-0 left-5 w-0.5 bg-gray-100" />
                
                {histories.map((history, idx) => {
                  const histCfg = getStatusConfig(history.newStatus);
                  const Icon = histCfg.icon;
                  
                  return (
                    <View key={idx} className="flex-row items-start gap-4">
                      <View className={`w-10 h-10 rounded-full items-center justify-center border-4 border-white z-10 ${histCfg.bg}`}>
                        <Icon size={16} color={histCfg.hex} />
                      </View>
                      
                      <View className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-xs font-bold text-gray-900">
                            {history.responsibleUser?.name || `Agente #${history.responsibleUserId}`}
                          </Text>
                          <Text className="text-[10px] text-gray-500">
                            {new Date(history.createdAt).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-700 leading-relaxed">
                          {history.notes}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 z-10 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Gestão Pública</Text>
        <View className="relative w-full h-12 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center px-4">
          <Search size={20} color="#9ca3af" />
          <TextInput 
            placeholder="Buscar por título ou categoria..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 h-full ml-3 text-gray-900 text-base"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" className="py-20" />
        ) : filtered.length === 0 ? (
          <View className="items-center justify-center py-20">
            <AlertCircle size={48} color="#d1d5db" className="mb-4" />
            <Text className="text-gray-500 text-base text-center">Nenhuma ocorrência encontrada.</Text>
          </View>
        ) : (
          filtered.map(occurrence => {
            const statusCfg = getStatusConfig(occurrence.status);
            
            return (
              <TouchableOpacity 
                key={occurrence.id}
                activeOpacity={0.7}
                onPress={() => handleSelect(occurrence)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-[10px] font-bold uppercase text-gray-400">
                    {occurrence.category?.name || "Sem Categoria"}
                  </Text>
                  <Text className="text-[10px] text-gray-400">
                    {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                
                <Text className="font-bold text-gray-900 text-base mb-3 leading-tight" numberOfLines={2}>
                  {occurrence.title}
                </Text>
                
                <View className="flex-row justify-between items-center">
                  <View className={`px-2 py-1 rounded-md ${statusCfg.bg}`}>
                    <Text className={`text-[10px] font-bold uppercase ${statusCfg.text}`}>
                      {statusCfg.label}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-1 max-w-[60%]">
                    <MapPin size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 truncate" numberOfLines={1}>
                      {occurrence.street}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}