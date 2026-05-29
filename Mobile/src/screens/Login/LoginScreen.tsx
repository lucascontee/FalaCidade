import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from "react-native";
import { MessageSquare } from "lucide-react-native";
import UserService from "../../services/userService"; 
import axios from "axios";
import { useAuth } from "../../contexts/authContext"; 

export function LoginScreen() {
  const { login } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setShowError(false);

    try {
      const user = await UserService.login({ email, password });
      console.log("Login com sucesso:", user);
        login(user); 
        navigation.navigate('Feed'); 
    } catch (error) {
      console.log("ERRO REAL DO AXIOS:", error);
      if (axios.isAxiosError(error)) {
        const mensagemServidor = error.response?.data?.error;
        setErrorMessage(mensagemServidor || 'Erro ao conectar com o servidor.');
        setShowError(true);
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-20 pb-10 justify-center">
          
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center shadow-lg mb-4">
              <MessageSquare size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">FalaCidade</Text>
            <Text className="text-gray-500 text-center mt-2">
              Conectando cidadãos e governo
            </Text>
          </View>

          {showError && (
            <View className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
              <Text className="text-red-600 text-sm text-center">{errorMessage}</Text>
            </View>
          )}

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Senha</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={handleSignIn}
              disabled={isLoading}
              className={`h-14 rounded-2xl items-center justify-center shadow-sm mt-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-8 items-center">
            <Text className="text-blue-600 font-semibold text-base">
              Criar uma conta
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}