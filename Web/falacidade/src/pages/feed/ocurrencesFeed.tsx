import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { User, Plus, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/ui/imageWithFallback";
import OccurrenceService, { type Occurrence, OccurrenceStatus } from "../../services/ocurrenceService";

function getStatusColor(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview:
      return "bg-amber-100 text-amber-800 border-amber-200";
    case OccurrenceStatus.InProgress:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case OccurrenceStatus.Resolved:
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusLabel(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview:
      return "Em Análise";
    case OccurrenceStatus.InProgress:
      return "Em Andamento";
    case OccurrenceStatus.Resolved:
      return "Resolvido";
    default:
      return "Desconhecido";
  }
}

export function OccurrencesFeed() {
  const navigate = useNavigate();

  // Estados para gerenciar os dados da API
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect roda uma vez quando a tela é montada
  useEffect(() => {
    async function loadOccurrences() {
      try {
        const data = await OccurrenceService.getAll();
        setOccurrences(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as ocorrências.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOccurrences();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">FalaCidade</h1>
          <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ocorrências Reportadas
        </h2>

        {/* Trata o estado de Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
            <p>Carregando ocorrências...</p>
          </div>
        )}

        {/* Trata o estado de Erro */}
        {error && !isLoading && (
          <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Feed Vazio */}
        {!isLoading && !error && occurrences.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma ocorrência reportada ainda.</p>
            <p className="text-sm mt-1">Seja o primeiro a reportar um problema!</p>
          </div>
        )}

        {/* Lista de Ocorrências Real */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {occurrences.map((occurrence) => (
              <div
                key={occurrence.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="relative h-80 bg-gray-200">
                  <ImageWithFallback
                    // Se a PhotoUrl for nula/vazia, exibe um placeholder genérico
                    src={occurrence.photoUrl || "https://placehold.co/600x400/e2e8f0/64748b?text=Sem+Foto"}
                    alt={occurrence.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-base">
                    {occurrence.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 border-gray-300"
                    >
                      {/* Mostra o nome da categoria que veio do Join com o C# */}
                      {occurrence.category?.name || "Sem Categoria"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getStatusColor(occurrence.status)}
                    >
                      {getStatusLabel(occurrence.status)}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    {/* Como não salvamos a string do endereço no banco, mostramos as coordenadas provisoriamente */}
                    <span>Lat: {occurrence.latitude.toFixed(4)}, Lng: {occurrence.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/report")}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
        aria-label="Reportar nova ocorrência"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
    </div>
  );
}