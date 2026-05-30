import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  DeviceEventEmitter,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LayoutGrid, ClipboardList, PlusCircle, LogOut, Users, ListCheck, Bell, X, Tag } from "lucide-react-native";
import { useAuth } from "../contexts/authContext";
import NotificationService from "../services/notificationService";

const UserRole = {
  Citizen: 0,
  Reviewer: 1,
  Admin: 2
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute(); 
  
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    if (!user) return;
    try {
      const data = await NotificationService.getUnread(user.id);
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    }
  }

  useEffect(() => {
    loadNotifications();
    
    const subscription = DeviceEventEmitter.addListener('notification-read', () => {
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleNavigate = (screenName: string) => {
    onClose(); 
    navigation.navigate(screenName);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose} 
          className="absolute inset-0 bg-black/50" 
        />

        <View className="w-72 h-full bg-white shadow-xl flex flex-col pt-12 pb-8">
          
          <View className="flex-row items-center justify-between px-6 mb-8">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center shadow-sm">
                <Text className="text-white font-bold text-xl">F</Text>
              </View>
              <Text className="font-bold text-gray-900 text-lg">FalaCidade</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2 bg-gray-50 rounded-full active:bg-gray-100">
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 space-y-1">
            
            <SidebarItem 
              label="Notificações" 
              isActive={route.name === "Notifications"}
              onPress={() => handleNavigate("Notifications")}
              icon={
                <View className="relative">
                  <Bell size={24} color={route.name === "Notifications" ? "#2563eb" : "#4b5563"} />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 h-4 w-4 items-center justify-center rounded-full bg-red-500 border border-white">
                      <Text className="text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              } 
            />

            <SidebarItem 
              label="Feed" 
              isActive={route.name === "Feed"}
              onPress={() => handleNavigate("Feed")}
              icon={<LayoutGrid size={24} color={route.name === "Feed" ? "#2563eb" : "#4b5563"} />} 
            />

            <SidebarItem 
              label="Minhas Ocorrências" 
              isActive={route.name === "MyOccurrences"}
              onPress={() => handleNavigate("MyOccurrences")}
              icon={<ClipboardList size={24} color={route.name === "MyOccurrences" ? "#2563eb" : "#4b5563"} />} 
            />

            <SidebarItem 
              label="Criar Ocorrência" 
              isActive={route.name === "OccurrenceEditor"}
              onPress={() => handleNavigate("OccurrenceEditor")}
              icon={<PlusCircle size={24} color={route.name === "OccurrenceEditor" ? "#2563eb" : "#4b5563"} />} 
            />

            {(user?.role === UserRole.Admin || user?.role === UserRole.Reviewer) && (
              <>
                <SidebarItem 
                  label="Gestão de Ocorrências" 
                  isActive={route.name === "OccurrenceManage"}
                  onPress={() => handleNavigate("OccurrenceManage")}
                  icon={<ListCheck size={24} color={route.name === "OccurrenceManage" ? "#2563eb" : "#4b5563"} />} 
                />

                <SidebarItem 
                  label="Criar Categoria" 
                  isActive={route.name === "CategoryCreate"}
                  onPress={() => handleNavigate("CategoryCreate")}
                  icon={<Tag size={24} color={route.name === "CategoryCreate" ? "#2563eb" : "#4b5563"} />} 
                />
              </>
            )}

            {user?.role === UserRole.Admin && (
              <SidebarItem 
                label="Gerenciar Usuários" 
                isActive={route.name === "UserManage"}
                onPress={() => handleNavigate("UserManage")}
                icon={<Users size={24} color={route.name === "UserManage" ? "#2563eb" : "#4b5563"} />} 
              />
            )}
          </View>

          <View className="px-4 mt-auto border-t border-gray-100 pt-4">
            <SidebarItem 
              label="Sair da conta" 
              isLogout
              onPress={handleLogout}
              icon={<LogOut size={24} color="#ef4444" />} 
            />
          </View>

        </View>
      </View>
    </Modal>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isLogout?: boolean;
  onPress: () => void;
}

function SidebarItem({ icon, label, isActive, isLogout, onPress }: SidebarItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center gap-4 px-4 py-3.5 rounded-xl mb-1 ${
        isActive && !isLogout ? "bg-blue-50" : ""
      }`}
    >
      <View className="flex-shrink-0">{icon}</View>
      <Text 
        className={`font-medium text-base ${
          isActive && !isLogout 
            ? "text-blue-600" 
            : isLogout 
            ? "text-red-500" 
            : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}