import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MessageSquare, AlertCircle } from "lucide-react-native";
import UserService from "../../services/userService";
import { useAuth } from "../../contexts/authContext";
import axios from "axios";

export function RegisterUserScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth(); 

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");

    if (!name || !email || !cpf || !password || !confirmPassword) {
      return setErrorMessage("Por favor, preencha todos os campos.");
    }

    if (password !== confirmPassword) {
      return setErrorMessage("As senhas não coincidem.");
    }

    if (password.length < 6) {
      return setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
    }

    setIsLoading(true);

    try {
      const newUser = await UserService.registerUser({
        name,
        email,
        password,
        cpf,
        role: "Citizen" 
      });
      
      login(newUser);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Feed' }],
      });
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.error || "Erro ao criar conta. Verifique seus dados.");
      } else {
        setErrorMessage("Não foi possível conectar ao servidor.");
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}>
        <View className="px-8">
          
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <MessageSquare size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta</Text>
            <Text className="text-gray-500 text-center text-sm px-4">
              Junte-se ao FalaCidade e ajude a melhorar seu bairro
            </Text>
          </View>

          {errorMessage !== "" && (
            <View className="p-4 rounded-xl bg-red-50 flex-row items-start gap-3 border border-red-200 mb-6">
              <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
              <Text className="text-sm text-red-700 flex-1 font-medium">{errorMessage}</Text>
            </View>
          )}

          <View className="space-y-4">
            
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Nome Completo</Text>
              <TextInput
                placeholder="Ex: João da Silva"
                value={name}
                onChangeText={setName}
                className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Email</Text>
              <TextInput
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">CPF</Text>
              <TextInput
                placeholder="000.000.000-00"
                keyboardType="numeric"
                value={cpf}
                onChangeText={setCpf}
                className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">Senha</Text>
                <TextInput
                  placeholder="••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
                />
              </View>

              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">Confirmar</Text>
                <TextInput
                  placeholder="••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="bg-gray-50 border border-gray-200 h-14 rounded-2xl px-4 text-base text-gray-900"
                />
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={isLoading}
              className={`h-14 rounded-2xl flex-row items-center justify-center shadow-sm mt-6 ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="white" className="mr-2" />
                  <Text className="text-white text-lg font-bold">Cadastrando...</Text>
                </>
              ) : (
                <Text className="text-white text-lg font-bold">Criar Conta</Text>
              )}
            </TouchableOpacity>

          </View>

          <View className="mt-8 flex-row justify-center items-center">
            <Text className="text-gray-600 text-sm">Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-blue-600 font-bold text-sm">Fazer login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}