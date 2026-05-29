import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Camera, AlertCircle, CheckCircle2 } from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import OccurrenceService, { type Category } from "../../services/ocurrenceService";
import { useAuth } from "../../contexts/authContext";

export function OccurrenceEditorScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const data = await OccurrenceService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias.");
      } finally {
        setIsLoadingCategories(false);
      }
    }

    async function getUserLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão negada", "Precisamos da sua localização para centrar o mapa.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;

      setMapRegion({
        latitude: currentLat,
        longitude: currentLng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setLatitude(currentLat);
      setLongitude(currentLng);
    }

    fetchInitialData();
    getUserLocation();
  }, []);

  const handleSubmit = async () => {
    setError("");
    
    if (!categoryId) return setError("Por favor, selecione uma categoria.");
    if (latitude === null || longitude === null) return setError("Por favor, toque no mapa para marcar o local.");
    if (!title || !description) return setError("Preencha o título e a descrição.");

    setIsSubmitting(true);

    try {
      await OccurrenceService.create({
        citizenId: user!.id, 
        categoryId: Number(categoryId),
        title,
        description,
        photoUrl: photoUrl || "", 
        latitude,
        longitude
      });

      setSuccess(true);
      
      setTimeout(() => {
        navigation.navigate('Feed');
      }, 2000);

    } catch {
      setError("Erro ao registrar ocorrência.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <CheckCircle2 size={80} color="#22c55e" className="mb-6" />
        <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">Enviado!</Text>
        <Text className="text-gray-500 text-center text-base">
          Sua ocorrência foi registrada com sucesso e já está disponível para a equipe de análise.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <View className="bg-white border-b border-gray-200 px-4 pb-4 pt-12 flex-row items-center gap-3 z-10 shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Nova Ocorrência</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {error !== "" && (
          <View className="p-4 rounded-xl bg-red-50 flex-row items-start gap-3 border border-red-200 mb-6">
            <AlertCircle size={20} color="#b91c1c" className="mt-0.5" />
            <Text className="text-sm text-red-700 flex-1 leading-relaxed">{error}</Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2">Local do Problema (Toque no mapa)</Text>
          <View className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-200 mb-2">
            <MapView
              style={{ flex: 1 }}
              region={mapRegion}
              showsUserLocation={true}
              onPress={(e) => {
                setLatitude(e.nativeEvent.coordinate.latitude);
                setLongitude(e.nativeEvent.coordinate.longitude);
              }}
            >
              {latitude && longitude && (
                <Marker coordinate={{ latitude, longitude }} />
              )}
            </MapView>
          </View>
          {latitude ? (
            <Text className="text-xs text-green-600 font-medium ml-1">✓ Local marcado com sucesso.</Text>
          ) : (
            <Text className="text-xs text-red-500 font-medium ml-1">Toque no mapa para marcar o local exato.</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2">Foto do Problema (URL)</Text>
          <View className="flex-row gap-3">
            <TextInput 
              placeholder="Cole o link da imagem aqui..."
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
              className="flex-1 h-14 bg-white border border-gray-200 rounded-xl px-4 text-gray-900"
            />
            <View className="w-14 h-14 bg-gray-100 rounded-xl items-center justify-center border border-gray-200">
              <Camera size={24} color="#9ca3af" />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2">Categoria</Text>
          {isLoadingCategories ? (
            <ActivityIndicator size="small" color="#2563eb" className="self-start py-4" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              <View className="flex-row gap-2 pr-4">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => setCategoryId(cat.id.toString())}
                    className={`px-4 py-3 rounded-xl border ${
                      categoryId === cat.id.toString() 
                        ? 'bg-blue-50 border-blue-600' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      categoryId === cat.id.toString() ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View className="mb-6 space-y-4">
          <View>
            <Text className="text-sm font-bold text-gray-700 mb-2">Título Breve</Text>
            <TextInput
              placeholder="Ex: Buraco perigoso na via"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              className="h-14 bg-white border border-gray-200 rounded-xl px-4 text-gray-900"
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</Text>
            <TextInput
              placeholder="Explique o problema e detalhes do local..."
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[120px]"
            />
          </View>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting || latitude === null}
          className={`h-14 rounded-xl flex-row items-center justify-center shadow-sm mt-4 ${
            isSubmitting || latitude === null ? 'bg-blue-300' : 'bg-blue-600'
          }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white text-lg font-bold">Enviando...</Text>
            </>
          ) : (
            <Text className="text-white text-lg font-bold">Reportar Problema</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}