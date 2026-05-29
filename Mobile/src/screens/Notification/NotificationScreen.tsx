import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  DeviceEventEmitter 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Bell, Check, AlertCircle, Inbox, ArrowLeft } from "lucide-react-native";
import NotificationService, { type Notification } from "../../services/notificationService";
import { useAuth } from "../../contexts/authContext"; // Reative após arrumar o contexto mobile

export function NotificationScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      const data = await NotificationService.getAllByUser(user!.id);
      setNotifications(data);
    } catch (err) {
      const errorMsg = "Não foi possível carregar suas notificações: " + (err instanceof Error ? err.message : "Erro desconhecido");
      setError(errorMsg);
      Alert.alert("Erro", errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );

      DeviceEventEmitter.emit('notification-read');

    } catch (err) {
      Alert.alert(
        "Erro", 
        "Não foi possível marcar a notificação como lida: " + (err instanceof Error ? err.message : "Erro desconhecido")
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center gap-3 z-10 shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Notificações</Text>
      </View>

      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" className="mb-4" />
            <Text className="text-gray-500">Sincronizando avisos...</Text>
          </View>
        ) : error ? (
          <View className="p-4 m-4 rounded-lg bg-red-50 flex-row items-start gap-3 border border-red-200">
            <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
            <Text className="text-sm text-red-700 flex-1">{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Inbox size={64} color="#9ca3af" className="mb-4 opacity-50" />
            <Text className="text-lg font-semibold text-gray-900 text-center">Tudo limpo por aqui!</Text>
            <Text className="text-sm mt-2 text-gray-400 text-center">Você não possui notificações no momento.</Text>
          </View>
        ) : (
          <View className="bg-white">
            {notifications.map((notif) => (
              <View 
                key={notif.id}
                className={`p-4 flex-row gap-4 border-b border-gray-50 ${!notif.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
              >
                <View className={`mt-1 w-10 h-10 rounded-full items-center justify-center ${!notif.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Bell size={20} color={!notif.isRead ? '#2563eb' : '#9ca3af'} />
                </View>

                <View className="flex-1 space-y-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text className="text-sm text-gray-600 leading-relaxed mt-1">
                    {notif.message}
                  </Text>

                  <View className="pt-3 flex-row gap-4 items-center">
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('OccurrenceDetails', { id: notif.occurrenceId })}
                    >
                      <Text className="text-xs font-bold text-blue-600">
                        Ver ocorrência
                      </Text>
                    </TouchableOpacity>

                    {!notif.isRead && (
                      <TouchableOpacity 
                        onPress={() => handleMarkAsRead(notif.id)}
                        className="flex-row items-center gap-1"
                      >
                        <Check size={14} color="#9ca3af" />
                        <Text className="text-xs font-medium text-gray-400">
                          Marcar como lida
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {!notif.isRead && (
                  <View className="mt-2 w-2.5 h-2.5 bg-blue-600 rounded-full" />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}