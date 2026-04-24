/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import OccurrenceService, { type Category } from "../../services/ocurrenceService";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function OccurrenceEditor() {
  const navigate = useNavigate();

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

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -23.5505, lng: -46.6333 });

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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => console.warn("GPS negado/falhou", err)
      );
    }

    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!categoryId) return setError("Por favor, selecione uma categoria.");
    if (latitude === null || longitude === null) return setError("Por favor, clique no mapa para marcar o local do problema.");

    setIsSubmitting(true);

    try {
      await OccurrenceService.create({
        citizenId: 1, 
        categoryId: Number(categoryId),
        title,
        description,
        photoUrl: photoUrl || "", 
        latitude,
        longitude
      });

      setSuccess(true);
      setTimeout(() => navigate('/feed'), 2000);

    } catch {
      setError("Erro ao registrar ocorrência.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-24 sm:py-8">
      <div className="w-full max-w-xl bg-gray-50 min-h-screen sm:min-h-0 sm:border sm:border-gray-200 sm:shadow-sm sm:rounded-3xl overflow-hidden relative flex flex-col">
        
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Nova Ocorrência</h1>
          </div>
        </header>

        <div className="p-4 flex-1 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enviado!</h2>
              <p className="text-gray-600">Sua ocorrência foi registrada e será analisada.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Local do Problema (Clique no mapa)</Label>
                <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm z-0">
                  <MapContainer 
                    center={[mapCenter.lat, mapCenter.lng]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Nosso ouvinte de cliques */}
                    <MapClickHandler 
                      onLocationSelect={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }} 
                    />
                    {/* Renderiza o pino se tivermos uma coordenada */}
                    {latitude && longitude && (
                      <Marker position={[latitude, longitude]} />
                    )}
                  </MapContainer>
                </div>
                {latitude ? (
                  <p className="text-sm text-green-600 font-medium">✅ Local marcado no mapa.</p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">⚠️ Clique no mapa para marcar o local exato.</p>
                )}
              </div>

              {/* Foto */}
              <div className="space-y-2">
                <Label>Foto do Problema</Label>
                <div className="flex gap-2">
                  <Input 
                    type="url" 
                    placeholder="Cole a URL da imagem aqui..." 
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 bg-white"
                  />
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-300">
                    <Camera className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                {isLoadingCategories ? (
                  <div className="h-12 border border-gray-300 rounded-md bg-gray-100 flex items-center px-3 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando...
                  </div>
                ) : (
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione um tipo de problema...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Buraco perigoso na via"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white"
                  required
                  maxLength={100}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada</Label>
                <textarea
                  id="description"
                  placeholder="Explique o problema e detalhes do local..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || latitude === null}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 mt-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Reportar Problema"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}