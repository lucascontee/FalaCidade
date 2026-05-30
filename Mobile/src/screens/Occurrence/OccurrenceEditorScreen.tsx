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
  Alert,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Camera, Image as ImageIcon, AlertCircle, CheckCircle2, Pickaxe } from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import OccurrenceService, { type Category } from "../../services/ocurrenceService";
import { useAuth } from "../../contexts/authContext";
import * as ImagePicker from 'expo-image-picker'; 


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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.3, 
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageBase64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
      setPhotoUrl(imageBase64String);
    }
  };

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
          <Text className="text-sm font-bold text-gray-700 mb-2">Foto do Problema</Text>
          
          {photoUrl ? (
            <View className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200">
              <Image source={{ uri: photoUrl }} className="w-full h-full" />
              
              <TouchableOpacity 
                onPress={pickImage}
                className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-sm"
              >
                <Camera size={20} color="#1f2937" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={pickImage}
              className="w-full aspect-[4/5] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center"
            >
              <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm mb-3">
                <ImageIcon size={28} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-medium">Toque para adicionar foto</Text>
              <Text className="text-gray-400 text-xs mt-1">Galeria do celular</Text>
            </TouchableOpacity>
          )}
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