import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Loader2, AlertCircle, Inbox, Plus } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/ui/imageWithFallback";
import OccurrenceService, { type Occurrence, OccurrenceStatus } from "../../services/ocurrenceService";

function getStatusColor(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: return "bg-amber-100 text-amber-800 border-amber-200";
    case OccurrenceStatus.InProgress: return "bg-blue-100 text-blue-800 border-blue-200";
    case OccurrenceStatus.Resolved: return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusLabel(status: OccurrenceStatus) {
  switch (status) {
    case OccurrenceStatus.UnderReview: return "Em Análise";
    case OccurrenceStatus.InProgress: return "Em Andamento";
    case OccurrenceStatus.Resolved: return "Resolvido";
    default: return "Desconhecido";
  }
}

export function MyOccurrences() {
  const navigate = useNavigate();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyOccurrences() {
      try {
        const data = await OccurrenceService.getByUserId(1);
        setOccurrences(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar suas ocorrências.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMyOccurrences();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-24 sm:py-8">
      <div className="w-full max-w-xl bg-gray-50 min-h-screen sm:min-h-0 sm:border sm:border-gray-200 sm:shadow-sm sm:rounded-3xl overflow-hidden relative flex flex-col">
        
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Minhas Ocorrências</h1>
            <p className="text-xs text-gray-500">Acompanhe o status dos seus relatos</p>
          </div>
        </header>

        <div className="p-4 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Buscando seus registros...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3 border border-red-200 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!isLoading && occurrences.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <Inbox className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-lg font-semibold text-gray-900">Nenhum relato ainda</h2>
              <p className="text-sm px-8 mt-2">Você ainda não enviou nenhuma ocorrência para a prefeitura.</p>
              <button 
                onClick={() => navigate('/report')}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Criar minha primeira ocorrência
              </button>
            </div>
          )}

          <div className="space-y-6">
            {occurrences.map((occurrence) => (
              <div
                key={occurrence.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => navigate(`/occurrence/${occurrence.id}`)}
              >
                <div className="relative aspect-[4/5] w-full bg-gray-200">
                  <ImageWithFallback
                    src={occurrence.photoUrl || "https://placehold.co/600x750/e2e8f0/64748b?text=Sem+Foto"}
                    alt={occurrence.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${getStatusColor(occurrence.status)} shadow-md`}>
                      {getStatusLabel(occurrence.status)}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {occurrence.category?.name || "Geral"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 text-base leading-tight">
                    {occurrence.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">Localização marcada no mapa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/report")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 sm:fixed"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}