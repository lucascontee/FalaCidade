import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save } from 'lucide-react-native';
import CategoryService from '../../services/categoryService'; // Ajuste o caminho

export function CategoryCreateScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Preencha o nome e a descrição da categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      await CategoryService.create({ name, description });
      Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      navigation.goBack(); // Volta para a tela anterior
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center gap-3 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Nova Categoria</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-gray-500 mb-6">
          Adicione uma nova categoria de problema para que os cidadãos possam reportar ocorrências corretamente.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-bold text-gray-700 mb-2">Nome da Categoria</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Iluminação Pública"
              className="w-full h-14 px-4 bg-white border border-gray-300 rounded-xl text-gray-900"
              maxLength={50}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-gray-700 mb-2">Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Problemas com postes apagados ou fios caídos..."
              className="w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 min-h-[120px]"
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreate}
          disabled={isSubmitting}
          className={`w-full h-14 rounded-xl items-center justify-center flex-row gap-2 mt-8 ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Save size={20} color="#ffffff" />
              <Text className="text-white font-bold text-lg">Salvar Categoria</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}